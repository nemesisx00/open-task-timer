//const {ipcRenderer} = require('electron')
const Task = require('../main/Task.js')

document.addEventListener('DOMContentLoaded', () => {
	setupListeners()
	setupForDev()
})

function getNextTaskId()
{
	let out = 0
	
	document.querySelectorAll('.task').forEach(el => {
		let id = Number.parseInt(el.id.replace('task-', ''))
		if(id > out)
			out = id
	})
	
	return out + 1
}

function taskCreateHandler()
{
	let input = document.getElementById('newLabel')
	if(input && typeof input.value === 'string' && input.value.length > 0)
	{
		let task = new Task(getNextTaskId(), input.value, { generateRow: true })
		if(task)
			input.value = ''
	}
}

function setupListeners()
{
	document.getElementById('createNewEntry').addEventListener('click', taskCreateHandler)
}

function setupForDev()
{
	let rows = [
		new Task(getNextTaskId(), 'My Task 1', { generateRow: true, duration: 87 }),
		new Task(getNextTaskId(), 'My New Task', { generateRow: true, duration: 13 })
	]
	
	return rows
}
