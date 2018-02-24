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
	document.getElementById('newLabel').addEventListener('input', toggleAddButton)
})

// --------------------------------------------------

let addButton = document.getElementById('createNewEntry')
let titleInput = document.getElementById('newLabel')

function taskCreateHandler()
{
	let value = titleInput.value
	if(Util.checkType(value, 'string') && value.length > 0
		&& ![document.querySelectorAll('.task .title')].find(t => t.innerHTML === value))
	{
		Sender.taskNew(value)
	}
}

function toggleAddButton()
{
	if(titleInput.value.length > 0)
		Util.removeClassName(addButton, 'disabled')
	else
		Util.addClassName(addButton, 'disabled')
}
