'use strict'

const {app, dialog, globalShortcut, BrowserWindow} = require('electron')
const path = require('path')

const Data = load('Data')
const Sender = load('event/MainSender')

const shortcutHandlers = {
	//Add shortcut handlers as 'accelerator': handler
}

/**
 * Reset the task list and active path.
 * Signal the frontend to clear the task elements.
 */
function clearActiveTasks()
{
	global.tasks = []
	global.state.activePath = null
	Sender.tasksClear(global.mainWindow.webContents)
}

/**
 * Set up the main window and load the html content.
 */
function onAppReady()
{
	let width = 360
	let height = 540
	
	let window = new BrowserWindow({ width: width, height: height })
	window.setMinimumSize(width, height)
	window.on('close', onMainWindowClose)
	window.on('closed', onMainWindowClosed)
	
	load('ui/MainMenu')
	
	window.loadURL('file://' + path.join(__dirname, '..', '..', 'html', 'index.html'))
	
	//Register all the shortcut handlers
	Object.entries(shortcutHandlers).map(entry => globalShortcut.register(entry[0], entry[1]))
	
	global.mainWindow = window
}

/**
 * Stop the main process when all the windows are closed.
 */
function onWindowAllClosed()
{
	if(process.platform != 'darwin')
		app.quit()
}

/**
 * When necessary, present the user with the choice of whether or not to save before closing the main window.
 */
function onMainWindowClose(event)
{
	if(global.state && global.state.needsToSave)
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
}

/**
 * After the main window is closed, clean up the global reference.
 */
function onMainWindowClosed()
{
	global.mainWindow = null
}

/**
 * Clear the task list and active path.
 * If any tasks exist, prompt the user to confirm.
 */
function shortcutNew()
{
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

/**
 * Prompt the user to open a new file.
 */
function shortcutOpen()
{
	Data.loadTasksFromFile(global.mainWindow)
}

/**
 * Save the current task list.
 */
function shortcutSave()
{
	Data.saveTasksToFile(global.mainWindow, global.tasks, global.state.activePath)
}

module.exports = {
	onAppReady: onAppReady,
	onWindowAllClosed: onWindowAllClosed,
	fileNew: shortcutNew,
	fileOpen: shortcutOpen,
	fileSave: shortcutSave
}
