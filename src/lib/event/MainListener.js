'use strict'

const {ipcMain} = require('electron')

const Data = load('Data')
const Events = load('event/MainEvents')
const Sender = load('event/MainSender')
const Task = load('model/Task')
const TimeSpan = load('model/TimeSpan')
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
	if(global.state.activePath)
	{
		Data.saveTasksToFile(global.mainWindow, global.tasks, global.state.activePath)
	}
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
		global.state.needsToSave = true
		Sender.taskCreated(event.sender, task.id)
	}
}

function handleTaskSpanNew(event, arg)
{
	if(arg && arg.taskId && arg.spanId && arg.start)
	{
		let task = global.tasks.find(t => t.id === arg.taskId)
		if(task && !task.spans.find(s => s.id === arg.spanId))
		{
			let span = new TimeSpan(arg.spanId, arg.start)
			if(span)
			{
				task.addSpan(span)
				global.state.needsToSave = true
			}
		}
	}
}

function handleTaskSpanUpdate(event, arg)
{
	if(arg && arg.taskId && arg.spanId && arg.end)
	{
		let task = global.tasks.find(t => t.id === arg.taskId)
		if(task)
		{
			let span = task.spans.find(s => s.id === arg.spanId)
			if(span)
			{
				span.end = arg.end
				global.state.needsToSave = true
			}
		}
	}
}
