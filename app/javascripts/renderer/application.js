//const {ipcRenderer} = require('electron')
const Task = require('../main/Task.js')

document.addEventListener('DOMContentLoaded', () => {
	let tempRow = new Task(1, 'My New Task', { generateRow: true })
	
	document.querySelector('body').addEventListener('click', () => {
		if(!tempRow.isActive())
			tempRow.start()
		else
			tempRow.stop()
		console.log(tempRow)
	})
})
