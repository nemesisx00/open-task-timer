'use strict'

const fs = require('fs')
const {BrowserWindow, dialog} = require('electron')
const Sender = require('./Sender')
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
				Sender.taskSaved(window.webContents, path)
			})
		})
	}
	else
	{
		fs.writeFile(path, JSON.stringify(data), err => {
			if(err)
				throw err
			
			global.activePath = path
			Sender.taskSaved(window.webContents, path)
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
							let task = Task.fromJson(obj)
							if(task)
							{
								out.tasks.push(task)
								Sender.taskCreated(window.webContents, task)
							}
						})
					}
					else
					{
						let task = Task.fromJson(json)
						if(task)
						{
							out.tasks.push(task)
							Sender.taskCreated(window.webContents, task)
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
		
		writeData(window, path, tasks.map(t => t.toJson()), exists)
	}
}

module.exports = Data
