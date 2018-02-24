/* global load */

require('./init')
const {app, dialog, ipcMain, Menu, BrowserWindow} = require('electron')
const path = require('path')
const menuTemplate = load('MainMenu')

const Data = load('Data')
const Task = load('Task')

global.activePath = null
global.mainWindow = null
global.tasks = []

//Create a new task instance
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

ipcMain.on('auto-save', () => {
	if(global.activePath)
		Data.saveTasksToFile(global.mainWindow, global.tasks, global.activePath)
})

//Log messages from the browser context to the standard output
ipcMain.on('log', (event, arg) => {
	console.log('')
	console.log(arg)
	console.log('')
})

//Set up the main application window when the application is ready
app.on('ready', () => {
	let window = new BrowserWindow({
		width: 360,
		height: 540,
	})
	
	window.setMinimumSize(360, 420)
	
	const menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)
	
	window.loadURL('file://' + path.join(__dirname, 'html', 'index.html'))
	window.webContents.openDevTools();
	
	window.on('close', (event) => {
		//TODO: Update this to the standard "save and quit"|"quit without saving"|"cancel" options
		let cancel = dialog.showMessageBox(global.mainWindow, {
			type: 'question',
			buttons: ['Yes', 'No'],
			title: 'Quit',
			message: 'Are you sure you want to quit?',
			cancelId: 1
		})
		
		if(cancel)
			event.preventDefault()
	})
	
	window.on('closed', () => { global.mainWindow = null })
	
	global.mainWindow = window
})

//Clean up the processes when the appliation is closed
app.on('window-all-closed', () => app.quit())
