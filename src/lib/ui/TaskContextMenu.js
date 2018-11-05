'use strict'

const {getGlobal} = require('electron').remote

const Sender = load('event/BrowserSender')
const Util = load('Util')

const mouseOutTimeout = 3000
const generateMenuItem = (label, handler) => {
	let item = Util.createElement('div', {
		className: 'item shrink',
		innerHTML: label
	})
	
	item.addEventListener('click', handler)
	
	return item
}

class TaskContextMenu
{
	constructor(id)
	{
		if(id)
			this.id = id
		
		this.element = this._generateMenu(this.id)
		this.taskElement = null
		this.hideTimeout = null
	}
	
	_generateMenu(id)
	{
		let menu = Util.createElement('div', { className: 'contextMenu hidden', id: id ? id : '' })
		
		let self = this
		let items = [
			generateMenuItem('View Time Spans', e => {
				e.preventDefault()
				if(self.taskElement)
				{
					let taskId = parseInt(self.taskElement.id.replace('task-', ''))
					if(!Number.isNaN(taskId))
						Sender.taskView(taskId)
				}
				self.hide()
			}),
			
			generateMenuItem('Move Up', e => {
				e.preventDefault()
				if(self.taskElement.previousElementSibling)
					self.taskElement.previousElementSibling.before(self.taskElement)
				self.hide()
			}),
			
			generateMenuItem('Move Down', e => {
				e.preventDefault()
				if(self.taskElement.nextElementSibling)
					self.taskElement.nextElementSibling.after(self.taskElement)
				self.hide()
			})
		]
		
		items.forEach(el => {
			el.addEventListener('mouseover', e => {
				e.preventDefault()
				if(self.hideTimeout)
					clearTimeout(self.hideTimeout)
			})
			el.addEventListener('mouseout', e => {
				e.preventDefault()
				if(self.hideTimeout)
					clearTimeout(self.hideTimeout)
				self.hideTimeout = setTimeout(() => self.hide(), mouseOutTimeout)
			})
			menu.appendChild(el)
		})
		
		document.querySelector('body').appendChild(menu)
		
		return menu
	}
	
	attach(selector, x, y)
	{
		let el = Util.elementOrSelector(selector)
		if(el && x && y)
		{
			this.taskElement = el
			this.show(x, y)
		}
	}
	
	show(x, y)
	{
		this.element.style.left = `${x}px`
		this.element.style.top = `${y}px`
		Util.removeClassName(this.element, 'hidden')
	}
	
	hide()
	{
		Util.addClassName(this.element, 'hidden')
	}
}

module.exports = TaskContextMenu
