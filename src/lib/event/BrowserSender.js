'use strict'

const {ipcRenderer} = require('electron')

const Events = load('event/MainEvents')

class BrowserSender
{
	static autoSave(force)
	{
		//Only do the save if there's actually something to preserve
		if(force || global.taskUis.find(t => t.timer !== null))
		{
			global.taskUis.forEach(t => t.autoSaveTask())
			ipcRenderer.send(Events.auto.save)
		}
	}
	
	static log(msg)
	{
		ipcRenderer.send(Events.log, msg)
	}
	
	static taskNew(title)
	{
		ipcRenderer.send(Events.task.new, { title })
	}
	
	static taskSpanNew(taskId, spanId, start)
	{
		ipcRenderer.send(Events.task.span.new, {
			taskId: taskId,
			spanId: spanId,
			start: start
		})
	}
	
	static taskSpanUpdate(taskId, spanId, end)
	{
		ipcRenderer.send(Events.task.span.update, {
			taskId: taskId,
			spanId: spanId,
			end: end
		})
	}
	
	static taskView(taskId)
	{
		ipcRenderer.send(Events.task.view, { taskId })
	}
}

module.exports = BrowserSender
