/*
Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
Code licensed under the BSD License
https://github.com/juandopazo/jet/blob/master/LICENSE.md

@module jet
*/

if (!window.jet) {

(function () {


var doc = document;
	
var NODE = 'node',
	BASE = 'base',
	CSS = 'css',
	IO = 'io',
	WIDGET_PARENTCHILD = 'widget-parentchild',
	SOLID = 'solid';

var GlobalConfig = {
	base: location.protocol + '//github.com/juandopazo/jet/raw/master/build/',
	combine: true,
	root: location.protocol + '//jet.nodester.com/',
	modules: {},
	groups: {
		jet: {
			modules: {
				log: {},
				oop: {},
				node: ['oop'],
				xsl: [NODE],
				swf: {},
				json: [NODE],
				cookie: [BASE],
				sizzle: [NODE],
				base: [NODE],
				io: ['json'],
				deferred: ['oop'],
				'io-xdr': [NODE, 'swf', IO],
				history: [BASE, 'json'],
				'resize-styles': {
					type: CSS,
					beacon: {
						name: "borderLeftStyle",
						value: SOLID
					}
				},
				resize: [BASE, 'resize-styles'],
				'button-styles': {
					type: CSS,
					beacon: {
						name: "borderBottomStyle",
						value: SOLID
					}
				},
				button: [WIDGET_PARENTCHILD, 'button-styles'],
				'container-styles': {
					type: CSS,
					beacon: {
						name: "borderRightStyle",
						value: SOLID
					}
				},
				container: [BASE, 'widget-alignment', 'widget-stack', 'container-styles'],
				'progressbar-styles': {
					type: CSS,
					beacon: {
						name: "cursor",
						value: "pointer"
					}
				},
				progressbar: [BASE, 'progressbar-styles'],
				dragdrop: [BASE],
				imageloader: [BASE],
				anim: [BASE],
				datasource: [BASE],
				'datatable-styles': {
					type: CSS,
					beacon: {
						name: "borderTopStyle",
						value: SOLID
					}
				},
				datatable: ['io', "datasource", 'datatable-styles'],
				'tabview-styles': {
					type: CSS,
					beacon: {
						name: "display",
						value: "none"
					}
				},
				'treeview-styles': {
					type: CSS,
					beacon: {
						name: 'visibility',
						value: 'hidden'
					}
				},
				tabview: [WIDGET_PARENTCHILD, 'tabview-styles'],
				treeview: [WIDGET_PARENTCHILD, 'treeview-styles'],
				'widget-alignment': [BASE],
				'widget-stack': [BASE],
				'widget-parentchild': [BASE],
				'widget-sandbox': [BASE],
				menu: [WIDGET_PARENTCHILD, 'container'],
				vector: ['anim'],
				layout: ['resize', WIDGET_PARENTCHILD]
			}
		}
	}
};
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
/**
 * Utilities for working with Arrays
 * @class Array
 * @static
 */
_Array = {
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
	}
};

_Array.each = _Array.forEach;
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
};var ArrayMethods,
	ArrayHelperMethods,
	ARRAYLIST_PROTO;

/**
 * A collection of elements
 * @class ArrayList
 * @constructor
 * @param {Array|Object} items An element or an array of elements 
 */
function ArrayList(items) {
	this._items = !Lang.isValue(items) ? [] : Lang.isArray(items) ? items : [items];
}
ARRAYLIST_PROTO = ArrayList.prototype = {
	/**
	 * Creates a new ArrayList with the results of calling a provided function on every element in this array
	 * @method map
	 * @param {Function} callback Function that produces an element of the new Array from an element of the current one
	 * @param {Object} thisp Object to use as 'this' when executing 'callback'
	 * @return ArrayList
	 */
	map: function (fn, thisp) {
		var results = [];
		_Array.forEach(this._items, function (item) {
			var output = fn.call(thisp, item);
			if (Lang.isValue(output)) {
				if (Lang.isArray(output)) {
					results.push.apply(results, output);
				} else if (output instanceof ArrayList) {
					output.forEach(function (item) {
						if (_Array.indexOf(results, item) == -1) {
							results[results.length] = item;
						}
					});
				} else if (_Array.indexOf(results, output) == -1){
					results[results.length] = output;
				}
			}
		});
		return new (this.constructor)(results);
	},
	/**
	 * Returns the length of this ArrayList
	 * @method size
	 * @return Number
	 */
	size: function () {
		return this._items.length;
	},
	/**
	 * @method item
	 * @description Returns a new ArrayList with the nth element of the current list
	 * @param {Number} nth
	 * @return ArrayList
	 */
	item: function (index) {
		return new (this.constructor)([this._items[index]]);
	}
};

ArrayMethods = {
	/** Returns a new ArrayList combining the given ArrayList(s) 
	  * @method concat
	  * @param {ArrayList | Array} valueN Arrays/ArrayLists and/or values to
	  * concatenate to the resulting ArrayList
	  * @return {ArrayList} A new ArrayList comprised of this ArrayList joined with the input.
	  */
	'concat': 1,
	/** Removes the first last from the ArrayList and returns it.
	  * @method pop
	  * @return {Object} The last item in the ArrayList.
	  */
	'pop': 0,
	/** Adds the given Node(s) to the end of the ArrayList. 
	  * @method push
	  * @param {Node | DOMNode} nodes One or more nodes to add to the end of the ArrayList. 
	  */
	'push': 0,
	/** Removes the first item from the ArrayList and returns it.
	  * @method shift
	  * @return {Object} The first item in the ArrayList.
	  */
	'shift': 0,
	/** Returns a new ArrayList comprising the Nodes in the given range. 
	  * @method slice
	  * @param {Number} begin Zero-based index at which to begin extraction.
	  As a negative index, start indicates an offset from the end of the sequence. slice(-2) extracts the second-to-last element and the last element in the sequence.
	  * @param {Number} end Zero-based index at which to end extraction. slice extracts up to but not including end.
	  slice(1,4) extracts the second element through the fourth element (elements indexed 1, 2, and 3).
	  As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence.
	  If end is omitted, slice extracts to the end of the sequence.
	  * @return {ArrayList} A new ArrayList comprised of this ArrayList joined with the input.
	  */
	'slice': 1,
	/** Changes the content of the ArrayList, adding new elements while removing old elements.
	  * @method splice
	  * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end.
	  * @param {Number} howMany An integer indicating the number of old array elements to remove. If howMany is 0, no elements are removed. In this case, you should specify at least one new element. If no howMany parameter is specified (second syntax above, which is a SpiderMonkey extension), all elements after index are removed.
	  * {Node | DOMNode| element1, ..., elementN 
	  The elements to add to the array. If you don't specify any elements, splice simply removes elements from the array.
	  * @return {ArrayList} The element(s) removed.
	  */
	'splice': 1,
	/** Adds the given Node(s) to the beginning of the ArrayList. 
	  * @method push
	  * @param {Object} nodes One or more nodes to add to the ArrayList. 
	  */
	'unshift': 0
};

ArrayHelperMethods = {
	/**
	 * @method indexOf
	 * @description Returns the index of the searched item or -1 if it didn't find it
	 * @param {Object} item Some object
	 * @return Number
	 */
	indexOf: 2,
	/**
	 * Returns a new ArrayList with only the elements for which the provided function returns true
	 * @method filter
	 * @param {Function} fn
	 * @return ArrayList
	 */
	filter: 1,
	/**
	 * Iterates through the ArrayList
	 * The callback is passed a reference to the element and an iteration index. 
	 * @method forEach
	 * @param {Function} callback
	 * @chainable
	 */
	forEach: 0
};

Hash.each(ArrayMethods, function (method, returnArrayList) {
	
	ARRAYLIST_PROTO[method] = function () {
		var args = [],
			i = 0,
			arg,
			ret;

		while (typeof (arg = arguments[i++]) != 'undefined') { // use arraylists 
			args.push(arg._items || arg);
		}

		ret = AP[name].apply(this._items, args);

		return returnArrayList ? new (this.constructor)(ret) : ret;
	};
	
});

Hash.each(ArrayHelperMethods, function (method, returnType) {
	
	ARRAYLIST_PROTO[method] = function () {
		var result = _Array[method].apply(null, [this._items].concat(AP.slice.call(arguments)));
		return returnType === 0 ? this :
				returnType === 1 ? new (this.constructor)(result) :
				result;
	};
	
});

ARRAYLIST_PROTO.each = ARRAYLIST_PROTO.forEach;

/**
 * Browser sniffing
 * @class UA
 * @static
 */
var UA = (function () {
	var nav = window.navigator,
		ua = nav.userAgent.toLowerCase(),
		p = nav.platform.toLowerCase();

	var webkit = /KHTML/.test(ua) || /webkit/i.test(ua),
		opera = /opera/i.test(ua),
		ie = /(msie) ([\w.]+)/.exec(ua);
		
	ie = ie && ie[1] && ie[2] ? parseFloat(ie[2]) : false;
	
    return {
		/**
		 * true if the browser uses the Webkit rendering engine (ie: Safari, Chrome)
		 * @property webkit
		 */
		webkit: webkit,
		/**
		 * If the browser is Internet Explorer, this property is equal to the IE version. If not, it is false
		 * @property ie
		 */
		ie: ie, // ie is false, 6, 7 or 8
		/**
		 * true if the browser is Opera
		 * @property opera
		 */
		opera: opera,
		/**
		 * true if the browser is based on the Gecko rendering engine (ie: Firefox)
		 * @property gecko
		 */
		gecko: !webkit && !opera && !ie && /Gecko/i.test(ua),
		/**
		 * true if the operating system is Windows
		 * @property win
		 */
		win: p ? /win/.test(p) : /win/.test(ua), 
		/**
		 * true if the operating system is Apple OSX
		 * @property mac
		 */
		mac: p ? /mac/.test(p) : /mac/.test(ua),
		
		support: {
			fixed: !ie || (ie > 7 && document.documentMode > 6)
		}
	};
}());
var domReady = function (fn, lib, _doc) {
	_doc = _doc || doc;
	if (_doc.body) {
		fn.call(doc, lib);
	} else {
		setTimeout(function () {
			domReady(fn, lib, _doc);
		}, 13);
	}
};

var mix = function (a, b, overwrite) {
	a = a || {};
	b = b || {};
	if (b.hasOwnProperty) {
		for (var x in b) {
			if (b.hasOwnProperty(x) && (!a[x] || overwrite)) {
				a[x] = b[x];
			}
		}
	}
	return a;
};

/**
 * Loads scripts and CSS files.
 * Included in the jet() core
 * @class Get
 * @static
 */
var Get = function (conf) {
	
	var doc = this._doc = conf.doc;
	var before = Lang.isString(conf.before) ? doc.getElementById(conf.before) : conf.before;
	this._head = doc.getElementsByTagName('head')[0];
	this._before = before || conf.before;
	
};
Get.prototype = {
	/**
	 * Loads a script asynchronously
	 * @method script
	 * @param {String} url
	 * @chainable
	 */
	script: function (url, keep) {
		var script = this._create('script', {
			type: 'text/javascript',
			asyng: true,
			src: url
		});
		this._insert(script);
		if (!keep) {
			setTimeout(function () {
				
				//Added src = null as suggested by Google in 
				//http://googlecode.blogspot.com/2010/11/instant-previews-under-hood.html
				script.src = null;
				if (script.parentNode) {
					script.parentNode.removeChild(script);
				}
			}, 10000);
		}
		return this;
	},
	/**
	 * Loads a CSS file
	 * @method css
	 * @param {String} url
	 * @chainable
	 */
	css: function (url, callback) {
		callback = callback || function() {};
		var node = this._create('link', {
			type: 'text/css',
			rel: 'stylesheet',
			href: url
		});
		var interval, count = 0, stylesheets = this._doc.styleSheets;
		this._insert(node);
		if (UA.ie) {
			node.onreadystatechange = function () {
				var readyState = this.readyState;
				if (readyState === 'loaded' || readyState === 'complete') {
					this.onreadystatechange = null;
					callback(node);
				}
			};
		} else if (UA.webkit) {
			url = node.href;
			interval = setInterval(function () {
				for (var i = 0, length = stylesheets.length; i < length; i++) {
					if (stylesheets[i].href == url) {
						clearInterval(interval);
						callback(node);
						break;
					}
				}
				if (++count == 100) {
					clearInterval(interval);
					callback(node);
				}
			}, 50);
		} else {
			if (Lang.isFunction(callback)) {
				setTimeout(callback, 80);
			}
		}
		return this;
	},
	
	_create: function (name, attrs) {
		var node = this._doc.createElement(name);
		Hash.each(attrs, function (attr, val) {
			node[attr] = val;
		});
		return node;
	},
	
	_insert: function (node) {
		this._refresh();
		var before = this._before;
		if (before && !Lang.isString(before)) {
			before.parentNode.insertBefore(node, before);
		} else {
			this._head.appendChild(node);
		}
	},
	
	_refresh: function () {
		var doc = this._doc;
		var before = this._before;
		if (!this._head) {
			this._head = doc.getElementsByTagName('head')[0];
		}
		if (Lang.isString(before)) {
			this._before = doc.getElementById(before) || before;
		}
	}
};

/**
 * Core methods
 * @class Core
 * @static
 */
function buildJet(config) {
	
	/**
	 * Walks through the DOM tree starting in th branch that derives from node
	 * @method walkTheDOM
	 * @param {HTMLElement} node
	 * @param {Function} fn
	 */
	var walkTheDOM = function (node, fn) {
		fn(node);
		node = node.firstChild;
		while (node) {
			if (node.nodeType != 3) {
				walkTheDOM(node, fn);
			}
			node = node.nextSibling;
		}
	};
	
	/*
	 * Rudimentary getElementsByClassName based on by Douglas Crockford's
	 * https://docs.google.com/viewer?url=http://javascript.crockford.com/hackday.ppt&pli=1
	 */
	var getByClass = function (className, root) {
		if (root.getElementsByClassName) {
			getByClass = function (className, root) {
				return root.getElementsByClassName(className);
			};
		} else {
			getByClass = function (className, root) {
				var result = [];
				walkTheDOM(root, function (node) {
					var a, c = node.className, i;
					if (c && _Array.indexOf(c.split(' '), className) > -1) {
						result[result.length] = node;
					}
				});
				return result;
			};
		}
		return getByClass(className, root);
	};
	
	/**
	 * The global object is a finder method that finds HTML elements.
	 * The query string allows for different simple searches: "#foo" (get elemnet by id), ".foo" (gets elements by class), "foo" (get elements by tag) or an array of html elements
	 * For more complex queries, take a look at the Sizzle module
	 * @method $
	 * @param {String|HTMLElement|Array} query
	 * @param {HTMLElement|Document} root
	 * @return {NodeList}
	 */
	// @TODO: consider moving this to the Node module
	var $ = function Jet(query, root) {
		root = root || $.context;
		root = root.ownerDocument || root;
		if (Lang.isString(query)) {
			query = $.find(query, root);
			query = new $.NodeList(Lang.isValue(query) ? query : []);
		} else {
			query = new $.NodeList(query);
		}
		return query;
	};
	
	var add = function (o) {
		mix($, o, true);
	};
	
	if (config.win.JSON) {
		$.JSON = config.win.JSON;
	}
	
	add({
		bind: bind,
		
		/**
		 * A pointer to the last Windo that was referenced by the $() function
		 * @property win
		 */
		win: config.win,
		/**
		 * A pointer to the last Document that was referenced by the $() function.
		 * @property context
		 */
		context: config.doc,
		
		/**
		 * Does all the work behind the $() function
		 * You shouldn't overwrite it unless you know what you're doing
		 * @protected 
		 * @param {String} query
		 * @param {HTMLElement|Document} root
		 */
		find: function (query, root) {
			root = root || $.context;
			var c = query.charAt(0), test, node = null;
			if (c === '<' && query.charAt(query.length - 1) === '>') {
				if (query.match(/</g).length === 1) {
					// suport for '<div/>' and '<div>'
					return root.createElement(query.substr(1, query.length - (query.charAt(query.length - 2) === '/' ? 3 : 2)));
				} else {
					// Check for strings like "<div><span><a/></span></div>"
					test = query.match(/<([a-z]+)>(.+)<\/([a-z]+)>/i);
					if (test.length == 4 && test[1] == test[3]) {
						node = root.createElement(test[1]);
						node.innerHTML = test[2];
					}
					return node;
				}
			} else {
				return c === '#' ? root.getElementById(query.substr(1)) : 
					   c === '.' ? getByClass(query.substr(1), root) :
					   root.getElementsByTagName(query);
			}
		},
		
		/**
		 * Copies all properties from B to A.
		 * Doesn't overwrite properties unless the overwrite parameter is true
		 * @method mix
		 * @param {Object} A
		 * @param {Object} B
		 * @param {Boolean} [overwrite]
		 */
		mix: mix,
		
		/**
		 * Adds properties to the $ object (shortcut for adding classes)
		 * @method add
		 * @param {Hash} key/value pairs of class/function names and definitions
		 */
		add: add,
		
		walkTheDOM: walkTheDOM,
		
		Lang: Lang,
		
		'Array': _Array,
		
		ArrayList: ArrayList,
		
		Hash: Hash,
		
		'Object': Hash,
		
		config: config,
		
		UA: UA
		
	});
	
	$.Get = new Get(config);
	
	return $;
};
/*
 * Variables used by the loader to hold states and information.
 * - "queueList" contains the requests made to the loader. 
 *   Once a request is delivered, it is deleted from this array.
 * - "queuedScripts" keeps track of which scripts were started to load, 
 *   so as not to insert them twice in the page if the loader is called before
 *   the script loaded
 * - "modules" contains all the modules already loaded 
 */
var queueList = [], queuedScripts = {}, modules = {};

/**
 * Checks the state of each queue. If a queue has finished loading it executes it
 * @private
 */
var update = function () {
	var core, i = 0, j, required, requiredLength, ready;
	while (i < queueList.length) {
		required = queueList[i].req;
		requiredLength = required.length;
		ready = 0;
		/*
		 * Check if every module in this queue was loaded 
		 */
		for (j = 0; j < requiredLength; j++) {
			if (modules[required[j].name]) {
				ready++;
			}
		}
		if (Lang.isFunction(queueList[i].onProgress)) {
			queueList[i].onProgress(ready / requiredLength);
		}
		if (ready == requiredLength) {
			/*
			 * Create a new instance of the core, call each module and the queue's callback 
			 */
			core = buildJet(queueList[i].config);
			core.use = makeUse(queueList[i].config, core.Get);
			for (j = 0; j < requiredLength; j++) {
				modules[required[j].name](core);
			}
			domReady(queueList.splice(i, 1)[0].main, core);
		} else {
			i++;
		}
	}
};

function getModuleFromString(module, config) {
	var moduleName = module.toLowerCase();
	if (config.modules[moduleName]) {
		module = config.modules[moduleName];
	} else {
		for (var name in config.groups) {
			if (config.groups.hasOwnProperty(name) && config.groups[name].modules[moduleName]) {
				module = config.groups[name].modules[moduleName];
				if (Lang.isArray(module)) {
					module = {
						requires: module
					};
				}
				module.name = moduleName;
				module.group = name;
				break;
			}
		}
	}
	return module;
}

function handleRequirements(request, config) {
	var i = 0, j, moveForward;
	var module, required;
	var index;
	// handle requirements
	while (i < request.length) {
		module = request[i];
		moveForward = 1;
		if (Lang.isString(module)) {
			module = getModuleFromString(module, config);
		}
		if (module && module.requires) {
			required = module.requires;
			for (j = required.length - 1; j >= 0; j--) {
				index = _Array.indexOf(request, required[j]);
				if (index == -1) {
					request.splice(i, 0, required[j]);
					moveForward = 0;
				} else if (index > i) {
					request.splice(i, 0, request.splice(index, 1)[0]);
					moveForward = 0;
				}
			}
		}
		i += moveForward;
	}
	
	// remove JSON module if there's native JSON support
	if (config.win.JSON) {
		_Array.remove('json', request);
	}
		
	return request;
}

function makeUse(config, get) {

	var base = config.base;
	
	var loadCssModule = function (module) {
		var group = config.groups[module.group];
		var url = module.fullpath || (module.path ? (group.base + module.path) : (group.base + module.name + (config.minify ? ".min.css" : ".css")));
		get.css(url, function () {
			jet.add(module.name, function () {});
		});
	};
	
	return function () {
		var request = SLICE.call(arguments);
		var i = 0, module, minify, groupReqId, groupName, modName, group;
		var fn = request.pop();
		var groupRequests = {};
		
		// if "*" is used, include everything
		if (_Array.indexOf(request, '*') > -1) {
			request = [];
			AP.unshift.apply(request, Hash.keys(config.modules));
			
		// add widget-parentchild by default
		} else if (_Array.indexOf(request, 'node') == -1) {
			request.unshift('node');
		}
		
		while (i < request.length) {
			if (!Lang.isString(request[i])) {
				request.splice(i, 1);
			} else {
				i++;
			}
		}
		
		request = handleRequirements(request, config);
		
		// transform every module request into an object and load the required css/script if not already loaded
		for (i = 0; i < request.length; i++) {
			module = request[i];
			/*
			 * If a module is a string, it is considered a predefined module.
			 * If it isn't defined, it's probably a mistake and will lead to errors
			 */
			if (Lang.isString(module)) {
				request[i] = module = getModuleFromString(module, config);
				group = config.groups[module.group];
				module.type = module.type || 'js';
				if (!module.path) {
					minify = group ? group.minify : config.minify;
					module.path = module.name + (minify ? '.min.' : '.') + module.type; 
				}
			}
			group = config.groups[module.group];
			if (!Lang.isObject(module) || (module.type == CSS && !group.loadCss)) {
				request.splice(i, 1);
				i--;
			} else {
				module.fullpath = module.fullpath || (group ? group.base : base) + module.path;
				if (module.group && group && group.combine) {
					if (!groupRequests[module.group + module.type]) {
						groupRequests[module.group + module.type] = [];
					}
					groupRequests[module.group + module.type].type = module.type;
					if (!modules[module.name]) {
						groupRequests[module.group + module.type].push(module.path);
					}
					queuedScripts[module.name] = 1;
				} else if (!(modules[module.name] || queuedScripts[module.name])) {
					if (!module.type || module.type == "js") {
						get.script(module.fullpath); 
					} else if (module.type == CSS) {
						domReady(loadCssModule, module, config.doc);
					}
					queuedScripts[module.name] = 1;
				}
			}
		}
		
		for (groupReqId in groupRequests) {
			if (groupRequests.hasOwnProperty(groupReqId)) {
				if (groupRequests[groupReqId].length > 0) {
					groupName = groupReqId.substr(0, groupReqId.length - groupRequests[groupReqId].type.length);
					get[groupRequests[groupReqId].type == 'css' ? 'css' : 'script'](config.groups[groupName].root + groupName + '?' + groupRequests[groupReqId].join('&'));
				}
			}
		}
		
		// add the queue to the waiting list
		queueList.push({
			main: fn,
			req: request,
			// onProgress handlers are managed by queue
			onProgress: config.onProgress,
			config: config
		});
		update();
	};
};

function moduleToObj(name, opts, modules) {
	if (Lang.isArray(opts)) {
		opts = {
			requires: opts
		};
	}
	opts.name = name;
	modules[name] = opts;
}

var buildConfig = function (config, next) {
	if (!Lang.isObject(next)) {
		next = config;
		config = {};
	}
	next.modules = next.modules || {};
	next.groups = next.groups || {};
	Hash.each(next.modules, moduleToObj);
	Hash.each(next.groups, function (groupName, group) {
		var modules = group.modules = group.modules || {};
		for (var x in modules) {
			if (modules.hasOwnProperty(x)) {
				if (Lang.isArray(modules[x])) {
					modules[x] = {
						requires: modules[x],
						name: x
					};
				}
			}
		}
	});
	Hash.each(next, function (name, opts) {
		if (Lang.isObject(opts) && name != 'win' && name != 'doc' && opts.hasOwnProperty) {
			if (!Lang.isObject(config[name])) {
				config[name] = {};
			}
			if (name == 'groups') {
				var configGroups = config[name];
				Hash.each(opts, function (groupName, group) {
					if (!configGroups[groupName]) {
						configGroups[groupName] = {};
					}
					Hash.each(group, function (prop, val) {
						if (prop == 'modules') {
							if (!configGroups[groupName].modules) {
								configGroups[groupName].modules = {};
							}
							mix(configGroups[groupName].modules, val, true);
						} else {
							configGroups[groupName][prop] = val;
						}
					});
				});
			} else {
				mix(config[name], opts, true);
			}
		} else {
			config[name] = opts;
		}
	});
	return config;
};

/**
 * <p>Global function. Returns an object with 2 methods: use() and add().</p>
 *  
 * <code>jet().use("node", function ($) {
 *	 //do something with $
 * });</code>
 * 
 * <p>This snippet will load the Node module, and when it finishes loading it'll execute
 * the function. Each module must call the jet.add() method to tell the loader
 * it has finished loading:</p>
 * 
 * <code>jet.add("node", function ($) {
 *	 $.method = function () {};
 * });</code>
 * 
 * <p>A variable is passed to every module and the function defined in the use() method. 
 * This variable acts as a main library and is shared by each module and the main
 * function, but not between different calls to the "use" method. Ie:</p>
 * 
 * <code>jet().use("node", function ($) {
 *	 $.testProperty = "test";
 * });
 * 
 * jet().use("node", function ($) {
 *	 alert($.testProperty); //alerts "undefined"
 * });</code>
 * 
 * <p>Since it is a parameter, it can have any name but it still acts the same way. Also,
 * each module is called in the order defined by the "use" method. So:</p>
 * 
 * <code>jet().use("node", "anim", function (L) {
 *	 // Here the L variable contains both Node and Anim
 *	 // The Node module is called first on L and the Anim module after,
 *	 // so it can overwrite anything Node did, extend classes, etc
 * });</code>
 * 
 * <p>New modules can be defined by passing an object literal instead of a string to the
 * "use" method with a "name" property and a "path" or "fullpath" property.</p> 
 * 
 * <code>jet().use("node", {name:"myModule", fullpath:"http://localhost/myModule.js"}, function ($) {
 *	 //do something
 * });</code>
 * 
 * <p>If "path" is defined instead of "fullpath", the loader will append "path"
 * to a predefined base URL. This base URL can be modified by passing
 * the jet() function an object literal with a "base" property:</p>
 * 
 *  <code>jet({
 *	  base: "http://www.mydomain.com/modules/"
 *  }).use("node", function ($) {
 *	  //in this case the "core" module is loaded from http://www.mydomain.com/modules/node.min.js
 *  });</code>
 * 
 * @class jet
 * @constructor
 * @param {Object} config Object literal with configuration options
 */
window.jet = function (o) {
	
	var config = buildConfig(GlobalConfig);
	config = buildConfig(config, (o && o.win) ? o.win.jet_Config : window.jet_Config);
	config = buildConfig(config, o);
	
	var base = config.base;
	/**
	 * @attribute base
	 * @description prefix for all script and css urls
	 * @type String
	 * @default "//jet-js.googlecode.com/svn/trunk/src/"
	 */
	base = config.base = base.substr(base.length - 1, 1) == "/" ? base : base + "/";
	/**
	 * @attribute base
	 * @description defines whether predefined modules should be minified or not
	 * @type Boolean
	 * @default true
	 */
	config.minify = Lang.isBoolean(config.minify) ? config.minify : false;
	/**
	 * @attribute loadCss
	 * @description If true, css modules are loaded
	 * @type Boolean
	 * @default true
	 */
	config.loadCss = Lang.isBoolean(config.loadCss) ? config.loadCss : true;
	/**
	 * @attribute modules
	 * @description Allows to define your own modules. Currently the same as using object literals in the use() method
	 * @type Array
	 */
	
	/**
	 * @attribute win
	 * @description A reference to the global object that is accesible later with $.win
	 */
	config.win = config.win || window;
	/**
	 * @attribute doc
	 * @description A reference to the document that is accesible later with $.doc
	 */
	config.doc = config.doc || config.win.document;
	
	/**
	 * @attribute before
	 * @description id of a node before which to insert all scripts and css files
	 */
	
	mix(config.groups.jet, {
		root: config.root,
		base: config.base
	}, true);
	Hash.each(config.groups, function (name, group) {
		_Array.forEach(['minify', 'combine', 'loadCss'], function (prop) {
			if (!Lang.isBoolean(group[prop])) {
				group[prop] = config[prop];
			}
		});
	});

	var get = new Get(config);
	var use = makeUse(config, get);
	
	/*
	 * Allows for the following pattern:
	 * jet(function ($) {
	 *	...
	 * });
	 */
	if (Lang.isFunction(o)) {
		use(o);
	}
	
	return {
		/**
		 * Allows to load modules and obtain a unique reference to the library augmented by the requested modules 
		 * 
		 * This method works by overloading its parameters. It takes names (String) of predefined modules
		 * or objects defining name and path/fullpath of a module. The last parameter must be a function 
		 * that contains the main logic of the application.
		 * @method use 
		 */
		use: use
	};
};
/**
 * Adds a module to the loaded module list and calls update() to check if a queue is ready to fire
 * This method must be called from a module to register it
 * @method add
 * @static
 * @param {String} moduleName
 * @param {Function} expose
 */
jet.add = function (moduleName, expose) {
	/*
	 * Modules are overwritten by default.
	 * Maybe it would be a good idea to add an option not to overwrite if present?
	 */ 
	modules[moduleName] = expose;
	update();
};


}());

}
/**
 * The OOP module provides utilities for working with object oriented programming
 * @module oop
 * @requires 
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('oop', function ($) {

			var OP = Object.prototype,
	$_Array = $.Array,
	Lang = $.Lang;

/**
 * Utilities for object oriented programming in JavaScript.
 * JET doesn't provide a classical OOP environment like Prototype with Class methods,
 * but instead it helps you take advantage of JavaScript's own prototypical OOP strategy
 * @class jet~extend
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
 * @param {Hash} px optional - An object literal with methods to overwrite in the subclass' prototype
 * @param {Hash} ax optional - An object literal with properties to add to the subclass' constructor
 */
$.extend = function (r, s, px, ax) {
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

/**
 * Basic class from which all classes should inherit
 * Provides the functionality for the 'initializer' method and mixins
 * @class Class
 * @constructor
 */
var Class = $.Class = function Class() {
	var args = arguments;
	var self = this;
	
	$_Array.each($.Class.getClasses(this), function (constructor) {
		$_Array.each(constructor.EXTS || [], function (extension) {
			extension.apply(self, args);
		});
		if (constructor.prototype.hasOwnProperty('initializer')) {
			constructor.prototype.initializer.apply(self, args);
		}
	});
}

$.mix(Class, {

	/**
	 * @method create
	 * @description Shortcut for creating a new class that extends Class
	 * @static
	 * @param {String} name Required. Name of the new class
	 * @param {Class} superclass Optional. Superclass to extend. Default is Class
	 * @param {Object} proto Optional. An object to map to the created class' prototype
	 * @param {Object} attrs Optional. An object to map to the created class as static properties
	 * @return {BuiltClass} built class
	 */
	create: function (name, superclass, proto, attrs) {
		
		function BuiltClass() {
			BuiltClass.superclass.constructor.apply(this, arguments);
		}
		$.extend(BuiltClass, superclass || Class, proto, attrs);
		
		return $.mix(BuiltClass, {
			NAME: name,
			inherit: function (_name, _proto, _attrs) {
				return Class.create(_name, BuiltClass, _proto, _attrs);
			},
			mixin: function (exts) {
				return Class.mixin(BuiltClass, exts);
			}
		}, true);
	},
	
	/**
	 * @method mixin
	 * @description Mixes in a number of classes into another
	 * @static
	 * @param {Class} constructor Class into which to mix the others in
	 * @param {Array} extensions A list of the classes to mix in
	 * @return {Class} the mixed class
	 */
	mixin: function (constructor, extensions) {
		if (!constructor.EXTS) {
			constructor.EXTS = [];
		}
		constructor.EXTS.push.apply(constructor.EXTS, extensions);
		
		$_Array.each(extensions, function (extension) {
			$.mix(constructor.prototype, extension.prototype);
			$.Hash.each(extension, function (prop, val) {
				if (!constructor[prop]) {
					constructor[prop] = val;
				} else if ($.Lang.isObject(constructor[prop]) && $.Lang.isObject(val)) {
					$.mix(constructor[prop], val);
				}
			});
		});
		
		return constructor;
	},
	
	/**
	 * @method getClasses
	 * @description Returns an array with all the classes in the prototype chain, from the inner most one to the outer most one
	 * @static
	 * @param {Object} instance The instance from which to get all constructors
	 * @return {Array}
	 */
	getClasses: function (instance) {
		var classes = [];
		var constructor = instance.constructor;
		while (constructor && constructor !== Class) {
			classes.unshift(constructor);
			constructor = constructor.superclass.constructor;
		}
		return classes;
	},
	
	/**
	 * @method walk
	 * @description Runs a function through all the classes returned by Class.getClasses()
	 * @static
	 * @param {Object} instance The instance from which to get all constructors
	 * @param {Function} fn The function to execute on these constructors
	 * @param {Object} thisp The object to use as context. Default is the instance 
	 */
	walk: function (instance, fn, thisp) {
		$.Array.each(Class.getClasses(instance), fn, thisp || instance);
	}
	
}, true);

/**
 * Every class created with Class.create() shares this properties
 * @class BuiltClass
 * @constructor
 */
/**
 * @method inherit
 * @description Creates a new class that inherits from this one
 * @param {String} name Required. The name of the new class
 * @param {Object} proto Optional. Prototype properties of the new class
 * @param {Object} attrs Optional. Static properties of the new class
 * @return BuiltClass
 */
/**
 * @method mixin
 * @description Mixes other classes into this one
 * @param {Array} exts A list of classes to mix in
 * @return BuiltClass
 */
			
});
/**
 * Node collections and DOM abstraction
 * @module node
 * @requires oop
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('node', function ($) {

			
var ON = "on",
	Lang = $.Lang,
	Hash = $.Hash,
	A = $.Array,
	AP = Array.prototype;

/**
 * Keeps a record of all listeners attached to the DOM in order to remove them when necessary
 * @class EventCache
 * @static
 * @private
 */
var EventCache = (function () {
	var cache = {};
	
	var getCache = function (type) {
		if (!cache[type]) {
			cache[type] = [];
		}
		return cache[type];
	};
	
	var detachEvent = function (obj, type, fn) {
		if (obj.detachEvent) {
			detachEvent = function (obj, type, fn) {
				obj.detachEvent(ON + type, fn);
			};
		} else {
			detachEvent = function (obj, type, fn) {
				obj.removeEventListener(type, fn, false);
			};
		}
		detachEvent(obj, type, fn);
	};
	
	/**
	 * Removes all listeners from a node
	 * @method clear
	 * @param {DOMNode} obj
	 */
	var clear = function (obj, type) {
		var c, i = 0;
		if (type) {
			c = getCache(type);
			while (i < c.length) {
				if (c[i].obj == obj) {
					detachEvent(obj, type, c[i].fn);
					c.splice(i, 1);
				} else {
					i++;
				}
			}
		} else {
			for (type in cache) {
				if (cache.hasOwnProperty(type)) {
					c = cache[type];
					i = 0;
					while (i < c.length) {
						if (c[i].obj == obj) {
							detachEvent(obj, type, c[i].fn);
							c.splice(i, 1);
						} else {
							i++;
						}
					}
				}
			}
		}
	};
	
	return {
		/**
		 * Adds a listener to the cache
		 * @method add
		 * @param {DOMNode} obj
		 * @param {String} type
		 * @param {Function} fn
		 */
		add: function (obj, type, fn) {
			if (obj.nodeType) {
				var c = getCache(type);
				c[c.length] = {
					obj: obj,
					fn: fn
				};
			}
		},
		/**
		 * Removes a method from the cache, but doesn't do anything to the node's listener
		 * @method remove
		 * @param {DOMNode} obj
		 * @param {String} type
		 * @param {Function} fn
		 */
		remove: function (obj, type, fn) {
			detachEvent(obj, type, fn);
			var c = getCache(type),
			i = 0;
			while (i < c.length) {
				if (c[i].obj == obj && c[i].fn == fn) {
					c.splice(i, 1);
				} else {
					i++;
				}
			}
		},
		clear: clear,
		/**
		 * Removes all listeners from all nodes recorded in the cache
		 * @method flush
		 */
		flush: function () {
			for (var o in cache) {
				if (cache.hasOwnProperty(o)) {
					clear(o);
				}
			}
		}
	};
}());

// adds a DOM event and provides event object normalization
var addEvent = function (obj, type, callback, thisp) {
	if (obj.addEventListener) {
		addEvent = function (obj, type, callback, thisp) {
			if (thisp) {
				callback = $.bind(callback, thisp);
			}
			obj.addEventListener(type, callback, false);
			EventCache.add(obj, type, callback);
			return {
				obj: obj,
				type: type,
				fn: callback
			};
		};
	} else if (obj.attachEvent) {
		addEvent = function (obj, type, callback, thisp) {
			obj.attachEvent(ON + type, function (ev) {
				ev.target = ev.srcElement;
				ev.preventDefault = function () {
					ev.returnValue = false;
				};
				ev.stopPropagation = function () {
					ev.cancelBubble = true;
				};
				callback.call(thisp || obj, ev);
			});
			EventCache.add(obj, type, callback);
			return {
				obj: obj,
				type: type,
				fn: callback
			};
		};
	}
	return addEvent(obj, type, callback, thisp);
};

/**
 * A collection of DOM Event handlers for later detaching
 * @class DOMEventHandler
 * @constructor
 * @param {Array} handlers
 */
function DOMEventHandler(handlers) {
	this._handlers = handlers || [];
}
DOMEventHandler.prototype = {
	/**
	 * Unbinds all event handlers from their hosts
	 * @method detach
	 */
	detach: function () {
		for (var handlers = this._handlers, i = 0, length = handlers.length; i < length; i++) {
			EventCache.remove(handlers[i].obj, handlers[i].type, handlers[i].fn);
		}
		this._handlers = [];
	}
};

var DOCUMENT_ELEMENT = "documentElement";
var GET_COMPUTED_STYLE = "getComputedStyle";
var CURRENT_STYLE = "currentStyle";

/**
 * Bla
 * @class DOM
 * @static
 */
var DOM = {
	/**
	 * Returns the window object to which the current document belongs
	 * @method getWindowFromDocument
	 * @param {Document} document
	 */
	getWindowFromDocument: function (doc) {
		doc = doc || $.context;
		return doc.defaultView || doc.parentWindow || $.win;
	},
	/**
	 * Gets the scrolling width or makes the browser scroll
	 * @method scrollLeft
	 * @param {Number} value
	 * @chainable
	 */
	scrollLeft: function (value) {
		if (Lang.isValue(value)) {
			$.win.scrollTo(value, this.scrollTop());
		} else {
			var doc = $.context;
			var dv = doc.defaultView;
	        return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, (dv) ? dv.pageXOffset : 0);
		}
		return this;
	},
	/**
	 * Gets the scrolling height or makes the browser scroll
	 * @method scrollTop
	 * @param {Number} value
	 * @chainable
	 */
	scrollTop: function (value) {
		if (Lang.isValue(value)) {
			$.win.scrollTo(this.scrollTop(), value);
		} else {
			var doc = $.context;
			var dv = doc.defaultView;
	        return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, (dv) ? dv.pageYOffset : 0);
		}
		return this;
	},
	/**
	 * Returns the inner size of the screen
	 * @method screenSize
	 */
	screenSize: function (win) {
		var doc = win ? win.document : $.config.doc,
			de = doc.documentElement,
			db = doc.body;
		return {
			height: de.clientHeight || $.win.innerHeight || db.clientHeight,
			width: de.clientWidth || $.win.innerWidth || db.clientWidth
		};
	},
	/**
	 * Returns the complete size of the page
	 * @method pageSize
	 */
	pageSize: function (win) {
		win = win || $.win;
		var doc = win.document,
			compatMode = doc.compatMode != "CSS1Compat",
			innerWidth = win.innerWidth,
			innerHeight = win.innerHeight,
			root = compatMode ? doc.body : doc.documentElement;
		if (doc.compatMode && !$.UA.opera) {
			innerWidth = root.clientWidth;
			innerHeight = root.clientHeight;
		}
		return {
			width: Math.max(root.scrollWidth, innerWidth),
			height: Math.max(root.scrollHeight, innerHeight)
		};
	}
};
var ready = function (fn) {
	var node = this.getDOMNode();
	if ((node.ownerDocument || node).body) {
		fn.call(this);
	} else {
		setTimeout(function () {
			ready(fn);
		}, 13);
	}
	return this;
};

var Lang = $.Lang,
	A = $.Array,
	NONE = "none",
	SLICE = Array.prototype.slice,
	rroot = /^(?:body|html)$/i,
	PROTO;

function classRE(name) {
	return new RegExp("(^|\\s)" + name + "(\\s|$)");
}
/**
 * A collection of DOM Nodes
 * @class NodeList
 * @constructor
 * @param {Array|DOMCollection|DOMNode} nodes
 * @param {DOMNode|Document} root
 */
function NodeList(nodes, root) {
	NodeList.superclass.constructor.apply(this, arguments);
	
	var i = 0, length, tmp;
	root = root || $.context;
	nodes = Lang.isValue(nodes) ? nodes : [];
	if (Lang.isArray(nodes._items)) {
		nodes = nodes._items;
	} else if (Lang.isString(nodes)) {
		nodes = [root.createElement(nodes)];
	} else if (nodes.nodeType || nodes.body || nodes.navigator) {
		nodes = [nodes];
	} else if (Lang.isArray(nodes)) {
		while (i < nodes.length) {
			if (!nodes[i] || !(nodes[i].nodeType || nodes[i].body || nodes[i].navigator)) {
				nodes.splice(i, 1);
			} else {
				i++;
			}
		}
	} else if (Lang.isNumber(nodes.length)) {
		tmp = [];
		for (i = 0; i < nodes.length; i++) {
			tmp[i] = nodes[i];
		}
		nodes = tmp;
		//nodes = SLICE.call(nodes);
	} else {
		//$.error("Wrong argument for NodeList");
	}
	this._items = nodes;
}
$.extend(NodeList, $.ArrayList, {
	
	getDOMNodes: function () {
		return this._items;
	},
	
	getDOMNode: function (index) {
		return this._items[index || 0];
	},
	/**
	 * Hides all nodes
	 * @method hide
	 * @chainable
	 */
	hide: function () {
		return this.each(function (node) {
			var display = node.style.display;
			if (!node.JET_oDisplay && display != NONE) {
				node.JET_oDisplay = display;
			}
			node.style.display = NONE;
		});
	},
	/**
	 * Shows all nodes
	 * @method show
	 * @chainable
	 */
	show: function () {
		return this.each(function (node) {
			node.style.display = node.JET_oDisplay || '';
		});
	},
	/**
	 * If a node in the collection is hidden, it shows it. If it is visible, it hides it.
	 * @method toggle
	 * @chainable
	 */
	toggle: function (showHide) {
		return this.each(function (node) {
			var ns = node.style;
			var oDisplay = node.LIB_oDisplay || '';
			ns.display = Lang.isBoolean(showHide) ? (showHide ? oDisplay : NONE) :
						ns.display != NONE ? NONE :
						oDisplay ? oDisplay :
						'';
		});
	},
	/**
	 * Returns true if the first node in the collection has the className CSS class
	 * @method hasClass
	 * @param {String} className
	 * @chainable
	 */
	hasClass: function (className) {
		return classRE(className).test(this.getDOMNode().className);
	},
	/**
	 * Removes a number of classes from all nodes in the collection.
	 * Takes multiple string parameters
	 * @method removeClass
	 * @chainable
	 */
	removeClass: function () {
		var args = arguments;
		return this.each(function (el) {
			A.each(SLICE.call(args), function (name) {
				el.className = Lang.trim(el.className.replace(classRE(name), ' '));
			});
		});
	},
	/**
	 * Adds a number of classes to all nodes in the collection
	 * Takes multiple string parameters
	 * @method addClass
	 * @chainable
	 */
	addClass: function () {
		var args = arguments;
		return this.each(function (el) {
			A.each(SLICE.call(args), function (name) {
				if (!classRE(name).test(el.className)) {
					el.className += (el.className ? ' ' : '') + name;
				}
			});
		});
	},
	/**
	 * Adds/removes a certain class from all nodes in the collection
	 * @method toggleClass
	 * @param {String} className
	 * @chainable
	 */
	toggleClass: function (className, addOrRemove) {
		return this.each(function (node) {
			node = $(node);
			if (!Lang.isBoolean(addOrRemove)) {
				addOrRemove = !node.hasClass(className);
			}
			node[addOrRemove ? 'addClass' : 'removeClass'](className);
		});
	},
	/**
	 * Sets the class name of all nodes in the collection
	 * @method setClass
	 * @param {String} sClass
	 * @chainable
	 */
	setClass: function (name) {
		return this.each(function (node) {
			node.className = name;
		});
	},
	/**
	 * Returns an object literal containing:
	 * <ul>
	 * <li><strong>top</strong>: top position in px</li>
	 * <li><strong>left</strong>: left position in px</li>
	 * <li><strong>width</strong>: width in px</li>
	 * <li><strong>height</strong>: height in px</li>
	 * </ul>
	 * @method offset
	 * @return {Hash}
	 */
	offset: function (left, top) {
		if (Lang.isNumber(left) || Lang.isNumber(top)) {
			return this.each(function (node) {
				node = $(node);
				var parentOffset = node.offsetParent().offset();
				if (Lang.isNumber(left)) {
					node.css('left', left - parentOffset.left + 'px');
				}
				if (Lang.isNumber(top)) {
					node.css('top', top - parentOffset.top + 'px');
				}
			});
		} else {
			var node = this.getDOMNode();
			var offset = {
				left: 0,
				top: 0,
				width: node.offsetWidth,
				height: node.offsetHeight
			};
			var doc = node.ownerDocument;
			try {
				if (node.getBoundingClientRect) {
					var box  = node.getBoundingClientRect();
					var body = doc.body;
					var de = doc[DOCUMENT_ELEMENT];
					offset.left = box.left + DOM.scrollLeft() - (de.clientLeft || body.clientLeft || 0);
					offset.top = box.top + DOM.scrollTop() - (de.clientTop || body.clientTop || 0);
				} else if (node.offsetParent) {
					// Not interested in supporting other browsers very well
					do {
						offset.left += node.offsetLeft;
						offset.top += node.offsetTop;
						node = node.offsetParent;
					} while (node);
				}
			} catch (e) {}
			
			return offset;
		}
	},
	/**
	 * Returns a new NodeList with all the offset parents of this one
	 * @method offsetParent
	 * @return NodeList
	 */
	offsetParent: function () {
		return this.map(function(node) {
			var offsetParent = node.offsetParent || document.body;
			while (offsetParent && (!rroot.test(offsetParent.nodeName) && $(offsetParent).css("position") === "static")) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	},
	/**
	 * Appends nodes to the ones in the current node list
	 * @method append
	 * @param {DOMNode|Array|NodeList} appended
	 * @chainable
	 */
	append: function (appended) {
		var node = this.getDOMNode();
		$(appended).each(function (app) {
			node.appendChild(app)
		});
		return this;
	},
	/**
	 * Appends all nodes in the current collection to the target node
	 * @method appendTo
	 * @param {DOMNode|NodeList} target
	 * @chainable
	 */
	appendTo: function (target) {
		$(target).append(this);
		return this;
	},
	/**
	 * Insert nodes to the ones in the current node list, before their first children
	 * @method append
	 * @param {DOMNode|Array|NodeList} appended
	 * @chainable
	 */
	prepend: function (prepended) {
		var node = this.getDOMNode();
		prepended = $(prepended);
		prepended.getDOMNodes().reverse();
		prepended.each(function (prep) {
			node.insertBefore(prep, node.firstChild);
		});
		return this;
	},
	/**
	 * Inserts all nodes in the current collection before the first child of the target node
	 * @method prependTo
	 * @param {DOMNode|NodeList} target
	 * @chainable
	 */
	prependTo: function (target) {
		$(target).prepend(this);
		return this;
	},
	/**
	 * Inserts all nodes in the current node list before the target node
	 * @method insertBefore
	 * @param {DOMNode|NodeList} before
	 * @chainable
	 */
	insertBefore: function (target) {
		target = $(target).getDOMNode();
		return this.each(function (node) {
			target.parentNode.insertBefore(node, target);
		});
	},
	/**
	 * Returns whether the first node in this NodeList is inserted in the document
	 * @method inDoc
	 * @param {Document} doc
	 * @return Boolean
	 */
	inDoc: function () {
		var de = this.getDOMNode().ownerDocument.documentElement;
		var parent = this.parent();
		while (parent.getDOMNode()) {
			if (parent.getDOMNode().nodeName.toLowerCase() == 'html') {
				return true;
			}
			parent = parent.parent();
		}
		return false;
	},
	/**
	 * Returns a new NodeList with all the parents of the current nodes
	 * @method parent
	 * @return {NodeList}
	 */
	parent: function () {
		return this.map(function (node) {
			if (node.parentNode) {
				return node.parentNode;
			}
		});
	},
	/**
	 * Looks for a parent by walking up the DOM and executing a function on all nodes
	 * @method ancestor
	 * @return {NodeList}
	 */
	ancestor: function (fn) {
		return this.map(function (parent) {
			while (parent) {
				if (fn(parent)) {
					break;
				}
				parent = parent.parentNode;
			}
			return parent;
		});
	},
	/**
	 * Returns a new NodeList with all the first children of the nodes in the collection
	 * @method first
	 * @return {NodeList}
	 */
	first: function () {
		return this.children(0);
	},
	/**
	 * Returns a new NodeList with all the last children of the nodes in the collection
	 * @method first
	 * @return {NodeList}
	 */
	last: function () {
		return this.children().getDOMNodes().shift();
	},
	/**
	 * Gets or sets the innerHTML of all the nodes in the node list
	 * @method html
	 * @param {String} html
	 * @chainable
	 */
	html: function (html) {
		return Lang.isValue(html) ? this.each(function (node) {
			node.innerHTML = html;
		}) : this.getDOMNode() ? this.getDOMNode().innerHTML : '';
	},
	/**
	 * Gets or sets tag attributes to the nodes in the collection
	 * @method attr
	 * @param {String|Hash} key
	 * @param {String} [value]
	 * @chainable
	 */
	attr: function (key, value) {
		key = key || {};
		var attrs = {};
		if (Lang.isObject(key)) {
			attrs = key;
		} else if (Lang.isValue(value)) {
			attrs[key] = value;
		} else {
			return this.getDOMNode()[key];
		}
		return this.each(function (node) {
			Hash.each(attrs, function (name, val) {
				node[name] = val;
			});
		});
	},
	/**
	 * Gets or sets CSS styles
	 * @method css
	 * @param {String|Hash} key
	 * @param {String} [value]
	 * @chainable
	 */
	css: function (key, value) {
		var css = {};
		if (Lang.isObject(key)) {
			css = key;
		} else if (Lang.isValue(value)) {
			css[key] = value;
		} else {
			return $(this.getDOMNode()).currentStyle()[key];
		}
		return this.each(function (node) {
			Hash.each(css, function (prop, value) {
				if (prop == "opacity" && $.UA.ie) {
					node.style.filter = "alpha(opacity=" + Math.ceil(value * 100) + ")";
				} else {
					if (Lang.isNumber(value) && prop != "zIndex" && prop != "zoom" && prop != "opacity") {
						value += "px";
					}
					node.style[prop] = value;
				}
			});
		});
	},
	/**
	 * Finds all the nodes below the ones in the current collection that match the search query
	 * @method find
	 * @param {String} query
	 * @return {NodeList}
	 */
	find: function (query) {
		return this.map(function (node) {
			return $(query, node);
		});
	},
	/**
	 * Returns a new NodeList with all the children of the current nodes
	 * @method children
	 * @param {String|Number} filter Return only the children that match the tag or index in this parameter
	 * @return {NodeList}
	 */
	children: function (filter) {
		filter = !Lang.isValue(filter) ? false :
				  Lang.isString(filter) ? filter.toUpperCase() : filter;
		var result = [];
		this.each(function (node) {
			var children = node.childNodes;
			var newChildren = [];
			var length = children.length;
			for (var i = 0; i < length; i++) {
				if (children[i].nodeType != 3) {
					newChildren[newChildren.length] = children[i];
				}
			}
			if (filter !== false) {
				length = newChildren.length;
				for (i = 0; i < length; i++) {
					if (i == filter || newChildren[i].nodeName == filter) {
						result.push(newChildren[i]);
					}
				}
			} else {
				result.push.apply(result, newChildren);
			}
		});
		return new (this.constructor)(result);
	},
	/**
	 * Adds an event listener to all the nods in the list
	 * @method on
	 * @param {String} type
	 * @param {Function} callback
	 * @param {Object} thisp
	 * @return {DOMEventHandler} handler
	 */
	on: function (type, callback, thisp) {
		var handlers = [];
		if (Lang.isObject(type, true)) {
			$.Hash.each(type, function (evType, fn) {
				this.each(function (node) {
					handlers.push(addEvent(node, evType, fn, thisp));
				});
			}, this);
		} else {
			this.each(function (node) {
				handlers.push(addEvent(node, type, callback, thisp));
			});
		}
		return new DOMEventHandler(handlers);
	},
	/**
	 * Removes an event listener from all the nodes
	 * @method unbind
	 * @param {String} type
	 * @param {Function} callback
	 * @chainable
	 */
	unbind: function (type, callback) {
		return this.each(function (node) {
			if (callback) {
				EventCache.remove(node, type, callback);
			} else {
				EventCache.clear(node, type);
			}
		});
	},
	/**
	 * Removes all the nodes from the DOM tree and removes all event listeners from the nodes
	 * @method remove
	 * @param {Boolean} unbind Set to true to remove all event listeners
	 * @chainable
	 */
	remove: function (unbind) {
		return this.each(function (node) {
			if (unbind) {
				$.walkTheDOM(node, EventCache.clear);
			}
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		});
	},
	/**
	 * Sets the innerHTML of the nodelist by safely removing all children first
	 * @method setContent
	 * @param {String} content
	 * @chainable
	 */
	setContent: function (content) {
		this.children().unbind().remove();
		return this.html(content);
	},
	ownerDoc: function () {
		return this.map(function (node) {
			return node.ownerDocument;
		});
	},
	/**
	 * Returns a new NodeList with all the documents of all the nodes in the collection that are Iframes
	 * @method contentDoc
	 * @return {NodeList}
	 */
	contentDoc: function () {
		return this.map(function (node) {
			if (node.nodeName == "IFRAME") {
				return node.contentDocument || node.contentWindow.document || node.document;
			}
		});
	},
	/**
	 * Returns the computed style of the first node in the collection
	 * @method currentStyle
	 * @return {CSSDeclaration}
	 */
	currentStyle: function () {
		var node = this.getDOMNode();
		return $.win[GET_COMPUTED_STYLE] ? $.win[GET_COMPUTED_STYLE](node, null) : 
				node[CURRENT_STYLE] ? node[CURRENT_STYLE] : node.style;
	},
	/**
	 * Executes a callback when the DOM to which the first node in the collection belongs is ready
	 * @method ready
	 * @param {Function} callback
	 * @chainable
	 */
	ready: ready,
	/**
	 * Returns a new NodeList containing all the nodes in the current list and the ones in the new one
	 * Useful for applying properties to a bigger group of nodes, while keeping the original references
	 * @method link
	 * @param {NodeList} nodelist
	 * @return {NodeList}
	 */
	link: function () {
		var result = [];
		this.each(function (node) {
			result.push(node);
		});
		A.each(arguments, function (nodelist) {
			$(nodelist).each(function (node) {
				result.push(node);
			});
		});
		return new (this.constructor)(result);
	},
	/**
	 * Sets or returns the value of the node. Useful mostly for form elements
	 * @param {String} value - optional
	 * @chainable
	 */
	value: function (val) {
		return this.attr("value", val);
	}
});

PROTO = NodeList.prototype;

	/**
	 * Fires the blur event
	 * @method blur
	 * @chainable
	 */
	/**
	 * Fires the focus event
	 * @method focus
	 * @chainable
	 */
A.each(['blur', 'focus'], function (method) {
	PROTO[method] = function () {
		return this.each(function (node) {
			try {
				node[method]();
			} catch (e) {}
		});
	};
});

	/**
	 * Returns a new NodeList with all the next siblings of the nodes in the collection
	 * @method next
	 * @return {NodeList}
	 */
	/**
	 * Returns a new NodeList with all the previous siblings of the nodes in the collection
	 * @method previous
	 * @return {NodeList}
	 */
A.each(['next', 'previous'], function (method) {
	PROTO[method] = function () {
		return this.map(function (node) {
			do {
				node = node[method + 'Sibling'];
			}
			while (node && node.nodeType == 1);
			return node;
		});
	};
});

	/**
	 * Gets/sets the width of all the nodes in the collection
	 * @method width
	 * @param {String|Number} [width]
	 * @memberOf NodeList
	 * @chainable
	 */
	/**
	 * Gets/sets the height of all the nodes in the collection
	 * @method height
	 * @param {String|Number} [height]
	 * @chainable
	 */
A.each(['Width', 'Height'], function (size) {
	var method = size.toLowerCase();
	PROTO[method] = function (value) {
		if (Lang.isValue(value)) {
			if (Lang.isNumber(value) && value < 0) {
				value = 0;
			}
			value = Lang.isString(value) ? value : value + "px";
			return this.each(function (node) {
				node.style[method] = value;
			});
		}
		return this.getDOMNode() ? this.getDOMNode()['offset' + size] : null;
	}
});

	/**
	 * Gets/sets the position of the first node in the collection
	 * @method offsetTop
	 * @param {Number} top
	 * @chainable
	 */
	/**
	 * Gets/sets the position of the first node in the collection
	 * @method offsetLeft
	 * @param {Number} left
	 * @chainable
	 */
A.each(['Left', 'Top'], function (direction) {
	PROTO['offset' + direction] = function (val) {
		if (Lang.isValue(val)) {
			return direction == 'Left' ? this.offset(val) : this.offset(null, val);
		} else {
			return this.offset()[direction.toLowerCase()];
		}
	};
});

$.add({

	NodeList: NodeList,
	
	DOM: DOM,
	
	pxToFloat: function (px) {
		return Lang.isNumber(parseFloat(px)) ? parseFloat(px) :
			   Lang.isString(px) ? parseFloat(px.substr(0, px.length - 2)) : px;
	}
});

addEvent($.win, "unload", EventCache.flush);
			
});
