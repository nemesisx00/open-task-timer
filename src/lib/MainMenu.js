'use static'

/* global load */

const {BrowserWindow} = require('electron')
const Data = load('Data.js')

module.exports = [
	{
		label: 'File',
		submenu: [
			{
				label: 'New',
				click () {
					global.tasks = []
					global.activePath = null
					BrowserWindow.getFocusedWindow().webContents.send('tasks-clear')
				}
			},
			{
				label: 'Open',
				click () {
					let path = Data.loadTasksFromFile()
					if(path)
						global.activePath = path
				}
			},
			{
				label: 'Save',
				click () {
					Data.saveTasksToFile(global.tasks, global.activePath)
				}
			},
			{
				label: 'Save As...',
				click () {
					let path = Data.saveTasksToFile(global.tasks)
					if(path)
						global.activePath = path
				}
			},
			{ role: 'close' }
		]
	}
]
