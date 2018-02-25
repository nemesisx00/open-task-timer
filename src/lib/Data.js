'use strict'
/* global load */

const fs = require('fs')
const {dialog} = require('electron')

const Sender = load('event/MainSender')
const Task = load('task/Task')
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
					Sender.taskSaved(browserWindow.webContents, path)
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
				Sender.taskSaved(browserWindow.webContents, path)
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
		
		if(browserWindow && path)
		{
			path = path[0]
			fs.readFile(path, (err, data) => {
				if (err)
					throw err
				
				global.tasks = []
				Sender.tasksClear(browserWindow.webContents)
				
				let json = JSON.parse(data)
				if(typeof json === 'object')
				{
					if(Array.isArray(json))
					{
						json.forEach(obj => {
							let task = Task.fromJson(obj)
							if(task)
							{
								global.tasks.push(task)
								Sender.taskCreated(browserWindow.webContents, task)
							}
						})
					}
					else
					{
						let task = Task.fromJson(json)
						if(task)
						{
							global.tasks.push(task)
							Sender.taskCreated(browserWindow.webContents, task)
						}
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
