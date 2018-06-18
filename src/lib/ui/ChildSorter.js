'use strict'

const {getGlobal} = require('electron').remote

const Keys = load('Settings').Keys
const Util = load('Util')

const observerOptions = { childList: true }
const defaultSort = (a, b) => a.innerHTML.localeCompare(b.innerHTML)

/**
 * Class to automatically sort an elements children.
 */
class ChildSorter
{
	constructor(selector, sort)
	{
		let el = Util.elementOrSelector(selector)
		if(!el)
			throw 'Invalid argument: selector'
		
		this.active = true
		this.element = el
		this.sort = typeof sort === 'function' ? sort : defaultSort
		
		let self = this
		this.observer = new MutationObserver(mutations => self._mutationCallback(mutations))
		this._start()
	}
	
	_mutationCallback(mutations)
	{
		if(!this.active)
			this.observer.disconnect()
		else if(this.element && this.element.children && mutations.find(m => m.type === 'childList'))
		{
			this.observer.disconnect()
			
			let arr = []
			for(let el of this.element.children)
			{
				arr.push(el)
			}
			
			arr.sort(this.sort)
			arr.forEach(el => this.element.appendChild(el))
			this._start()
		}
	}
	
	_start() { this.observer.observe(this.element, observerOptions) }
}

module.exports = ChildSorter
