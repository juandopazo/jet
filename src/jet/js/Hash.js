
/**
 * Utilities for working with object literals
 * Throughout jet the Hash type means an object lieteral
 * @class Hash
 * @static
 */
Hash = {
	/**
	 * Iterats through a hash
	 * @method each
	 * @param {Hash} hash
	 * @param {Function} fn
	 * @param {Object} [thisp] Sets the value of the this keyword 
	 */
	each: function (hash, fn, thisp) {
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
	 * @param {Hash} hash
	 * @return {Array}
	 */
	keys: function (hash) {
		var keys = [];
		Hash.each(hash, function (key) {
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
		Hash.each(hash, function (key, value) {
			values[values.length] = value;
		});
		return values;
	}
};