
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
	forEach: Lang.isNative(AP.forEach) ? function (arr, fn, thisp) {
		
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
	 * Creates a new array with the results of calling a provided function on every element in this array
	 * @method map
	 * @param {Array} arr
	 * @param {Function} callback Function that produces an element of the new Array from an element of the current one
	 * @param {Object} thisObject Object to use as 'this' when executing 'callback'
	 */
	map: function (arr, fn, thisp) {
		var results = [];
		ArrayHelper.each(arr || [], function (item) {
			var output = fn.call(thisp, item);
			if (Lang.isValue(output)) {
				if (Lang.isArray(output)) {
					results.push.apply(results, output);
				} else if (output instanceof ArrayList) {
					output.each(function (item) {
						if (ArrayHelper.indexOf(item, results) == -1) {
							results[results.length] = item;
						}
					});
				} else if (ArrayHelper.indexOf(output, results) == -1){
					results[results.length] = output;
				}
			}
		});
		return results;
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

ArrayHelper.each = ArrayHelper.forEach;