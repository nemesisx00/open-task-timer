'use strict'
/* global load */

require('../init')

const Sender = load('event/BrowserSender')
const Listener = load('event/BrowserListener')
const Util = load('Util')

global.defaults = Object.freeze({
	autoSaveDelay: 60000
})
global.taskUis = []
global.autoSaveTimer = setInterval(Sender.autoSave, global.defaults.autoSaveDelay)

Listener.initialize()

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('createNewEntry').addEventListener('click', taskCreateHandler)
	document.getElementById('newLabel').addEventListener('change', toggleAddButton)
})

// --------------------------------------------------

let titleInput = document.getElementById('newLabel')

function taskCreateHandler()
{
	if(titleInput && typeof titleInput.value === 'string' && titleInput.value.length > 0
		&& ![document.querySelectorAll('.task .title')].find(t => t.innerHTML === titleInput.value))
	{
		Sender.taskNew(titleInput.value)
	}
}

function toggleAddButton()
{
	let active = titleInput && titleInput.value.length > 0
	
	if(active)
		Util.toggleClassName(titleInput, 'active')
}
