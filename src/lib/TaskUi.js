'use strict'

const {ipcRenderer} = require('electron')

const defaultDelay = 1000

const defaultFormatter = duration => {
	let out = ''
	if(typeof duration === 'number')
	{
		let hours = 0
		let minutes = 0
		let seconds = duration
		
		if(seconds > 60)
		{
			minutes = Math.floor(seconds / 60)
			seconds = seconds % 60
		}
		
		if(minutes > 60)
		{
			hours = Math.floor(minutes / 60)
			minutes = minutes % 60
		}
		
		hours = `${hours}`.padStart(2, 0)
		minutes = `${minutes}`.padStart(2, 0)
		seconds = `${seconds}`.padStart(2, 0)
		
		out = `${hours}:${minutes}:${seconds}`
	}
	
	return out
}

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
	let now = Date.now()
	if(typeof start === 'number' && start < now)
		change = Math.floor((now - start) / 1000)
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
		this.lastStart = Date.now()
		
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
		this.task.duration += this.elapsed
		this.elapsed = 0
		
		toggleActive(this.elements, false)
		
		if(!skipUpdate)
			ipcRenderer.send('task-update', this.task)
		
		return this
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
