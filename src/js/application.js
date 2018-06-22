'use strict'

require('../init')
const {getGlobal} = require('electron').remote

const ChildSorter = load('ui/ChildSorter')
const TaskContextMenu = load('ui/TaskContextMenu')
const Listener = load('event/BrowserListener')
const Sender = load('event/BrowserSender')
const Keys = load('Settings').Keys
const Util = load('Util')

global.defaults = Object.freeze({
	autoSaveDelay: 60000
})
global.taskUis = []
global.autoSaveTimer = setInterval(Sender.autoSave, global.defaults.autoSaveDelay)
global.taskSorter = null
global.taskContextMenu = new TaskContextMenu()

Listener.initialize()

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('createNewEntry').addEventListener('click', taskCreateHandler)
	
	let newLabel = document.getElementById('newLabel')
	newLabel.addEventListener('input', toggleAddButton)
	newLabel.addEventListener('keyup', e => {
		if(e.key === 'Enter')
			taskCreateHandler()
	})
	
	global.taskSorter = new ChildSorter('#container', (a, b) => a.querySelector('.title').innerHTML.localeCompare(b.querySelector('.title').innerHTML))
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
