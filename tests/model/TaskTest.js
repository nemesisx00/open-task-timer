'use strict'

require('../../src/init.js')

const test = require('tape')

const Task = load('model/Task')
const TimeSpan = load('model/TimeSpan')

const tsDuration = 15
const tsMoments = [
	['2018-02-26 00:00:00', '2018-02-26 00:00:01'],
	['2018-02-26 00:00:02', '2018-02-26 00:00:04'],
	['2018-02-26 00:00:05', '2018-02-26 00:00:08'],
	['2018-02-26 00:00:09', '2018-02-26 00:00:13'],
	['2018-02-26 00:00:14', '2018-02-26 00:00:19']
]

const taskId = 5
const taskTitle = 'My Test Task'

const generateTask = () => {
	let spans = []
	tsMoments.forEach((moments, key) => {
		spans.push({
			id: key + 1,
			start: moments[0],
			end: moments[1]
		})
	})
	
	let json = {
		id: taskId,
		title: taskTitle,
		spans: spans
	}
	
	return Task.fromJson(json)
}

test('Testing Task.fromJson', t => {
	let expected = new Task(taskId, taskTitle)
	tsMoments.forEach((moments, key) => {
		let ts = new TimeSpan(key + 1, moments[0])
		ts.end = moments[1]
		expected.spans.push(ts)
	})
	
	let instance = generateTask()
	
	t.deepEqual(instance, expected, 'Instances are equal')
	t.end()
})

test('Testing Task.duration', t => {
	let expected = tsDuration
	let instance = generateTask()
	
	t.equal(instance.duration, expected, 'Duration calculated correctly')
	t.end()
})
