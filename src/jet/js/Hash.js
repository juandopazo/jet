
function clone(o, deep) {
	var n;
	if (Lang.isArray(o)) {
		n = [].concat(o);
		if (deep) {
			_Array.each(n, function (val, i) {
				n[i] = deep ? clone(val, deep) : val;
			});
		}
	} else if (o && o.hasOwnProperty && Lang.isObject(o, true)) {
		n = {};
		Hash.each(o, function (prop, val) {
			n[prop] = deep ? clone(val, deep) : val;
		});
	} else {
		n = o;
	}
	return n;
}

/**
 * Utilities for working with object literals
 * Throughout jet the Object type means an object literal
 * @class Object
 * @static
 */
var $Object = Hash = function (o) {
	return o || {};
};

mix($Object, {
	
	/**
	 * Creates a new object with the provided object as a prototype
	 * @method create
	 * @param {Object} prototype
	 * @return {Object}
	 */
	create: function(proto) {
		function F() {}
		F.prototype = proto;
		return new F();
	},
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