'use strict'

/* global load */

const fs = require('fs')
const {dialog} = require('electron')
const Task = load('Task')
const Util = load('Util')

const defaultOpenOptions = Object.freeze({
	title: 'Open Tasks File',
	filters: [
		{ name: 'Task Files', extensions: [ 'ottd' ] },
		{ name: 'JSON Files', extensions: [ 'json' ] },
		{ name: 'All Files', extensions: [ '*' ] }
	],
	properties: [ 'openFile' ]
})

const defaultSaveOptions = Object.freeze({
	title: 'Save Tasks File',
	filters: [
		{ name: 'Task Files', extensions: [ 'ottd' ] },
		{ name: 'JSON Files', extensions: [ 'json' ] },
		{ name: 'All Files', extensions: [ '*' ] }
	]
})

const createTaskFromObj = obj => {
	let task = null
	
	let id = Number.parseInt(obj.id)
	let duration = Number.parseInt(obj.duration)
	
	if(obj && !Number.isNaN(id) && id > 0 && typeof obj.title === 'string' && !Number.isNaN(duration))
	{
		task = new Task(id, obj.title, duration)
	}
	
	return task
}

const writeData = (path, data, truncate, browserWindow) => {
	if(truncate)
	{
		fs.truncate(path, err1 => {
			if(err1)
				throw err1
			
			fs.writeFile(path, JSON.stringify(data), err2 => {
				if(err2)
					throw err2
				
				global.activePath = path
				if(browserWindow)
					browserWindow.webContents.send('task-saved', path)
			})
		})
	}
	else
	{
		fs.writeFile(path, JSON.stringify(data), err => {
			if(err)
				throw err
			
			global.activePath = path
			if(browserWindow)
				browserWindow.webContents.send('task-saved', path)
		})
	}
}

class Data
{
	/**
	 * 
	 */
	static loadTasksFromFile(browserWindow, opts)
	{
		let options = Util.deepMerge(defaultOpenOptions, opts)
		let path = dialog.showOpenDialog(browserWindow, options)
		
		if(path)
		{
			path = path[0]
			fs.readFile(path, (err, data) => {
				if (err)
					throw err
				
				browserWindow.webContents.send('tasks-clear')
				
				let json = JSON.parse(data)
				if(typeof json === 'object')
				{
					if(Array.isArray(json))
					{
						json.forEach(obj => {
							let task = createTaskFromObj(obj)
							if(task)
								browserWindow.webContents.send('task-created', task)
						})
					}
					else
					{
						let task = createTaskFromObj(json)
						if(task)
							browserWindow.webContents.send('task-created', task)
					}
				}
			})
		}
		
		return path
	}
	
	static saveTasksToFile(browserWindow, tasks, activePath)
	{
		let path = activePath
		
		let exists = fs.existsSync(path)
		if(!exists && browserWindow)
			path = dialog.showSaveDialog(browserWindow, defaultSaveOptions)
		
		if(path)
			writeData(path, tasks, exists, browserWindow)
		
		return path
	}
}

module.exports = Data
