(() => {
	'use strict'
	
	const path = require('path')
	
	const libPath = path.join(__dirname, 'lib')
	
	global.load = name => {
		return require(path.normalize(path.join(libPath, name)))
	}
})()
