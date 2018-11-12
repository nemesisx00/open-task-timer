'use strict'

const {ipcRenderer} = require('electron')

const Events = load('event/BrowserEvents')
const Sender = load('event/BrowserSender')
const TaskUi = load('ui/TaskUi')
const Tools = load('ui/Tools')

class BrowserListener
{
	static initialize()
	{
		ipcRenderer.on(Events.auto.save.start, handleAutoSaveStart)
		ipcRenderer.on(Events.auto.save.stop, handleAutoSaveStop)
		ipcRenderer.on(Events.auto.saved, handleAutoSaved)
		ipcRenderer.on(Events.auto.sort.start, handleAutoSortStart)
		ipcRenderer.on(Events.auto.sort.stop, handleAutoSortStop)
		ipcRenderer.on(Events.state.clear, handleTasksClear)
		ipcRenderer.on(Events.task.created, handleTaskCreated)
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

function handleAutoSortStart()
{
	global.taskSorter.active = true
	global.taskSorter._start(true)
}

function handleAutoSortStop()
{
	global.taskSorter.active = false
}

function handleTasksClear()
{
	global.taskUis.map(t => {
		if(t.timer)
			clearInterval(t.timer)
		t.elements.main.remove()
	})
	
	global.taskUis = []
}

function handleTaskCreated(event, arg)
{
	if(arg && arg > 0)
	{
		renderTask(arg)
		titleInput.value = ''
		Tools.dispatch(titleInput, 'input')
	}
}

function renderTask(obj)
{
	let taskUi = new TaskUi(obj)
	
	global.taskUis.push(taskUi)
	taskUi.append()
}
