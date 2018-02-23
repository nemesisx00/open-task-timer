'use strict'

class Task
{
	constructor(id, title, duration)
	{
		this.id = id
		this.title = title
		this.duration = typeof duration === 'number' ? duration : 0
	}
}

module.exports = Task
