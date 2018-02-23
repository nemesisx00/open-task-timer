'use strict'

const {ipcRenderer} = require('electron')

const Sender = require('./Sender')
const TaskUi = require('./TaskUi')

const event = Object.freeze({
	auto: Object.freeze({
		saved: 'auto-saved'
	}),
	task: Object.freeze({
		created: 'task-created',
		opened: 'tasks-opened',
		saved: 'task-saved',
		span: Object.freeze({
			created: 'task-span-created',
			updated: 'task-span-updated'
		})
	})
})

class Listener
{
	static initialize()
	{
		ipcRenderer.on(event.auto.saved, handleAutoSaved)
		ipcRenderer.on(event.task.created, handleTaskCreated)
		ipcRenderer.on(event.task.opened, handleTaskOpened)
		ipcRenderer.on(event.task.span.created, handleTaskSpanCreated)
		ipcRenderer.on(event.task.span.updated, handleTaskSpanUpdated)
	}
}

module.exports = Listener

//-------------------- Private Scope --------------------

function handleAutoSaved(event, arg)
{
	if(arg)
	{
		Sender.log('Auto save successful')
	}
}

function handleTaskCreated(event, arg)
{
	if(arg && arg.id > 0 && typeof arg.title === 'string' && typeof arg.duration === 'number')
	{
		let titleInput = document.getElementById('newLabel')
		let taskUi = new TaskUi(arg)
		
		global.ui.push(taskUi)
		taskUi.append()
		titleInput.value = ''
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
