
var OP = Object.prototype,
	AP = Array.prototype,
	SP = String.prototype,
	SLICE = AP.slice,
	TOSTRING = OP.toString;

 //A couple of functions of this module are used throughout the Loader.
 //Should this be defined as any other module with the jet.add() method?
var ARRAY		= "array",
	BOOLEAN		= "boolean",
	FUNCTION	= "function",
	OBJECT		= "object",
	HASH		= "hash",
	NULL		= "null",
	NUMBER		= "number",
	STRING		= "string",
	UNDEFINED	= "undefined";
	
var _Array, Hash;

/**
 * Provides utility methods for finding object types and other
 * methods that javascript provides in some browsers but not in others such as trim()
 * @class Lang
 * @static
 */
var Lang = (function () {
	
	var types = {
		"number"			: NUMBER,
		"string"			: STRING,
		"undefined"			: UNDEFINED,
		"[object Function]" : FUNCTION,
		"[object Array]"	: ARRAY,
		"boolean"           : BOOLEAN
	};
	
	/*
	 * Type function and constants from YUI
	 */
	var type = function (o) {
		return types[typeof o] || types[TOSTRING.call(o)] || (o ? OBJECT : NULL);
	};
	
	/*
	 * RegExp by @some
	 * http://stackoverflow.com/questions/574584/javascript-check-if-method-prototype-has-been-changed/574741#574741
	 */
	var isNative = function (func) {
	    return (new RegExp('^\s*function[^\{]+{\s*\[native code\]\s*\}\s*$')).test(func);
	};

	return {
		/**
		 * Returns if o is a number
		 * @method isNumber
		 * @param {Object} o
		 */
		isNumber: function (o) {
			return type(o) === NUMBER && isFinite(o);
		},
		/**
		 * Returns if o is a string
		 * @method isString
		 * @param {Object} o
		 */
		isString: function (o) {
			return type(o) === STRING;
		},
		/**
		 * Returns if o is an array
		 * @method isArray
		 * @param {Object} o
		 */
		isArray: function (o) {
			return type(o) === ARRAY;
		},
		/**
		 * Returns if o is a function
		 * @method isFunction
		 * @param {Object} o
		 */
		isFunction: function (o) {
			return type(o) === FUNCTION;
		},
		isObject: function (o, failfn) {
			var t = typeof o;
			return (o && (t === OBJECT || (!failfn && (t === FUNCTION || Lang.isFunction(o))))) || false;
		},
		/**
		 * Returns if o is a boolean
		 * @method isBoolean
		 * @param {Object} o
		 */
		isBoolean: function (o) {
			return typeof o == BOOLEAN;
		},
		/**
		 * Returns if o is undefined
		 * @method isUndefined
		 * @param {Object} o
		 */
		isUndefined: function (o) {
			return typeof o == UNDEFINED;
		},
		/**
		 * Returns the type of the object
		 * @method type
		 * @param {Object} o
		 */
		type: type,
		/**
		 * Returns whether the function is a native function or not
		 * @method isNative
		 * @param {Function} o
		 */
		isNative: isNative,
		/**
		 * Returns false if o is undefined, null, NaN or Infinity. In any other case, return true
		 * @method isValue
		 * @param {Object} o
		 */
		isValue: function (o) {
			var t = type(o);
			switch (t) {
			case NUMBER:
				return isFinite(o);
			case NULL:
			case UNDEFINED:
				return false;
			case BOOLEAN:
				return true;
			default:
				return !!(t);
			}
		},
		is: function (o) {
			return o instanceof this;
		},
		/**
		 * Returns a string without any leading or trailing whitespace.
		 * Code by Steven Levithan
		 * http://blog.stevenlevithan.com/archives/faster-trim-javascript
		 * @method trim
		 * @param {String} the string to trim
		 * @return {string} the trimmed string
		 */
		// check for native support
		trim: isNative(SP.trim) ? function (str) {
			return str.trim();
		} : function (str) {
			str = str.replace(/^\s\s*/, "");
			var ws = /\s/,
			i = str.length - 1;
			while (ws.test(str.charAt(i))) {
				i--;
			}
			return str.slice(0, i + 1);
		},
		capitalize: function (str) {
			return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
		},
		/**
		 * A more traditional random function. Returns a random integer between 0 and num-1
		 * @method random
		 * @param {Number} num
		 */
		random: function (num) {
			num = Math.random() * num;
			return num === 0 ? 0 : Math.ceil(num) - 1;
		},
		/**
		 * Clones an object, returning a copy with the sames properties
		 * @method clone
		 * @param {Object} o
		 */
		clone: function clone(o) {
			var n;
			if (Lang.isHash(o)) {
				n = {};
				Hash.each(o, function (key, value) {
					n[key] = clone(value);
				});
			} else if (Lang.isArray(o)) {
				n = [];
				_Array.each(o, function (value) {
					n[n.length] = clone(value);
				});
			} else {
				n = o;
			}
			return n;
		}
	};
}());

var bind;
if (Function.prototype.bind) {
	bind = function (fn) {
		return Function.prototype.bind.apply(fn, SLICE.call(arguments, 1));
	};
} else {
	bind = function(fn, obj) {
		var slice = [].slice,
			args = slice.call(arguments, 2), 
			nop = function () {}, 
			bound = function () {
			  return fn.apply( this instanceof nop ? this : ( obj || {} ), 
								  args.concat( slice.call(arguments) ) );	
			};
		nop.prototype = fn.prototype;
		bound.prototype = new nop();
		return bound;
	};
}

function namespace(name) {
	var names = name.split('.'),
		o = this,
		i = 0;
	for (; i < names.length; i++) {
		if (!o[names[i]]) {
			o[names[i]] = {};
		}
		o = o[names[i]];
	}
	return o;
}
