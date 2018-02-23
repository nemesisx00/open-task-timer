'use strict'

const event = Object.freeze({
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

class Sender
{
	static tasksOpened(sender, tasks)
	{
		sender.send(event.task.opened, tasks.map(t => t.toJson()))
	}
	
	static taskCreated(sender, task)
	{
		sender.send(event.task.created, task.toJson())
	}
	
	static taskSaved(sender, path)
	{
		sender.send(event.task.saved, path)
	}
	
	static taskSpanCreated(sender, success)
	{
		sender.send(event.task.span.created, { success: success ? true : false })
	}
	
	static taskSpanUpdated(sender, success)
	{
		sender.send(event.task.span.updated, { success: success ? true : false })
	}
}

module.exports = Sender
