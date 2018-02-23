'ust strict'

const moment = require('moment')
require('moment-precise-range-plugin')
require('moment-duration-format')

const timeFormat = 'h:mm:ss'
const timestampFormat = 'Y-MM-DD hh:mm:ss'

const timeOptions = {
	useGrouping: false
}

/**
 * Translate val into a Moment.
 * @param {string|Moment} val The value to momentize.
 * @param {boolean} def Flag denoting whether or not to default to now if val is invalid.
 * @return {Moment|null} If the moment is invalid and def is true, returns null. Otherwise, returns an instance of Moment.
 */
function momentize(val, def)
{
	let out = moment(val)
	if(!out.isValid())
		out = def ? moment() : null
	
	return out
}

/**
 * A storage object defining a span of time between two timestamps.
 */
class TimeSpan
{
	static fromJson(json)
	{
		let out = null
		if(typeof json === 'object')
		{
			out = new TimeSpan(json.id, json.start)
			out.end = json.end
		}
		
		return out
	}
	
	/**
	 * Constructor
	 * @param {any} id An identifier.
	 * @param {string|Moment} start The starting timestamp.
	 */
	constructor(id, start)
	{
		this.id = id
		this._start = null
		this._end = null
		
		this.start = start
	}
	
	/**
	 * Get the start timestamp as a Moment.
	 * @return {Moment|null} If valid, returns an instance of Moment. Otherwise, returns null.
	 */
	get start() { return momentize(this._start) }
	
	/**
	 * Get the end timestamp as a Moment.
	 * @return {Moment} Returns an instance of Moment. If invalid, defaults to now.
	 */
	get end() { return momentize(this._end, true) }
	
	/**
	 * Get the duration in seconds.
	 * @return {integer} Returns the duration in seconds.
	 */
	get seconds() { return this.end.diff(this.start).asSeconds() }
	
	/**
	 * Set the start timestamp.
	 * @param {string|Moment} start The timestamp to set. If invalid, set to now.
	 */
	set start(start) { this._start = momentize(start, true).format(timestampFormat) }
	
	/**
	 * Set the end timestamp.
	 * @param {string|Moment} end The timestamp to set. If invalid, set to null.
	 */
	set end(end)
	{
		let m = momentize(this._end)
		this._end = m ? m.format(timestampFormat) : null
	}
	
	fullFormat()
	{
		let diff = moment.preciseDiff(this.start, this.end, true)
		
		let out = ''
		if(diff.years)
			out += `${diff.years} Year` + (diff.years > 1 ? 's ' : ' ')
		if(diff.months)
			out += `${diff.months} Month` + (diff.months > 1 ? 's ' : ' ')
		if(diff.days)
			out += `${diff.days} Day` + (diff.days > 1 ? 's ' : ' ')
		
		let hours = '' + (diff.hours ? diff.hours : '00')
		let minutes = '' + (diff.minutes ? diff.minutes : '00')
		let seconds = '' + (diff.seconds ? diff.seconds : '00')
		
		out += `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
		
		return out
	}
	
	timeFormat()
	{
		let diff = this.end.diff(this.start)
		let duration = moment.duration(diff)
		
		return duration.format(timeFormat, timeOptions)
	}
	
	/**
	 * Translate into the simplest JSON form.
	 * @return {object} Returns a JSON object representing this instance.
	 */
	toJson()
	{
		return {
			id: this.id,
			start: this._start,
			end: this._end
		}
	}
}

module.exports = TimeSpan
