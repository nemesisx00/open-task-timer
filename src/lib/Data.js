'use strict'

const fs = require('fs')
const {dialog} = require('electron')

const Sender = load('event/MainSender')
const Task = load('model/Task')
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

const handleCreatedTask = (webContents, obj) => {
	let task = Task.fromJson(obj)
	if(task)
	{
		global.tasks.push(task)
		Sender.taskCreated(webContents, task.id)
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
		
		if(browserWindow && path)
		{
			path = path[0]
			fs.readFile(path, (err, data) => {
				if (err)
					throw err
				
				global.state.activePath = path
				global.tasks = []
				Sender.tasksClear(browserWindow.webContents)
				
				let json = JSON.parse(data)
				if(typeof json === 'object')
				{
					if(Array.isArray(json))
						json.forEach(obj => handleCreatedTask(browserWindow.webContents, obj))
					else
						handleCreatedTask(browserWindow.webContents, json)
				}
			})
		}
		
		return path
	}
	
	static saveTasksToFile(browserWindow, tasks, activePath, synchronous)
	{
		let path = activePath
		
		let exists = fs.existsSync(path)
		if(!exists && browserWindow)
			path = dialog.showSaveDialog(browserWindow, defaultSaveOptions)
		
		if(path)
		{
			let options = {
				truncate: exists,
				synchronous: synchronous
			}
			Util.writeFile(path, JSON.stringify(tasks), options, err => {
				if(err)
					throw err
				
				global.state.needsToSave = false
				global.state.activePath = path
			})
		}
		
		return path
	}
}

module.exports = Data
