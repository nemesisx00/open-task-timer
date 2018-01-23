'use strict'

const fs = require('fs')
const {BrowserWindow, dialog} = require('electron')
const Task = require('./Task')
const Util = require('./Util')

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

const writeData = (window, path, data, truncate) => {
	if(truncate)
	{
		fs.truncate(path, err1 => {
			if(err1)
				throw err1
			
			fs.writeFile(path, JSON.stringify(data), err2 => {
				if(err2)
					throw err2
				
				global.activePath = path
				window.webContents.send('task-saved', path)
			})
		})
	}
	else
	{
		fs.writeFile(path, JSON.stringify(data), err => {
			if(err)
				throw err
			
			global.activePath = path
			window.webContents.send('task-saved', path)
		})
	}
}

class Data
{
	static loadTasksFromFile(opts)
	{
		let out = {
			tasks: [],
			path: null
		}
		let window = BrowserWindow.getFocusedWindow()
		let options = Util.deepMerge(defaultOpenOptions, opts)
		let path = dialog.showOpenDialog(window, options)
		
		if(path)
		{
			path = path[0]
			out.path = path
			fs.readFile(path, (err, data) => {
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
							{
								out.tasks.push(task)
								window.webContents.send('task-created', task)
							}
						})
					}
					else
					{
						let task = createTaskFromObj(json)
						if(task)
						{
							out.tasks.push(task)
							window.webContents.send('task-created', task)
						}
					}
				}
			})
		}
		
		return out
	}
	
	static saveTasksToFile(tasks, activePath)
	{
		let window = BrowserWindow.getFocusedWindow()
		let path = activePath
		
		let exists = fs.existsSync(path)
		if(!exists)
			path = dialog.showSaveDialog(window, defaultSaveOptions)
		
		writeData(window, path, tasks, exists)
	}
}

module.exports = Data
