
const {app, Menu, BrowserWindow} = require('electron')
const path = require('path')
const json = require('../../package.json')
const menuTemplate = require('./MainMenu.js')

app.on('ready', () => {
	var window = new BrowserWindow({
		title: json.settings.title,
		width: json.settings.width,
		height: json.settings.height
	})
	
	const menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)
	
	window.toggleDevTools()
	
	window.loadURL('file://' + path.join(__dirname, '..', '..') + '/index.html')
	
	window.webContents.on('did-finish-load', () => {
		/*
		window.webContents.send('loaded', {
			appName: json.title
		})
		*/
	})
	
	window.on('closed', () => {
		window = null
	})
})
