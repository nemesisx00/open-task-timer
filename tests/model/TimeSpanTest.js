'use strict'

require('../../src/init.js')

const test = require('tape')

const TimeSpan = load('model/TimeSpan')

const durationInSeconds = 5
const dateTimes = ['2018-02-26 00:00:14', '2018-02-26 00:00:19']
const tsId = 2

const generateSpan = () => {
	return TimeSpan.fromJson({
		id: tsId,
		start: dateTimes[0],
		end: dateTimes[1]
	})
}

test('Testing TimeSpan.fromJson', t => {
	let expected = new TimeSpan(tsId, dateTimes[0])
	expected.end = dateTimes[1]
	
	let instance = generateSpan()
	
	t.deepEqual(instance, expected, 'Instances are equal')
	t.end()
})

test('Testing TimeSpan.seconds', t => {
	let expected = durationInSeconds
	let instance = generateSpan()
	
	t.equal(instance.seconds, expected, 'Seconds calculated correctly')
	t.end()
})
