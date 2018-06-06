'use strict'

const {dialog, Menu} = require('electron')
const opn = require('opn')

const Data = load('Data.js')
const Sender = load('event/MainSender')
const Settings = load('Settings')
const {fileNew, fileOpen, fileSave} = load('event/GenericEventHandlers')

const menuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'New',
				accelerator: 'CommandOrControl+N',
				click () {
					fileNew()
				}
			},
			{
				label: 'Open',
				accelerator: 'CommandOrControl+O',
				click () {
					fileOpen()
				}
			},
			{
				label: 'Save',
				accelerator: 'CommandOrControl+S',
				click () {
					fileSave()
				}
			},
			{
				label: 'Save As...',
				click () {
					Data.saveTasksToFile(global.mainWindow, global.tasks)
				}
			},
			{ type: 'separator' },
			{ label: 'Quit', role: 'close' }
		]
	},
	{
		label: 'Settings',
		submenu: [
			{
				label: 'Auto Save',
				type: 'checkbox',
				checked: global.state.settings.read(Settings.Keys.Autosave),
				click (menuItem) {
					if(menuItem.checked)
					{
						global.state.settings.update(Settings.Keys.Autosave, true)
						Sender.autoSaveStart(global.mainWindow.webContents)
					}
					else
					{
						global.state.settings.update(Settings.Keys.Autosave, false)
						Sender.autoSaveStop(global.mainWindow.webContents)
					}
				}
			},
			{ role: 'toggledevtools' }
		]
	},
	{
		label: 'Help',
		submenu: [
			{
				label: 'About Open Task Timer',
				click () {
					dialog.showMessageBox(global.mainWindow, {
						type: 'info',
						buttons: ['Ok'],
						title: 'About Open Task Timer',
						message: 'Open Task Timer is an open source desktop application for effortlessly recording time spent doing all the things.'
					})
				}
			},
			{
				label: 'License',
				click () {
					dialog.showMessageBox(global.mainWindow, {
						type: 'info',
						button: ['Ok'],
						title: 'MIT License',
						message: `The MIT License (MIT)

Copyright (c) Peter Lunneberg 2017

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.`
					})
				}
			},
			{
				label: 'Source Code Repository',
				click () {
					opn('https://bitbucket.org/nemesisx00/open-task-timer')
				}
			},
			{
				label: 'Report an Issue',
				click () {
					opn('https://bitbucket.org/nemesisx00/open-task-timer/issues')
				}
			}
		]
	}
]

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)
