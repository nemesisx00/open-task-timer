
const {app, ipcMain, Menu, BrowserWindow} = require('electron')
const path = require('path')
const json = require('../../package.json')
const menuTemplate = require('./lib/MainMenu')

const Task = require('./lib/Task')

global.activePath = null
global.tasks = []

ipcMain.on('task-new', (event, arg) => {
	if(arg && arg.title && typeof arg.title === 'string' && !global.tasks.find(t => t.title === arg.title))
	{
		let duration = Number.parseInt(arg.duration)
		if(Number.isNaN(duration))
			duration = 0
		
		let id = global.tasks.reduce((acc, val) => val.id > acc ? val.id : acc, 0) + 1
		
		let task = new Task(id, arg.title, duration)
		
		global.tasks.push(task)
		event.sender.send('task-created', task)
	}
})

//Update a task's duration if it exists in the global tasks list
ipcMain.on('task-update', (event, arg) => {
	if(arg && arg.title)
	{
		let task = global.tasks.find(t => t.title === arg.title)
		if(task)
			task.duration = arg.duration
	}
})

app.on('ready', () => {
	var window = new BrowserWindow({
		title: json.settings.title,
		width: json.settings.width,
		height: json.settings.height
	})
	
	window.setMinimumSize(json.settings.minWidth, json.settings.minHeight)
	
	const menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)
	
	window.loadURL('file://' + path.join(__dirname, '..', '..') + '/index.html')
	
	window.on('closed', () => {
		window = null
	})
	
	ipcMain.on('log', (event, arg) => {
		console.log('')
		console.log(arg)
		console.log('')
	})
})
