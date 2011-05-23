var OP = Object.prototype,
	$_Array = $.Array,
	Lang = $.Lang;

/**
 * Utilities for object oriented programming in JavaScript.
 * @class jet~extend
 * @static
 */
/**
 * Allows for an inheritance strategy based on prototype chaining.
 * When exteiding a class with extend, you keep all prototypic methods from all superclasses
 * @method extend
 * @param {Function} subclass
 * @param {Function} superclass
 * @param {Hash} px optional - An object literal with methods to overwrite in the subclass' prototype
 * @param {Hash} ax optional - An object literal with properties to add to the subclass' constructor
 */
$.extend = function (r, s, px, ax) {
	// From the guys at YUI. This function is GENIUS!
	
	if (!s || !r) {
		// @TODO error symbols
		$.error("extend failed, verify dependencies");
	}

	var sp = s.prototype, rp = $.Object(sp);
	r.prototype = rp;

	rp.constructor = r;
	r.superclass = sp;

	// assign constructor property
	if (s != Object && sp.constructor == OP.constructor) {
		sp.constructor = s;
	}

	// add prototype overrides
	if (px) {
		$.mix(rp, px, true);
	}
	// add attributes
	if (ax) {
		$.mix(r, ax, true);
	}
	
	return r;
};

$.clone = function (o, deep) {
	var n;
	if (Lang.isArray(o)) {
		n = [].concat(o);
		if (deep) {
			$_Array.each(n, function (val, i) {
				n[i] = deep ? $.clone(val, deep) : val;
			});
		}
	} else if (o.hasOwnProperty && Lang.isObject(o, true)) {
		n = {};
		$.Hash.each(o, function (prop, val) {
			n[prop] = deep ? $.clone(val, deep) : val;
		});
	} else {
		n = o;
	}
	return n;
};
