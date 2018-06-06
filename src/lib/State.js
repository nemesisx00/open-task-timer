'use strict'

const Settings = load('Settings')

class State
{
	constructor()
	{
		this.activePath = null
		this.needsToSave = false
		
		this.settings = new Settings()
	}
}

module.exports = State
