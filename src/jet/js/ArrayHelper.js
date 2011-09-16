
function mix(a, b, overwrite, clonefirst) {
	a = a || {};
	b = b || {};
	if (clonefirst) {
		a = clone(a);
	}
	if (b.hasOwnProperty) {
		for (var x in b) {
			if (b.hasOwnProperty(x) && (!a.hasOwnProperty(x) || overwrite)) {
				a[x] = b[x];
			}
		}
	}
	return a;
};

/**
 * Utilities for working with Arrays
 * @class Array
 * @static
 */
var _Array = function (o) {
	var result;
	if (Lang.isArray(o)) {
		result = o;
	} else if (Lang.isObject(o) && 'length' in o) {
		result = [];
		for (var i = 0, length = o.length; i < length; i++) {
			result[i] = o[i];
		}
	} else {
		result = Lang.isUndefined(o) ? [] : [o];
	}
	return result;
};
mix(_Array, {
	/**
	 * Iterates through an array
	 * @method each
	 * @param {Array} arr
	 * @param {Function} fn callback
	 * @param {Object} thisp sets up the <b>this</b> keyword inside the callback
	 */
	// check for native support
	forEach: AP.forEach ? function (arr, fn, thisp) {
		
		AP.slice.call(Lang.isValue(arr) ? arr : []).forEach(fn, thisp);
		
	} : function (arr, fn, thisp) {
		arr = Lang.isValue(arr) ? arr : [];
		var i, length = arr.length;
		for (i = 0; i < length; i++) {
			if (i in arr) {
				fn.call(thisp, arr[i], i, arr);
			}
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
	indexOf: AP.indexOf ? function (haystack, needle) {
		
		return haystack.indexOf(needle);
		
	} : function (haystack, needle) {
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
	 * Calls a given function on all items of an array and returns a new array with the return value of each call
	 * @param {Array} array Array to map
	 * @param {Function} fn Function to call on each item
	 * @pram {Object} thisp Optional context to apply to the given function
	 */
	map: AP.map ? function (arr, fn, thisp) {
		return arr.map(fn, thisp);
	} : function (arr, fn, thisp) {
		var result = [];
		_Array.forEach(arr, function (item, i) {
			result[i] = fn.call(thisp, item, i, arr);
		});
		return result;
	}
});

_Array.each = _Array.forEach;