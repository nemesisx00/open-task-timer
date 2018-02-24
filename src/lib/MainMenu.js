'use static'

/* global load */

const {dialog} = require('electron')
const Data = load('Data.js')

const clearActiveTasks = () => {
	global.tasks = []
	global.activePath = null
	global.mainWindow.webContents.send('tasks-clear')
}

module.exports = [
	{
		label: 'File',
		submenu: [
			{
				label: 'New',
				click () {
					//If any tasks exist, prompt the user to confirm. Should help prevent data loss.
					if(global.tasks.length > 0)
					{
						dialog.showMessageBox(
							global.mainWindow,
							{
								type: 'question',
								buttons: ['Yes', 'No'],
								title: 'Create New Task List',
								message: 'Are you sure you want to create a new task list?',
								detail: 'Creating a new task list will close the current task list without saving',
								cancelId: 1
							},
							(response) => {
								if(response === 0)
									clearActiveTasks()
							}
						)
					}
					else
					{
						clearActiveTasks()
					}
				}
			},
			{
				label: 'Open',
				click () {
					let path = Data.loadTasksFromFile(global.mainWindow)
					if(path)
						global.activePath = path
				}
			},
			{
				label: 'Save',
				click () {
					Data.saveTasksToFile(global.mainWindow, global.tasks, global.activePath)
				}
			},
			{
				label: 'Save As...',
				click () {
					let path = Data.saveTasksToFile(global.mainWindow, global.tasks)
					if(path)
						global.activePath = path
				}
			},
			{ type: 'separator' },
			{ label: 'Quit', role: 'close' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				label: 'Auto Save',
				type: 'checkbox',
				checked: true,
				click (menuItem) {
					if(menuItem.checked)
						global.mainWindow.webContents.send('auto-save-start')
					else
						global.mainWindow.webContents.send('auto-save-stop')
				}
			}
		]
	},
	{
		label: 'Help',
		submenu: [
			{
				label: 'About Open Task Timer',
				click () {
					//Show a dialog describing the application, links to the repo, etc...
				}
			},
			{
				label: 'License',
				click () {
					//Show a dialog displaying license
				}
			},
			{
				label: 'Source Code Repository',
				click () {
					//Open the bitbucket repo link in the user's default browser
				}
			}
		]
	}
]
