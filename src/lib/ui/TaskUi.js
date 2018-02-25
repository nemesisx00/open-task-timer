'use strict'
/* global load */

const moment = require('moment')
require('moment-duration-format')

const Sender = load('event/BrowserSender')
const Util = load('Util')

const timestampFormat = 'Y-MM-DD hh:mm:ss'
const timeFormat = 'y [years] d [days] hh:mm:ss'
const timeOptions = {
	forceLength: true,
	useGrouping: false,
	stopTrim: 'h'
}

const defaultDelay = 1000
const defaultFormatter = duration => moment.duration(duration, 'seconds').format(timeFormat, timeOptions)

const generateElements = (self, id, title, currentElapsed, active) => {
	let labelDiv = Object.assign(document.createElement('div'), {
		className: 'title',
		innerHTML: title
	})
	
	let elapsed = Object.assign(document.createElement('div'), {
		className: 'elapsed',
		innerHTML: currentElapsed
	})
	
	let button = Object.assign(document.createElement('div'), {
		className: 'button' + (active ? ' active' : '')
	})
	
	button.addEventListener('click', () => {
		if(!self.isActive())
			self.start()
		else
			self.stop()
	})
	
	let out = Object.assign(document.createElement('div'), {
		className: 'row task'
	})
	out.id = id
	
	out.append(labelDiv)
	out.append(elapsed)
	out.append(button)
	
	return {
		main: out,
		elapsed: elapsed,
		button: button
	}
}

const updateSpan = (task, id, times) => {
	if(task && id && times)
	{
		if(!Array.isArray(task.spans))
			task.spans = []
		
		let span = task.spans.find(s => s.id === id)
		if(!span)
		{
			span = { id: id }
			task.spans.push(span)
		}
		
		if(times.start)
			span.start = times.start
		
		if(times.end)
			span.end = times.end
	}
}

const getDifference = start => {
	let change = 0
	let m1 = moment(start)
	if(m1.isValid())
		change = moment().diff(m1, 'seconds')
	
	return change
}

const calculateTotalTime = task => {
	return task.spans.reduce((acc, val) => {
		let addition = val.end ? val.end.diff(val.start, 'seconds') : moment().diff(val.start, 'seconds')
		return acc + addition
	}, 0)
}

class TaskUi
{
	constructor(task, options)
	{
		this.task = task
		
		this.elapsed = 0
		this.lastStart = null
		this.currentSpanId = null
		this.timer = null
		
		this.delay = options && typeof options.delay === 'number' ? options.delay : defaultDelay
		this.formatter = options && typeof options.formatter === 'function' ? options.formatter : defaultFormatter
		
		this.elements = generateElements(this, `task-${this.task.id}`, this.task.title, this.formatter(this.task.duration), false)
	}
	
	append()
	{
		document.getElementById('container').append(this.elements.main)
	}
	
	isActive()
	{
		return this.timer != null
	}
	
	start()
	{
		this.lastStart = moment()
		this.currentSpanId = this.task.spans.length + 1
		
		updateSpan(this.task, this.currentSpanId, { start: this.lastStart })
		Sender.taskSpanNew(this.task.id, this.currentSpanId, this.lastStart.format(timestampFormat))
		
		let self = this
		this.timer = setInterval(() => {
			self.elapsed = getDifference(self.lastStart)
			self.updateDisplay()
		}, this.delay)
		
		this.toggleActive()
		
		return this
	}
	
	stop()
	{
		if(this.timer != null)
			clearInterval(this.timer)
		
		//Do one final update, just in case
		this.updateDisplay()
		
		this.timer = null
		this.lastStart = null
		this.toggleActive()
		
		let end = moment()
		updateSpan(this.task, this.currentSpanId, { end: end })
		Sender.taskSpanUpdate(this.task.id, this.currentSpanId, end.format(timestampFormat))
		
		return this
	}
	
	/**
	 * Update the task's current TimeSpan on the backend without stopping the timer.
	 */
	autoSaveTask()
	{
		Sender.taskSpanUpdate(this.task.id, this.currentSpanId, moment().format(timestampFormat))
	}
	
	toggleActive()
	{
		if(this.elements.button == null && this.elements.main != null)
		{
			let el = document.querySelector(`#${this.elements.main.id} .button`)
			if(el && el instanceof Element)
				this.elements.button = el
		}
		
		Util.toggleClassName(this.elements.button, 'active')
	}
	
	updateDisplay()
	{
		if(this.elements.elapsed == null && this.elements.main != null)
		{
			let el = document.querySelector(`#${this.elements.main.id} .elapsed`)
			if(el && el instanceof Element)
				this.elements.elapsed = el
		}
		
		if(this.elements.elapsed != null)
			this.elements.elapsed.innerHTML = this.formatter(calculateTotalTime(this.task))
	}
}

module.exports = TaskUi
