
var OP = Object.prototype;

var Hash = $.Hash,
	Lang = $.Lang,
	A = $.Array,
	SLICE = Array.prototype.slice;
	
var Base;

/**
 * Utilities for object oriented programming in JavaScript.
 * JET doesn't provide a classical OOP environment like Prototype with Class methods,
 * but instead it helps you take advantage of JavaScript's own prototypical OOP strategy
 * @class OOP
 * @static
 */
/**
 * Object function by Douglas Crockford
 * <a href="https://docs.google.com/viewer?url=http://javascript.crockford.com/hackday.ppt&pli=1">link</a>
 * @private
 * @param {Object} o
 */
var toObj = function (o) {
	var F = function () {};
	F.prototype = o;
	return new F();
};

/**
 * Allows for an inheritance strategy based on prototype chaining.
 * When exteiding a class with extend, you keep all prototypic methods from all superclasses
 * @method extend
 * @param {Function} subclass
 * @param {Function} superclass
 * @param {Hash} optional - An object literal with methods to overwrite in the subclass' prototype
 */
var extend = function (r, s, px, ax) {
	// From the guys at YUI. This function is GENIUS!
	
	if (!s || !r) {
		// @TODO error symbols
		$.error("extend failed, verify dependencies");
	}

	var sp = s.prototype, rp = toObj(sp);
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