'use strict'

const {ipcMain} = require('electron')

const Data = require('./Data')
const Sender = require('./Sender')
const Task = require('./Task')
const TimeSpan = require('./TimeSpan')

const event = Object.freeze({
	auto: Object.freeze({
		save: 'auto-save'
	}),
	task: Object.freeze({
		new: 'task-new',
		span: Object.freeze({
			new: 'task-span-new',
			update: 'task-span-update'
		})
	}),
	log: 'log'
})

class Listener
{
	static initialize()
	{
		ipcMain.on(event.auto.save, handleAutoSave)
		ipcMain.on(event.log, handleLog)
		ipcMain.on(event.task.new, handleTaskNew)
		ipcMain.on(event.task.span.new, handleTaskSpanNew)
		ipcMain.on(event.task.span.update, handleTaskSpanUpdate)
	}
}

module.exports = Listener

//-------------------- Private Scope --------------------

function handleAutoSave(event, arg)
{
	//Update tasks to their current state, as of the time of this event being sent, before saving.
	if(arg && Array.isArray(arg))
	{
		//
	}
	
	Data.saveTasksToFile(global.tasks, global.activePath)
}

/**
 * Log messages from the browser context to the standard output
 */
function handleLog(event, arg)
{
	console.log(arg)
	console.log(' ')
}

/**
 * Create a new task instance
 */
function handleTaskNew(event, arg)
{
	if(arg && typeof arg.title === 'string' && !global.tasks.find(t => t.title === arg.title))
	{
		let id = global.tasks.reduce((acc, val) => val.id > acc ? val.id : acc, 0) + 1
		let task = new Task(id, arg.title)
		
		global.tasks.push(task)
		Sender.taskCreated(event.sender, task)
	}
}

function handleTaskSpanNew(event, arg)
{
	let success = false
	if(arg && arg.taskId && typeof arg.span === 'object')
	{
		let task = global.tasks.find(t => t.id === arg.taskId)
		if(task instanceof Task)
		{
			let span = TimeSpan.fromJson(arg.span)
			if(span instanceof TimeSpan)
				success = task.addSpan(span)
		}
	}
	
	Sender.taskSpanCreated(event.sender, success)
}

function handleTaskSpanUpdate(event, arg)
{
	let success = false
	if(arg && arg.taskId && arg.spanId && arg.end)
	{
		let task = global.tasks.find(t => t.id === arg.taskId)
		if(task instanceof Task)
		{
			let span = task.spans.find(s => s.id === arg.spanId)
			if(span instanceof TimeSpan)
			{
				span.end = arg.end
				success = true
			}
		}
	}
	
	Sender.taskSpanUpdated(event.sender, success)
}
