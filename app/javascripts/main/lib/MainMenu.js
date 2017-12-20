'use static'

const {BrowserWindow} = require('electron')
const Data = require('./Data.js')

module.exports = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Open',
				click () {
					let tasks = ['hi']
					Data.loadTasksFromFile()
					BrowserWindow.getFocusedWindow().webContents.send('tasks-opened', tasks)
				}
			},
			{ role: 'close' }
		]
	}
]
