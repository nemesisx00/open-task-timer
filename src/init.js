'use strict'

const path = require('path')

const libPath = path.join(__dirname, 'lib')

global.load = name => {
	return require(path.normalize(path.join(libPath, name)))
}

global.APPTITLE = require('../package.json').productName
global.VERSION = require('../package.json').version
