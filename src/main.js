'use strict'

require('./init')
const handleSquirrelEvent = require('./squirrel.js')

if(!(handleSquirrelEvent && handleSquirrelEvent()))
{
	const {app} = require('electron')
	
	const Listener = load('event/MainListener')
	const State = load('State')
	const {onAppReady, onWindowAllClosed} = load('event/GenericEventHandlers')
	
	global.mainWindow = null
	global.state = new State()
	global.tasks = []
	
	//Set up IPC event listeners
	Listener.initialize()
	
	//Set setup and tear down handlers
	app.on('ready', onAppReady)
	app.on('window-all-closed', onWindowAllClosed)
}
