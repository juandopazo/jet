
var mix = function (a, b, overwrite) {
	a = a || {};
	b = b || {};
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
 * Utilities for working with object literals
 * Throughout jet the Object type means an object lieteral
 * @class Object
 * @static
 */
var $Object = Hash = function (proto) {
	var F = function () {};
	F.prototype = proto;
	return new F();
};

mix($Object, {
	/**
	 * Iterats through a hash
	 * @method each
	 * @param {Object} hash
	 * @param {Function} fn
	 * @param {Object} [thisp] Sets the value of the this keyword 
	 */
	each: function (hash, fn, thisp) {
		hash = hash || {};
		for (var x in hash) {
			if (hash.hasOwnProperty(x)) {
				if (fn.call(thisp || hash, x, hash[x], hash) === false) {
					break;
				}
			}
		}
	},
	/**
	 * Returns an array with all the keys of a hash
	 * @method keys
	 * @param {Object} hash
	 * @return {Array}
	 */
	keys: function (hash) {
		var keys = [];
		$Object.each(hash, function (key) {
			keys[keys.length] = key;
		});
		return keys;
	},
	/**
	 * Returns an array with all the valus of a hash
	 * @method values
	 * @param {Object} hash
	 * @return {Array}
	 */
	values: function (hash) {
		var values = [];
		$Object.each(hash, function (key, value) {
			values[values.length] = value;
		});
		return values;
	},
	mix: mix
});