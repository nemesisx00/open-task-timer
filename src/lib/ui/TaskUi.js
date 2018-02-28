'use strict'

const moment = require('moment')
require('moment-duration-format')
const {getGlobal} = require('electron').remote

const Sender = load('event/BrowserSender')
const Util = load('Util')

const timestampFormat = 'Y-MM-DD HH:mm:ss'
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
		if(!self.active)
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

class TaskUi
{
	constructor(taskId, options)
	{
		this.taskId = taskId
		
		this.elapsed = 0
		this.lastStart = null
		this.currentSpanId = null
		this.timer = null
		
		this.delay = options && typeof options.delay === 'number' ? options.delay : defaultDelay
		this.formatter = options && typeof options.formatter === 'function' ? options.formatter : defaultFormatter
		
		let task = getGlobal('tasks').find(t => t.id === this.taskId)
		this.elements = generateElements(this, `task-${task.id}`, task.title, this.formatter(task.duration), false)
	}
	
	append()
	{
		if(!document.getElementById(`task-${this.taskId}`))
			document.getElementById('container').append(this.elements.main)
	}
	
	get active() { return this.timer != null }
	
	start()
	{
		let task = getGlobal('tasks').find(t => t.id === this.taskId)
		this.currentSpanId = task.spans.length + 1
		Sender.taskSpanNew(this.taskId, this.currentSpanId, moment().format(timestampFormat))
		this.timer = setInterval(() => this.updateDisplay(), this.delay)
		this.toggleActive()
		
		return this
	}
	
	stop()
	{
		if(this.timer != null)
			clearInterval(this.timer)
		
		this.timer = null
		this.toggleActive()
		Sender.taskSpanUpdate(this.taskId, this.currentSpanId, moment().format(timestampFormat))
		this.updateDisplay()
		
		return this
	}
	
	/**
	 * Update the task's current TimeSpan on the backend without stopping the timer.
	 */
	autoSaveTask()
	{
		let task = getGlobal('tasks').find(t => t.id === this.taskId)
		let span = task.spans.find(s => s.id === this.currentSpanId)
		span._end = moment()
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
		{
			let task = getGlobal('tasks').find(t => t.id === this.taskId)
			this.elements.elapsed.innerHTML = this.formatter(task.duration)
		}
	}
}

module.exports = TaskUi
