'use strict'

require('../init')
const {ipcRenderer} = require('electron')
const moment = require('moment')
require('moment-duration-format')
const sprintf = require('sprintf-js').sprintf

const OneTimeEvents = load('event/OneTimeEvents')
const Tools = load('ui/Tools')
const Util = load('Util')

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
				<div class="timeSpan shrink%s hidden">
					<div class="startTime">%s</div>
					<div class="spacer shrink">-</div>
					<div class="endTime">%s</div>
					<div class="duration grow">%s</div>
				</div>
`

const durationFormat = 'h [hours] m [minutes]'
const durationFormat_minutes = 'm [minutes] s [seconds]'
const durationFormat_seconds = 's [seconds]'

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
			
			let format = durationFormat
			if(duration.asMinutes() < 1)
				format = durationFormat_seconds
			else if(duration.asMinutes() < 60)
				format = durationFormat_minutes
			
			parsed[date].push({
				start: start.format(timeFormat),
				end: end ? end.format(timeFormat) : 'N/A',
				duration: Util.formatDuration(duration, format)
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

function dayLabel_click(e)
{
	Array.from(e.target.parentElement.children)
		.filter(el => el.className.indexOf('timeSpan') > -1)
		.forEach(el => Tools.toggleClassName(el, 'hidden'))
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
		
		document.getElementById('label').innerHTML = `${args.task.title}'s Time Entries`
		document.getElementById('container').innerHTML = html.join('\n')
		
		let dayLabels = document.querySelectorAll('#container .day .label')
		for(let el of dayLabels)
		{
			el.addEventListener('click', dayLabel_click)
		}
	}
})
