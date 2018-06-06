'use strict'

const fs = require('fs')
const path = require('path')

const classNameSeparator = ' '
const defaultWriteFileOptions = {
	truncate: false,
	synchronous: false
}

class Util
{
	/**
	 * Validate the type of a variable or class instance.
	 * @static
	 * @param {mixed} instance The variable or class instance being validated.
	 * @param {string} expected The expected type or class name.
	 * @return {bool} Returns boolean TRUE if, and only if, the instance's type or class name matches the expected value. Otherwise, returns boolean FALSE.
	 */
	static checkType(instance, expected)
	{
		let out = false
		if(instance !== undefined)
		{
			out = typeof instance === expected
			if(!out && typeof instance === 'object')
			{
				out = (Array.isArray(instance) && expected === 'array')
					|| (instance.constructor && instance.constructor.name === expected)
			}
		}
		
		return out
	}
	
	/**
	 * Merge objects together into a new object. Recurses through sub-objects to merge at all levels.
	 * Right-most objects in the parameter list will overwrite existing values.
	 * @static
	 * @param {object} objs... Arbitrary list of objects to merge together
	 * @return {object} Returns a new object containing the merged contents.
	 */
	static deepMerge()
	{
		let args = Array.from(arguments)
		let out = {}
		
		for(let obj of args)
		{
			if(obj && typeof obj === 'object' && !Array.isArray(obj))
			{
				for(let key in obj)
				{
					let prop = obj[key]
					if(typeof prop === 'object' && !Array.isArray(prop))
						out[key] = Util.deepMerge(out[key], prop)
					else
						out[key] = prop
				}
			}
		}
		
		return out
	}
	
	/**
	 * Dispatch an event on an element.
	 * @static
	 * @param {string|Element} selector The element to which to add the class name.
	 * @param {string|Event} eventName The event name, or instance of Event, to be dispatched on the element.
	 */
	static dispatch(selector, eventName)
	{
		let el = selector
		if(Util.checkType(selector, 'string'))
			el = document.querySelector(selector.trim())
		
		let evt = eventName
		if(Util.checkType(evt, 'string'))
			evt = new Event(eventName)
		
		if(el)
			el.dispatchEvent(evt)
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
		
		let el = selector
		if(Util.checkType(selector, 'string'))
			el = document.querySelector(selector.trim())
		
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
		let el = selector
		if(Util.checkType(selector, 'string'))
			el = document.querySelector(selector.trim())
		
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
		
		let el = selector
		if(Util.checkType(selector, 'string'))
			el = document.querySelector(selector.trim())
		
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
		Util.removeClassName(selector, remove)
		Util.addClassName(selector, add)
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
			if(Util.hasClassName(selector, cn))
				Util.removeClassName(selector, cn)
			else
				Util.addClassName(selector, cn)
		})
	}
	
	/**
	 * Write data to a file.
	 * @static
	 * @param {string} file The path to which to write.
	 * @param {array|object|string} data The data to be written.
	 * @param {boolean|object|function} options (Optional) Expected options:
	 *		- truncate: Whether or not file is truncated before writing.
	 *		- synchronous: Whether or not operation uses synchronous functions.
	 *
	 *	If boolean, assumed to toggle truncate option.
	 *
	 *	If function, assumed to be the callback.
	 * @param {function} callback (Optional) Function to call after write operation has been executed.
	 *	Defaults to function which throws the first parameter if it exists.
	 */
	static writeFile(file, data, options, callback)
	{
		let writePath = path.normalize(file)
		if(!data)
			throw 'No data to write'
		
		if(options && ['boolean', 'function', 'object'].indexOf(typeof options) < 0)
			throw {
				message: 'Invalid argument: `options`',
				value: options
			}
		
		if(!options)
			options = defaultWriteFileOptions
		else if(typeof options === 'function')
		{
			callback = options
			options = defaultWriteFileOptions
		}
		else if(typeof options === 'boolean')
		{
			options = {
				truncate: options,
				synchronous: false
			}
		}
		
		if(!callback)
		{
			callback = err => {
				if(err)
					throw err
			}
		}
		
		if(options.synchronous)
		{
			if(options.truncate)
				fs.truncateSync(writePath)
			fs.writeFileSync(writePath, data)
			
			if(callback)
				callback()
		}
		else
		{
			if(options.truncate)
			{
				fs.truncate(writePath, truncErr => {
					if(truncErr)
						throw truncErr
					
					fs.writeFile(writePath, data, callback)
				})
			}
			else
				fs.writeFile(writePath, data, callback)
		}
	}
}

module.exports = Util
