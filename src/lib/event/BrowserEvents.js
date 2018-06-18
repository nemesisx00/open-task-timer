'use strict'

module.exports = Object.freeze({
	auto: Object.freeze({
		save: Object.freeze({
			start: 'auto-save-start',
			stop: 'auto-save-stop'
		}),
		saved: 'auto-saved',
		sort: Object.freeze({
			start: 'auto-sort-start',
			stop: 'auto-sort-stop'
		})
	}),
	state: Object.freeze({
		clear: 'tasks-clear'
	}),
	task: Object.freeze({
		created: 'task-created'
	})
})
