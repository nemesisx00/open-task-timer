'use strict'

if(process.platform === 'win32')
{
	const {app} = require('electron')
	
	function handleSquirrelEvent()
	{
		if(process.argv.length === 1)
			return false
		
		const ChildProcess = require('child_process')
		const path = require('path')
		const appFolder = path.resolve(process.execPath, '..')
		const rootAtomFolder = path.resolve(appFolder, '..')
		const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
		const exeName = path.basename(process.execPath)
		
		const spawn = (command, args) => {
			let spawnedProcess
			try
			{
				spawnedProcess = ChildProcess.spawn(command, args, { detached: true })
			}
			catch(error)
			{
				//
			}
			
			return spawnedProcess
		}
		
		const spawnUpdate = args => {
			return spawn(updateDotExe, args)
		}
		
		switch(process.argv[1])
		{
			case '--squirrel-install':
			case '--squirrel-updated':
				spawnUpdate(['--createShortcut', exeName])
				setTimeout(app.quit, 1000)
				return true
			
			case '--squirrel-uninstall':
				spawnUpdate(['--removeShortcut', exeName])
				setTimeout(app.quit, 1000)
				return true
			
			case '--squirrel-obsolete':
				app.quit()
				return true
		}
	}
	
	module.exports = handleSquirrelEvent
}
else
	module.exports = false
