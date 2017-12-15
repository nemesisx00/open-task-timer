var path = require('path')

module.exports = {
	appPath: function() {
		switch(process.platform) {
			case 'darwin':
				return path.join(__dirname, '..', '.tmp', 'mac', 'OpenTaskTimer.app', 'Contents', 'MacOS', 'OpenTaskTimer')
			case 'linux':
				return path.join(__dirname, '..', '.tmp', 'linux', 'OpenTaskTimer')
			default:
				throw 'Unsupported platform'
		}
	}
}
