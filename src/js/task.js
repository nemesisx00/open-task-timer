'use strict'

require('../init')
const {ipcRenderer} = require('electron')
const moment = require('moment')
require('moment-duration-format')
const sprintf = require('sprintf-js').sprintf

const OneTimeEvents = load('event/OneTimeEvents')

global.task = null

const dateFormat = 'Y-MM-DD'
const timeFormat = 'hh:mm A'

const dayTemplate = `
			<div class="day shrink">
				<div class="label shrink">%s</div>
%s
			</div>
`

const timespanTemplate = `
				<div class="timeSpan shrink%s">
					<div class="startTime">%s</div>
					<div class="spacer shrink">-</div>
					<div class="endTime">%s</div>
					<div class="duration grow">%s</div>
				</div>
`

function parseTimeSpans(task)
{
	let parsed = {}
	if(task.spans)
	{
		for(let span of task.spans)
		{
			let start = moment(span._start)
			let date = start.format(dateFormat)
			let end = null
			if(span._end)
				end = moment(span._end)
			
			let duration = moment.duration(end.diff(start))
			
			if(!parsed[date])
				parsed[date] = []
			
			parsed[date].push({
				start: start.format(timeFormat),
				end: end ? end.format(timeFormat) : 'N/A',
				duration: `${duration.hours()} hours ${duration.minutes()} minutes`
			})
		}
	}
	
	return parsed
}

function buildDayHtml(date, spans)
{
	let alt = true
	let spanHtml = []
	for(let span of spans)
	{
		alt = !alt
		spanHtml.push(sprintf(timespanTemplate, alt ? ' alt' : '', span.start, span.end, span.duration))
	}
	
	return sprintf(dayTemplate, date, spanHtml.join('\n'))
}

ipcRenderer.on(OneTimeEvents.viewTask, (event, args) => {
	if(args && args.task)
	{
		let parsed = parseTimeSpans(args.task)
		
		let html = []
		for(let date in parsed)
		{
			if(parsed[date])
				html.push(buildDayHtml(date, parsed[date]))
		}
		
		document.getElementById('container').innerHTML = html.join('\n')
	}
})
