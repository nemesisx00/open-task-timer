'use strict'

const moment = require('moment')
require('moment-duration-format')

const TimeSpan = load('model/TimeSpan')
const Util = load('Util')

class Task
{
	static fromJson(json)
	{
		let out = null
		if(typeof json === 'object')
		{
			out = new Task(json.id, json.title)
			
			if(json.spans)
				out.spans = json.spans.map(s => TimeSpan.fromJson(s)).filter(s => s instanceof TimeSpan)
		}
		
		return out
	}
	
	constructor(id, title)
	{
		this.id = id
		this.title = title
		this.spans = []
	}
	
	addSpan(span)
	{
		let out = false
		if(span instanceof TimeSpan)
		{
			this.spans.push(span)
			out = this.spans.includes(span)
		}
		
		return out
	}
	
	get duration() { return this.spans.reduce((acc, val) => acc + val.seconds, 0) }
	get durationToday()
	{
		let today = moment().format(Util.Format_FullDate)
		return this.spans.filter(span => span.start.format(Util.Format_FullDate) == today)
				.reduce((acc, val) => acc + val.seconds, 0)
	}
	
	toJson()
	{
		return {
			id: this.id,
			title: this.title,
			duration: this.duration,
			spans: this.spans.map(s => s.toJson())
		}
	}
}

module.exports = Task
