'use strict'
/* global load */

const moment = require('moment')
require('moment-duration-format')

const Sender = load('event/BrowserSender')

const timestampFormat = 'Y-MM-DD hh:mm:ss'
const timeFormat = 'h:mm:ss'
const timeOptions = {
	useGrouping: false
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

const getDifference = start => {
	let change = 0
	let m1 = moment(start)
	if(m1.isValid())
		change = moment().diff(m1).asSeconds()
	
	return change
}

const toggleActive = (elements, isActive) => {
	elements.button.className = elements.button.className.replace('active').trim()
	if(isActive)
		elements.button.className += ' active'
}

class TaskUi
{
	constructor(task, options)
	{
		this.task = task
		
		this.elapsed = 0
		this.lastStart = null
		this.spanId = null
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
		this.spanId = this.task.span.length + 1
		
		Sender.taskSpanNew(this.task.id, this.spanId, this.lastStart.format(timestampFormat))
		
		let self = this
		this.timer = setInterval(() => {
			self.elapsed = getDifference(self.lastStart)
			self.updateDisplay()
		}, this.delay)
		
		toggleActive(this.elements, true)
		
		return this
	}
	
	stop(skipUpdate)
	{
		if(this.timer != null)
			clearInterval(this.timer)
		
		//Do one final update, just in case
		this.updateDisplay()
		
		this.timer = null
		this.lastStart = null
		
		if(!skipUpdate)
			this.saveTask()
		
		Sender.taskSpanUpdate(this.task.id, this.spanId, moment().format(timestampFormat))
		
		return this
	}
	
	saveTask()
	{
		this.task.duration += this.elapsed
		this.elapsed = 0
		
		//ipcRenderer.send('task-update', this.task)
	}
	
	toggleActive(active)
	{
		if(this.elements.button == null && this.elements.main != null)
		{
			let el = document.querySelector(`#${this.elements.main.id} .button`)
			if(el && el instanceof Element)
				this.elements.button = el
		}
		
		if(this.elements.button != null)
		{
			this.elements.button.className = this.elements.button.className.replace('active').trim()
			if(active)
				this.elements.button.className += ' active'
		}
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
			this.elements.elapsed.innerHTML = this.formatter(this.task.duration + this.elapsed)
	}
}

module.exports = TaskUi
