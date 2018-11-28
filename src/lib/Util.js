'use strict'

const fs = require('fs')
const moment = require('moment')
require('moment-duration-format')
const path = require('path')

const defaultWriteFileOptions = {
	truncate: false,
	synchronous: false
}

const dateFormat = 'Y-MM-DD'
const timestampFormat = 'Y-MM-DD HH:mm:ss'
const timeFormat = 'y [years] d [days] hh:mm:ss'
const timeOptions = Object.freeze({
	forceLength: true,
	useGrouping: false,
	stopTrim: 'h'
})

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
	 * 
	 */
	static formatDate(date, format)
	{
		if(!date)
			return null
		
		if(!format)
			format = Util.Format_FullTimestamp
		
		return date.format(format)
	}
	
	/**
	 * 
	 */
	static formatDuration(duration, format, options)
	{
		if(!duration)
			return null
		
		if(!format)
			format = Util.Format_DurationTime
		if(!options)
			options = Util.Format_DurationTime_Options
		
		return duration.format(format, options)
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

Util.Format_FullDate = dateFormat
Util.Format_FullTimestamp = timestampFormat
Util.Format_DurationTime = timeFormat
Util.Format_DurationTime_Options = timeOptions

module.exports = Util
