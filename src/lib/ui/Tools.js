'use strict'

const path = require('path')
const {BrowserWindow} = require('electron')

const OneTimeEvents = load('event/OneTimeEvents')
const Util = load('Util')

const classNameSeparator = ' '

class Tools
{
	/**
	 * Create a new instance of Element.
	 * @static
	 * @param {string} tag The tag of the element to be created.
	 * @param {object} attributes (Optional) The object containing any custom attributes to be set on the new element.
	 * @return {Element} Returns the new instance of Element.
	 */
	static createElement(tag, attributes)
	{
		return Object.assign(document.createElement(tag), attributes)
	}
	
	/**
	 * Create a window for viewing/editing a task.
	 */
	static createTaskWindow(task)
	{
		let width = 480
		let height = 360
		
		let window = new BrowserWindow({
			width,
			height,
			parent: global.mainWindow,
			modal: true,
			title: `Task - ${task.title}`,
			show: false
		})
		window.setMinimumSize(width, height)
		window.setMenu(null)
		window.loadURL('file://' + path.join(global.viewPath, 'task.html'))
		window.once('ready-to-show', () => {
			window.webContents.send(OneTimeEvents.viewTask, { task })
			window.show()
			window.toggleDevTools()
		})
	}
	
	/**
	 * Dispatch an event on an element.
	 * @static
	 * @param {string|Element} selector The element to which to add the class name.
	 * @param {string|Event} eventName The event name, or instance of Event, to be dispatched on the element.
	 */
	static dispatch(selector, eventName)
	{
		let el = Tools.elementOrSelector(selector)
		let evt = eventName
		if(Util.checkType(evt, 'string'))
			evt = new Event(eventName)
		
		if(el && evt)
			el.dispatchEvent(evt)
	}
	
	/**
	 * Normalize selectors and elements to an instance of Element.
	 * @static
	 * @param {string|Element} selector The element to select.
	 * @return {Element} The selected element. May be null.
	 */
	static elementOrSelector(selector)
	{
		let el = selector
		if(Util.checkType(selector, 'string'))
			el = document.querySelector(selector.trim())
		return el
	}
	
	/**
	 * Add one or more class names to an element.
	 * @static
	 * @param {string|Element} selector The element to which to add the class name.
	 * @param {string|array} className The class name, or list of class names, to be added to the element.
	 */
	static addClassName(selector, className)
	{
		let toAdd = [className]
		if(Array.isArray(className))
			toAdd = Array.from(className)
		
		let el = Tools.elementOrSelector(selector)
		if(el)
		{
			let existing = el.className.split(classNameSeparator)
			for(let c of toAdd)
			{
				if(existing.indexOf(c) < 0)
					existing.push(c)
			}
			
			el.className = existing.join(classNameSeparator).trim()
		}
	}
	
	/**
	 * Check whether or not an element has been assigned a class name.
	 * Note: Unlike the other Util class name methods, this one only handles one class name at a time.
	 * @static
	 * @param {string|Element} selector The element to which to add the class name.
	 * @param {string} className The class name to be added to the element.
	 */
	static hasClassName(selector, className)
	{
		let el = Tools.elementOrSelector(selector)
		let out = false
		if(el)
		{
			let names = el.className.split(classNameSeparator)
			out = names.find(n => n.trim() === className.trim())
		}
		
		return out
	}
	
	/**
	 * Remove one or more class names from an element.
	 * @static
	 * @param {string|Element} selector The element from which to remove the class name.
	 * @param {string|array} className The class name, or list of class names, to be removed from the element.
	 */
	static removeClassName(selector, className)
	{
		let toRemove = [className]
		if(Array.isArray(className))
			toRemove = Array.from(className)
		
		let el = Tools.elementOrSelector(selector)
		if(el)
		{
			let existing = el.className.split(classNameSeparator)
			for(let c of toRemove)
			{
				let removeIndex = existing.indexOf(c)
				if(removeIndex > -1 && removeIndex < existing.length)
					existing.splice(removeIndex, 1)
			}
			
			el.className = existing.join(classNameSeparator).trim()
		}
	}
	
	/**
	 * Add and/or remove one or more class names to/from an element.
	 * @static
	 * @param {string|Element} selector The element whose class names are being modified.
	 * @param {string|array} add The class name, or list of class names, to be added to the element.
	 * @param {string|array} remove The class name, or list of class names, to be removed from the elmeent.
	 */
	static swapClassName(selector, add, remove)
	{
		Tools.removeClassName(selector, remove)
		Tools.addClassName(selector, add)
	}
	
	/**
	 * Toggle one or more class names on an element.
	 * Adds any of the given class names which don't match any already assigned classes.
	 * Removes any of the given class names which do match any already assigned classes.
	 * @static
	 * @param {string|Element} selector The element whose class names are being modified.
	 * @param {string|array} className The class name, or list of class names, to be removed from the element.
	 */
	static toggleClassName(selector, className)
	{
		let list = [className]
		if(Array.isArray(className))
			list = Array.from(className)
		
		list.forEach(cn => {
			if(Tools.hasClassName(selector, cn))
				Tools.removeClassName(selector, cn)
			else
				Tools.addClassName(selector, cn)
		})
	}
}

module.exports = Tools
