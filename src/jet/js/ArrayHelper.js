
/**
 * Utilities for working with Arrays
 * @class Array
 * @static
 */
ArrayHelper = {
	/**
	 * Iterates through an array
	 * @method each
	 * @param {Array} arr
	 * @param {Function} fn callback
	 * @param {Object} thisp sets up the <b>this</b> keyword inside the callback
	 */
	// check for native support
	each: Lang.isNative(AP.forEach) ? function (arr, fn, thisp) {
		
		arr.forEach(fn, thisp);
		
	} : function (arr, fn, thisp) {
		arr = arr || [];
		var i, length = arr.length;
		for (i = 0; i < length; i++) {
			fn.call(thisp, arr[i], i, arr);
		}
	},
	/**
	 * Searchs an haystack and removes the needle if found
	 * @method remove
	 * @param {Object} needle
	 * @param {Array} haystack
	 */
	remove: function (needle, haystack) {
		var i = 0;
		var length = haystack.length;
		while (i < length) {
			if (haystack[i] == needle) {
				haystack.splice(i, 1);
			} else {
				i++;
			}
		}
		return haystack;
	},
	/**
	 * Returns the index of the first occurence of needle
	 * @method indexOf
	 * @param {Object} needle
	 * @param {Array} haystack
	 * @return {Number}
	 */
	indexOf: Lang.isNative(AP.indexOf) ? function (needle, haystack) {
		
		return haystack.indexOf(needle);
		
	} : function (needle, haystack) {
		var i,
			length = haystack.length;
		for (i = 0; i < length; i = i + 1) {
			if (haystack[i] == needle) {
				return i;
			}
		}
		return -1;
	},
	/**
	 * Returns whether needle is present in haystack
	 * @method inArray
	 * @param {Object} needle
	 * @param {Array} haystack
	 * @return {Boolean}
	 */
	inArray: function (needle, haystack) {
		return this.indexOf(needle, haystack) > -1;
	}
};