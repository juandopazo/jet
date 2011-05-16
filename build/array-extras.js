/**
 * Array extras based on ES5
 * @module array-extras
 * @requires 
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('array-extras', function ($) {

			
var AP = Array.prototype,

ArrayExtras = {
	
	filter: function (arr, callback, context) {
		var length = arr.length,
			i = 0,
			result = [];
		for (; i < length; i++) {
			if (i in arr && callback.call(context, arr[i], i, arr)) {
				result.push(arr[i]);
			}
		}
		return result;
	},
	
	every: function (arr, callback, context) {
		var length = arr.length,
			i = 0;
		
		for (; i < length; i++) {
			if (i in arr && !callback.call(context, arr[i], i, arr)) {
				return false;
			}
		}
		return true;
	},
	
	/**
	 * Creates a new array with the results of calling a provided function on every element in this array
	 * @method map
	 * @param {Array} arr The Array to map
	 * @param {Function} callback Function that produces an element of the new Array from an element of the current one
	 * @param {Object} thisp Object to use as 'this' when executing 'callback'
	 */
	map: function (arr, callback, thisp) {
		var result = [],
			length = arr.length,
			i = 0;
		
		for (; i < length; i++) {
			if (i in arr) {
				result[i] = callback.call(thisp, arr[i], i, arr);
			}
		}
		return result;
	},
	
	some: function (arr, callback, context) {
		var length = arr.length,
			i = 0;
		
		for (; i < length; i++) {
			if (i in arr && !callback.call(context, arr[i], i, arr)) {
				return true;
			}
		}
		return false;
	},
	
	reduce: function (arr, callback, accumulator) {
		var length = arr.length,
			i = 0;
			
		// no value to return if no initial value and an empty array
		if (length === 0 && arguments.length === 1) {
			throw new TypeError();
		}

		if (arguments.length < 2) {
			do {
				if (i in arr) {
					accumulator = arr[i++];
					break;
				}

				// if array contains no values, no initial value to return
				if (++i >= length) {
					throw new TypeError();
				}
			}
			while (true);
		}

		while (i < length) {
			if (i in arr) {
				accumulator = callback.call(undefined, accumulator, arr[i], i, arr);
			}
			i++;
		}

		return accumulator;
	}
	
};

$.Object.each(ArrayExtras, function (name, fn) {
	
	$.Array[name] = AP[name] ? function (arr) { return AP[name].apply(arr, AP.slice.call(arguments, 1)); } : fn;
	
});

$.Array.forEach(['filter', 'every', 'some', 'reduce'], function (method) {
	
	$.ArrayList.prototype[method] = function () {
		return $.Array[method].apply(null, [this._items].concat(arguments));
	};
	
});

			
});
