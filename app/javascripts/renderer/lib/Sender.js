'use strict'

const {ipcRenderer} = require('electron')

const event = Object.freeze({
	auto: Object.freeze({
		save: 'auto-save'
	}),
	task: Object.freeze({
		new: 'task-new',
		update: 'task-update',
		span: Object.freeze({
			new: 'task-span-new',
			update: 'task-span-update'
		})
	}),
	log: 'log'
})

class Sender
{
	static autoSave(tasks)
	{
		ipcRenderer.send(event.auto.save, tasks)
	}
	
	static log(msg)
	{
		ipcRenderer.send(event.log, msg)
	}
	
	static taskNew(title)
	{
		ipcRenderer.send(event.task.new, { title: title })
	}
	
	static taskSpanNew(taskId, spanId, start)
	{
		ipcRenderer.send(event.task.span.new, {
			taskId: taskId,
			spanId: spanId,
			start: start
		})
	}
	
	static taskSpanUpdate(taskId, spanId, end)
	{
		ipcRenderer.send(event.task.span.update, {
			taskId: taskId,
			spanId: spanId,
			end: end
		})
	}
}

module.exports = Sender
