'use strict'

const fs = require('fs')
const {BrowserWindow, dialog} = require('electron')
const Task = require('./Task')
const Util = require('./Util')

const defaultOpenOptions = Object.freeze({
	title: 'Open Tasks File',
	filters: [
		{ name: 'Task Files', extensions: [ 'json' ] },
		{ name: 'All Files', extensions: [ '*' ] }
	],
	properties: [ 'openFile' ]
})

const choosePath = (window, opts) => {
	let options = Util.deepMerge(defaultOpenOptions, opts)
	return dialog.showOpenDialog(window, options)
}

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

class Data
{
	static loadTasksFromFile()
	{
		let path = choosePath()
		if(path)
		{
			fs.readFile(path[0], (err, data) => {
				if (err)
					throw err
				
				let json = JSON.parse(data)
				if(typeof json === 'object')
				{
					if(Array.isArray(json))
					{
						json.forEach(obj => {
							let task = createTaskFromObj(obj)
							if(task)
								BrowserWindow.getFocusedWindow().webContents.send('task-created', task)
						})
					}
					else
					{
						let task = createTaskFromObj(json)
						if(task)
							BrowserWindow.getFocusedWindow().webContents.send('task-created', task)
					}
				}
			})
		}
	}
}

module.exports = Data
