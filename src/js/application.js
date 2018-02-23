require('./init')

/* global load */

const {ipcRenderer} = require('electron')

const TaskUi = load('TaskUi')

let ui = []

let titleInput = document.getElementById('newLabel')

ipcRenderer.on('task-created', (event, arg) => {
	if(arg && arg.id > 0 && typeof arg.title === 'string' && typeof arg.duration === 'number')
	{
		let taskUi = new TaskUi(arg)
		
		ui.push(taskUi)
		taskUi.append()
		titleInput.value = ''
	}
})

ipcRenderer.on('tasks-opened', (event, arg) => {
	ipcRenderer.on('log', arg)
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
