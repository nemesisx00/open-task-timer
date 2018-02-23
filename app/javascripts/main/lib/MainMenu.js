'use static'

const {BrowserWindow} = require('electron')
const Data = require('./Data')
const Sender = require('./Sender')

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
					
					Sender.tasksOpened(BrowserWindow.getFocusedWindow().webContents, global.tasks)
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
