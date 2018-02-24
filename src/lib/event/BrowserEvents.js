'use strict'

module.exports = Object.freeze({
	auto: Object.freeze({
		save: Object.freeze({
			start: 'auto-save-start',
			stop: 'auto-save-stop'
		}),
		saved: 'auto-saved'
	}),
	task: Object.freeze({
		clear: 'tasks-clear',
		created: 'task-created',
		opened: 'tasks-opened',
		saved: 'task-saved',
		span: Object.freeze({
			created: 'task-span-created',
			updated: 'task-span-updated'
		})
	})
})
