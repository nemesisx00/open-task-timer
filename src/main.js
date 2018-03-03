'use strict'

require('./init')
const handleSquirrelEvent = require('./squirrel.js')

if(!(handleSquirrelEvent && handleSquirrelEvent()))
{
	const {app, dialog, Menu, BrowserWindow} = require('electron')
	const path = require('path')
	const menuTemplate = load('ui/MainMenu')
	
	const Data = load('Data')
	const Listener = load('event/MainListener')
	const State = load('State')
	
	global.mainWindow = null
	global.state = new State()
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
			if(global.state.needsToSave)
			{
				let choice = dialog.showMessageBox(global.mainWindow, {
					type: 'question',
					buttons: ['Quit without Saving', 'Save and Quit', 'Cancel'],
					title: 'Quit',
					message: 'Are you sure you want to quit?',
					cancelId: 2
				})
				
				if(choice)
				{
					event.preventDefault()
					if(choice === 1)
					{
						new Promise(resolve => {
							resolve(Data.saveTasksToFile(global.mainWindow, global.tasks, global.state.activePath, true))
						}).then(global.mainWindow.destroy())
					}
				}
			}
		})
		
		window.on('closed', () => { global.mainWindow = null })
		
		global.mainWindow = window
	})

	//Clean up the processes when the appliation is closed
	app.on('window-all-closed', () => {
		if(process.platform != 'darwin')
			app.quit()
	})
}
