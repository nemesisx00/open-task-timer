
const {app, Menu, BrowserWindow} = require('electron')
const path = require('path')
const json = require('../../package.json')
const menuTemplate = require('./lib/MainMenu')

const Listener = require('./lib/Listener')

global.activePath = null
global.tasks = []

//Set up IPC event listeners
Listener.initialize()

//Set up the main application window when the application is ready
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
	
	window.on('closed', () => { window = null })
})

//Clean up the processes when the appliation is closed
app.on('window-all-closed', () => app.quit())
