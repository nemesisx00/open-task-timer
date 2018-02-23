'use static'

/* global load */

const {BrowserWindow} = require('electron')
const Data = load('Data.js')

module.exports = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Open',
				click () {
					let loaded = Data.loadTasksFromFile()
					global.tasks = loaded.tasks
					global.activePath = loaded.path
					BrowserWindow.getFocusedWindow().webContents.send('tasks-opened', global.tasks)
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
					Data.saveTasksToFile(global.tasks)
				}
			},
			{ role: 'close' }
		]
	}
]
