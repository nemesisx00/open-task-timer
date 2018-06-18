'use strict'

const {app} = require('electron')
const fs = require('fs')
const path = require('path')

const Util = load('Util')

const defaultSettings = {
	autosave: true,
	autosort: true,
	monotask: false
}

function readSettings(file)
{
	if(!(fs.existsSync(file) && fs.statSync(file).isFile()))
		return defaultSettings
	
	let contents = fs.readFileSync(file)
	let json = JSON.parse(contents)
	return json && typeof json === 'object'
		? json
		: Object.assign({}, defaultSettings)
}

function keyExists(key)
{
	return Object.values(Settings.Keys).indexOf(key) > -1
}

class Settings
{
	constructor()
	{
		this.folder = app.getPath('userData')
		this.path = path.normalize(path.join(this.folder, Settings.FileName))
		this.data = readSettings(this.path)
	}
	
	read(key)
	{
		let out = undefined
		if(keyExists(key))
			out = this.data[key]
		return out
	}
	
	reset(key)
	{
		if(!key)
			this.data = Object.assign({}, defaultSettings)
		else if(keyExists(key))
			this.data[key] = defaultSettings[key]
	}
	
	save()
	{
		Util.writeFile(this.path, JSON.stringify(this.data))
	}
	
	update(key, value)
	{
		if(keyExists(key) && typeof value !== 'undefined')
		{
			this.data[key] = value
			this.save()
		}
	}
}

Settings.FileName = 'settings.otts'
Settings.Keys = Object.freeze({
	Autosave: 'autosave',
	Autosort: 'autosort',
	Monotask: 'monotask'
})

module.exports = Settings
