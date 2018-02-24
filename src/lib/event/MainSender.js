'use strict'
/* global load */

const Events = load('event/BrowserEvents')

class MainSender
{
	static autoSaveStart(sender)
	{
		sender.send(Events.auto.save.start)
	}
	
	static autoSaveStop(sender)
	{
		sender.send(Events.auto.save.stop)
	}
	
	static tasksClear(sender)
	{
		sender.send(Events.task.clear)
	}
	
	static tasksOpened(sender, tasks)
	{
		sender.send(Events.task.opened, tasks.map(t => t.toJson()))
	}
	
	static taskCreated(sender, task)
	{
		sender.send(Events.task.created, task.toJson())
	}
	
	static taskSaved(sender, path)
	{
		sender.send(Events.task.saved, path)
	}
	
	static taskSpanCreated(sender, success)
	{
		sender.send(Events.task.span.created, { success: success ? true : false })
	}
	
	static taskSpanUpdated(sender, success)
	{
		sender.send(Events.task.span.updated, { success: success ? true : false })
	}
}

module.exports = MainSender
