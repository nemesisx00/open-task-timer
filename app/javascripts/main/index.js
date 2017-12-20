
const {app, ipcMain, Menu, BrowserWindow} = require('electron')
const path = require('path')
const json = require('../../package.json')
const menuTemplate = require('./lib/MainMenu')

const Task = require('./lib/Task')

let tasks = []

ipcMain.on('task-new', (event, arg) => {
	if(arg && arg.title && typeof arg.title === 'string' && !tasks.find(t => t.title === arg.title))
	{
		let duration = Number.parseInt(arg.duration)
		if(Number.isNaN(duration))
			duration = 0
		
		let id = tasks.reduce((acc, val) => val.id > acc ? val.id : acc, 0) + 1
		
		let task = new Task(id, arg.title, duration)
		
		tasks.push(task)
		event.sender.send('task-created', task)
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
