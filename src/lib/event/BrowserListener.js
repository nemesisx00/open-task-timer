'use strict'
/* global load */

const {ipcRenderer} = require('electron')

const Events = load('event/BrowserEvents')
const Sender = load('event/BrowserSender')
const TaskUi = load('ui/TaskUi')
const Util = load('Util')

class BrowserListener
{
	static initialize()
	{
		ipcRenderer.on(Events.auto.save.start, handleAutoSaveStart)
		ipcRenderer.on(Events.auto.save.stop, handleAutoSaveStop)
		ipcRenderer.on(Events.auto.saved, handleAutoSaved)
		ipcRenderer.on(Events.task.clear, handleTasksClear)
		ipcRenderer.on(Events.task.created, handleTaskCreated)
		ipcRenderer.on(Events.task.opened, handleTaskOpened)
		ipcRenderer.on(Events.task.span.created, handleTaskSpanCreated)
		ipcRenderer.on(Events.task.span.updated, handleTaskSpanUpdated)
	}
}

module.exports = BrowserListener

//-------------------- Private Scope --------------------

let titleInput = document.getElementById('newLabel')

function handleAutoSaveStart(event, arg)
{
	//Shouldn't happen but just make sure
	if(global.autoSaveTimer)
		clearInterval(global.autoSaveTimer)
	
	let delay = global.defaults.autoSaveDelay
	if(arg && typeof arg === 'number' && arg > 0)
		delay = arg
	
	global.autoSaveTimer = setInterval(Sender.autoSave, delay)
}

function handleAutoSaveStop()
{
	if(global.autoSaveTimer)
		clearInterval(global.autoSaveTimer)
}

function handleAutoSaved(event, arg)
{
	if(arg)
	{
		Sender.log('Auto save successful')
	}
}

function handleTasksClear()
{
	global.taskUis.map(t => {
		t.stop(true)
		t.elements.main.remove()
	})
	
	global.taskUis = []
}

function handleTaskCreated(event, arg)
{
	if(arg && arg.id > 0 && typeof arg.title === 'string' && typeof arg.duration === 'number')
	{
		renderTask(arg)
		titleInput.value = ''
		Util.dispatch(titleInput, 'input')
	}
}

function handleTaskOpened(event, arg)
{
	//Inform the user whether or not it succeeded
	Sender.log(arg)
}

function handleTaskSpanCreated(event, arg)
{
	//Inform the user whether or not it succeeded
	Sender.log(`TimeSpan created: ${arg}`)
}

function handleTaskSpanUpdated(event, arg)
{
	//Inform the user whether or not it succeeded
	Sender.log(`TimeSpan updated: ${arg}`)
}

function renderTask(obj)
{
	let taskUi = new TaskUi(obj)
	
	global.taskUis.push(taskUi)
	taskUi.append()
}