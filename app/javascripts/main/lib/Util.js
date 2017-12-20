'use strict'

class Util
{
	/**
	 * Merge objects together into a new object. Recurses through sub-objects to merge at all levels.
	 * Right-most objects in the parameter list will overwrite existing values.
	 * @param {object} objs... Arbitrary list of objects to merge together
	 * @return {object} Returns a new object containing the merged contents.
	 */
	static deepMerge()
	{
		let args = Array.from(arguments)
		let out = {}
		
		for(let obj of args)
		{
			if(obj && typeof obj === 'object' && !Array.isArray(obj))
			{
				for(let key in obj)
				{
					let prop = obj[key]
					if(typeof prop === 'object' && !Array.isArray(prop))
						out[key] = Util.deepMerge(out[key], prop)
					else
						out[key] = prop
				}
			}
		}
		
		return out
	}
}

module.exports = Util
