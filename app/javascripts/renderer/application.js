'use strict'

const Listener = require('./lib/Listener')
const Sender = require('./lib/Sender')

global.ui = []

Listener.initialize()

document.addEventListener('DOMContentLoaded', () => {
	setupListeners()
})

function setupListeners()
{
	document.getElementById('createNewEntry').addEventListener('click', taskCreateHandler)
}

function taskCreateHandler()
{
	let titleInput = document.getElementById('newLabel')
	if(titleInput && typeof titleInput.value === 'string' && titleInput.value.length > 0
		&& ![document.querySelectorAll('.task .title')].find(t => t.innerHTML === titleInput.value))
	{
		Sender.taskNew(titleInput.value)
	}
}
