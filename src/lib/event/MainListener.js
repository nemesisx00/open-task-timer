'use strict'
/* global load */

const {ipcMain} = require('electron')

const Data = load('Data')
const Events = load('event/MainEvents')
const Sender = load('event/MainSender')
const Task = load('task/Task')
const TimeSpan = load('task/TimeSpan')
const Util = load('Util')

class MainListener
{
	static initialize()
	{
		ipcMain.on(Events.auto.save, handleAutoSave)
		ipcMain.on(Events.log, handleLog)
		ipcMain.on(Events.task.new, handleTaskNew)
		ipcMain.on(Events.task.span.new, handleTaskSpanNew)
		ipcMain.on(Events.task.span.update, handleTaskSpanUpdate)
	}
}

module.exports = MainListener

//-------------------- Private Scope --------------------

function handleAutoSave()
{
	if(global.activePath)
		Data.saveTasksToFile(global.mainWindow, global.tasks, global.activePath)
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
	if(arg && Util.checkType(arg.title, 'string') && !global.tasks.find(t => t.title === arg.title))
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
