'use strict'

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

const generateHtml = (label, currentElapsed, active) => {
	let labelDiv = Object.assign(document.createElement('div'), {
		className: 'label',
		innerHTML: label
	})
	
	let elapsed = Object.assign(document.createElement('div'), {
		className: 'elapsed',
		innerHTML: currentElapsed
	})
	
	let button = Object.assign(document.createElement('div'), {
		className: 'button',
		innerHTML: active ? 'Stop' : 'Start'
	})
	
	let out = Object.assign(document.createElement('div'), {
		className: 'row'
	})
	out.append(labelDiv)
	out.append(elapsed)
	out.append(button)
	
	return out
}

const getDifference = start => {
	let change = 0
	let now = Date.now()
	if(typeof start === 'number' && start < now)
		change = Math.floor((now - start) / 1000)
	return change
}

const toggleActive = (elements, isActive) => {
	if(elements.button == null && elements.main != null)
	{
		let el = document.querySelector(`#${elements.main.id} .button`)
		if(el && el instanceof Element)
			elements.button = el
	}
	
	if(elements.button != null)
		elements.button.innerHTML = isActive ? 'Stop' : 'Start'
}

class Task
{
	constructor(id, title, options)
	{
		this.id = id
		this.title = title
		this.duration = 0
		this.elapsed = 0
		
		this.elements = {
			main: null,
			elapsed: null,
			button: null
		}
		
		this.lastStart = null
		this.timer = null
		
		this.delay = options && typeof options.delay === 'number' ? options.delay : defaultDelay
		this.formatter = options && typeof options.formatter === 'function' ? options.formatter : defaultFormatter
		
		if(options && options.generateRow)
		{
			this.elements.main = generateHtml(this.title, this.formatter(this.duration), false)
			this.elements.main.id = `task-${this.id}`
			document.querySelector('body').append(this.elements.main)
			
		}
	}
	
	bind(selector)
	{
		if(selector && typeof selector === 'string')
		{
			let el = document.querySelector(selector)
			if(el instanceof Element)
			{
				this.elements.main = el
				this.elements.main.id = `task-${this.id}`
			}
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
			this.elements.elapsed.innerHTML = this.formatter(this.duration + this.elapsed)
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
	
	stop()
	{
		if(this.timer != null)
			clearInterval(this.timer)
		
		//Do one final update, just in case
		this.updateDisplay()
		
		this.timer = null
		this.lastStart = null
		this.duration += this.elapsed
		this.elapsed = 0
		
		toggleActive(this.elements, false)
		
		return this
	}
}

module.exports = Task
