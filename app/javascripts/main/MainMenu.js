'use static'

module.exports = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Open',
				click () { }
			},
			{ role: 'close' }
		]
	},
	{
		label: 'Dev',
		submenu: [
			{ role: 'toggledevtools' }
		]
	}
]
