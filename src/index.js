'use strict'

require('./init')

const {app, dialog, Menu, BrowserWindow} = require('electron')
const path = require('path')
const menuTemplate = load('ui/MainMenu')

const Listener = load('event/MainListener')

global.activePath = null
global.mainWindow = null
global.tasks = []

//Set up IPC event listeners
Listener.initialize()

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
