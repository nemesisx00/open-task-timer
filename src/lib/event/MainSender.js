'use strict'

const Events = load('event/BrowserEvents')
const Util = load('Util')

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
		sender.send(Events.state.clear)
	}
	
	static taskCreated(sender, task)
	{
		sender.send(Events.task.created, Util.checkType(task, 'Task') ? task.toJson() : task)
	}
}

module.exports = MainSender
