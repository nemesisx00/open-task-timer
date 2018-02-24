require('../init')

/* global load */

const {ipcRenderer} = require('electron')

const TaskUi = load('TaskUi')

//1 minute
const defaultAutoSaveDelay = 60000

const autoSave = () => {
	ui.forEach(t => t.saveTask())
	ipcRenderer.send('auto-save')
}

const renderTask = json => {
	let taskUi = new TaskUi(json)
	
	ui.push(taskUi)
	taskUi.append()
}

let ui = []

let titleInput = document.getElementById('newLabel')
let autoSaveTimer = setInterval(autoSave, defaultAutoSaveDelay)

ipcRenderer.on('auto-save-start', (event, arg) => {
	//Shouldn't happen but just make sure
	if(autoSaveTimer)
		clearInterval(autoSaveTimer)
	
	let delay = defaultAutoSaveDelay
	if(arg && typeof arg === 'number' && arg > 0)
		delay = arg
	
	autoSaveTimer = setInterval(autoSave, delay)
})

ipcRenderer.on('auto-save-stop', () => {
	if(autoSaveTimer)
		clearInterval(autoSaveTimer)
})

ipcRenderer.on('tasks-clear', () => {
	ui.map(t => {
		t.stop(true)
		t.elements.main.remove()
	})
	
	ui = []
})

ipcRenderer.on('task-created', (event, arg) => {
	if(arg && arg.id > 0 && typeof arg.title === 'string' && typeof arg.duration === 'number')
	{
		renderTask(arg)
		titleInput.value = ''
	}
})

document.addEventListener('DOMContentLoaded', () => {
	setupListeners()
})

function taskCreateHandler()
{
	if(titleInput && typeof titleInput.value === 'string' && titleInput.value.length > 0
		&& ![document.querySelectorAll('.task .title')].find(t => t.innerHTML === titleInput.value))
	{
		ipcRenderer.send('task-new', { title: titleInput.value })
	}
}

function setupListeners()
{
	document.getElementById('createNewEntry').addEventListener('click', taskCreateHandler)
}
