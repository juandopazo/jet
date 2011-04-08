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
	modules: {
		log: {},
		node: ['log'],
		xsl: [NODE],
		swf: {},
		json: [NODE],
		cookie: [BASE],
		sizzle: [NODE],
		base: [NODE],
		io: ['json'],
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
		tabview: [WIDGET_PARENTCHILD, 'tabview-styles'],
		treeview: [WIDGET_PARENTCHILD],
		'widget-alignment': [BASE],
		'widget-stack': [BASE],
		'widget-parentchild': [BASE],
		'widget-sandbox': [BASE],
		menu: [WIDGET_PARENTCHILD, 'container'],
		vector: ['anim'],
		layout: ['resize', WIDGET_PARENTCHILD]
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
	
var ArrayHelper, Hash;

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
				ArrayHelper.each(o, function (value) {
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
ArrayHelper = {
	/**
	 * Iterates through an array
	 * @method each
	 * @param {Array} arr
	 * @param {Function} fn callback
	 * @param {Object} thisp sets up the <b>this</b> keyword inside the callback
	 */
	// check for native support
	each: Lang.isNative(AP.forEach) ? function (arr, fn, thisp) {
		
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
		var res = [];
		ArrayHelper.each(arr || [], function (val, i, arr) {
			res[i] = fn.call(thisp, val, i, arr);
		});
		return res;
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
	for (var x in b) {
		if (b.hasOwnProperty(x) && (!a[x] || overwrite)) {
			a[x] = b[x];
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
					if (c && ArrayHelper.indexOf(className, c.split(" ")) > -1) {
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
		if (Lang.isString(query)) {
			root = query.substr(0, 1) == '#' && root.ownerDocument ? root.ownerDocument : root;
			query = $.parseQuery(query, root);
			query = !Lang.isValue(query) ? new $.NodeList([]) : new $.NodeList(query);
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
		parseQuery: function (query, root) {
			root = root || $.context;
			var c = query.substr(0, 1), test, node;
			if (c == "<") {
				if (query.match(/</g).length == 1) {
					return root.createElement(query.substr(1, query.length - 3));
				} else {
					/*
					 * Check for strings like "<div><span><a/></span></div>"
					 */
					test = query.match(new RegExp("<([a-z]+)>(.+)<\/([a-z]+)>", "i"));
					node = null;
					if (test.length == 4 && test[1] == test[3]) {
						node = root.createElement(test[1]);
						node.innerHTML = test[2];
					} else {
						$.error("Wrong element creation string");
					}
					return node;
				}
			} else {
				return c == "#" ? root.getElementById(query.substr(1)) : 
					   c == "." ? getByClass(query.substr(1), root) :
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
		
		"Array": ArrayHelper,
		
		Hash: Hash,
		
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

function handleRequirements(request, config) {
	var i = 0, j, moveForward;
	var module, required;
	var index;
	// handle requirements
	while (i < request.length) {
		module = request[i];
		moveForward = 1;
		if (Lang.isString(module)) {
			module = config.modules[module.toLowerCase()];
		}
		if (module && module.requires) {
			required = module.requires;
			for (j = required.length - 1; j >= 0; j--) {
				index = ArrayHelper.indexOf(required[j], request);
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
		ArrayHelper.remove('json', request);
	}
		
	return request;
}

function makeUse(config, get) {

	var base = config.base;
	
	var loadCssModule = function (module) {
		var url = module.fullpath || (module.path ? (base + module.path) : (base + module.name + (config.minify ? ".min.css" : ".css")));
		get.css(url, function () {
			jet.add(module.name, function () {});
		});
	};

	return function () {
		var request = SLICE.call(arguments);
		var i = 0, module;
		var fn = request.pop();
		
		// if "*" is used, include everything
		if (ArrayHelper.indexOf("*", request) > -1) {
			request = [];
			AP.unshift.apply(request, Hash.keys(config.modules));
			
		// add widget-parentchild by default
		} else if (ArrayHelper.indexOf(BASE, request) == -1) {
			request.unshift(BASE);
		}
		
		request = handleRequirements(request, config);
		
		// transform every module request into an object and load the required css/script if not already loaded
		for (i = 0; i < request.length; i++) {
			module = request[i];
			/*
			 * If a module is a string, it is considered a predefined module.
			 * If it isn't defined, it's probably a mistake and will lead to errors
			 */
			if (Lang.isString(module) && config.modules[module]) {
				request[i] = module = config.modules[module];
			}
			if (!Lang.isObject(module) || (module.type == CSS && !config.loadCss)) {
				request.splice(i, 1);
				i--;
			} else {
				module.fullpath = module.fullpath || base + module.path;
				if (!(modules[module.name] || queuedScripts[module.fullpath])) {
					if (!module.type || module.type == "js") {
						get.script(module.fullpath); 
					} else if (module.type == CSS) {
						domReady(loadCssModule, module);
					}
					queuedScripts[module.fullpath] = 1;
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

var buildConfig = function (config, next) {
	if (!Lang.isObject(next)) {
		next = config;
		config = {};
	}
	next.modules = next.modules || {};
	Hash.each(next.modules, function (name, opts) {
		if (Lang.isArray(opts)) {
			opts = {
				requires: opts
			};
		}
		if (!opts.path) {
			opts.path = name + (opts.type == CSS ? '.css' : '.js');
		}
		opts.name = name;
		next.modules[name] = opts;
	});
	Hash.each(next, function (name, opts) {
		if (Lang.isObject(opts) && name != 'win' && name != 'doc') {
			if (!Lang.isObject(config[name])) {
				config[name] = {};
			}
			mix(config[name], opts, true);
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
	
	var get = new Get(config);
	
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
		use: makeUse(config, get)
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
 * Base structure for logging
 * @module log
 * @requires jet
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('log', function ($) {

			
/**
 * Adds the following methods to the $ object
 * @class Log
 * @static
 */
if (!jet.Log) {
	jet.Log = {};
}
var Log = jet.Log;
if (!Log.errors) {
	Log.errors = [];
}
if (!Log.warnings) {
	Log.warnings = [];
}
if (!Log.logs) {
	Log.logs = [];
}

$.add({
	/**
	 * @method error
	 * @description Logs an error
	 */
	error: function (msg) {
		Log.errors.push(msg);
	},
	/**
	 * @method warning
	 * @description Logs a warning
	 */
	warning: function (msg) {
		Log.warnings.push(msg);
	},
	/**
	 * @method log
	 * @description Logs a message
	 */
	log: function (msg) {
		Log.logs.push(msg);
	}
});
			
});/**
 * Node collections and DOM abstraction
 * @module node
 * @requires ua
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
	
	/**
	 * Removes all listeners from a node
	 * @method clear
	 * @param {DOMNode} obj
	 */
	var clear = function (obj) {
		if (obj.detachEvent) {
			clear = function (obj) {
				var type, c, i;
				for (type in cache) {
					if (cache.hasOwnProperty(type)) {
						c = cache[type];
						i = 0;
						while (i < c.length) {
							if (c[i].obj == obj) {
								c[i].obj.detachEvent(ON + type, c[i].fn);
								c.splice(i, 1);
							} else {
								i++;
							}
						}
					}
				}
			};
		} else {
			clear = function (obj) {
				var type, c, i;
				for (type in cache) {
					if (cache.hasOwnProperty(type)) {
						c = cache[type];
						i = 0;
						while (i < c.length) {
							if (c[i].obj == obj) {
								c[i].obj.removeEventListener(type, c[i].fn, false);
								c.splice(i, 1);
							} else {
								i++;
							}
						}
					}
				}
			};
		}
		clear(obj);
	};
	
	var getCache = function (type) {
		if (!cache[type]) {
			cache[type] = [];
		}
		return cache[type];
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
			A.remove(getCache(type), {
				obj: obj,
				fn: fn
			});
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

// cross browser listener removal
var removeEvent = function (obj, type, callback) {
	if (obj.removeEventListener) {
		removeEvent = function (obj, type, callback) {
			obj.removeEventListener(type, callback, false);
			EventCache.remove(obj, type, callback);
		};
	} else if (obj.detachEvent) {
		removeEvent = function (obj, type, callback) {
			obj.detachEvent(ON + type, callback);
			EventCache.remove(obj, type, callback);
		};
	}
	removeEvent(obj, type, callback);
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
	screenSize: function () {
		var doc = $.context,
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
	var node = this._nodes[0];
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
	rroot = /^(?:body|html)$/i;

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
	var i = 0, length, tmp;
	root = root || $.context;
	nodes = Lang.isValue(nodes) ? nodes : [];
	if (Lang.isArray(nodes._nodes)) {
		nodes = nodes._nodes;
	} else if (Lang.isString(nodes)) {
		nodes = [root.createElement(nodes)];
	} else if (nodes.nodeType || nodes.body || nodes.navigator) {
		nodes = [nodes];
	} else if (Lang.isArray(nodes)) {
		while (i < nodes.length) {
			if (!(nodes[i].nodeType || nodes[i].body || nodes[i].navigator)) {
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
		$.error("Wrong argument for NodeList");
	}
	this._nodes = nodes;
}
NodeList.prototype = {
	/**
	 * Iterates through the NodeList
	 * The callback is passed a reference to the node and an iteration index. 
	 * The "this" keyword also refers to the node. ie:<br/>
	 * <code>$("div").each(function (node, i) {<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;if (i % 2 == 1) {<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$(node).addClass("even");<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;} else {<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$(node).addClass("odd");<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;}<br/>
	 * });</code>
	 * @method each
	 * @param {Function} callback
	 * @chainable
	 */
	each: function (fn, thisp) {
		var i, nodes = this._nodes, length = nodes.length;
		for (i = 0; i < length; i++) {
			fn.call(thisp || nodes[i], nodes[i], i, nodes);
		}
		return this;
	},
	/**
	 * Returns the length of this NodeList
	 * @method size
	 * @return Number
	 */
	size: function() {
		return this._nodes.length;
	},
	/**
	 * Iterates through the nodelist, returning a new nodelist with all the elements
	 * return by the callback function
	 * @method map
	 * @param {Function} fn
	 * @return NodeList
	 */
	map: function (fn) {
		var results = [];
		this.each(function (node) {
			var output = fn(node);
			if (Lang.isValue(output)) {
				if (Lang.isArray(output)) {
					results.push.apply(results, output);
				} else if (output instanceof NodeList) {
					output.each(function (node) {
						if (A.indexOf(node, results) == -1) {
							results[results.length] = node;
						}
					});
				} else if (A.indexOf(output, results) == -1){
					results[results.length] = output;
				}
			}
		});
		return new NodeList(results);
	},
	/**
	 * Returns a new nodelist with only the nodes for which the provided function returns true
	 * @method filter
	 * @param {Function} fn
	 * @return NodeList
	 */
	filter: function (fn) {
		var results = [];
		this.each(function (node) {
			if (fn.call(this)) {
				results[results.length] = node;
			}
		});
		return new NodeList(results);
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
			node.style.display = node.JET_oDisplay || "";
		});
	},
	/**
	 * If a node in the collection is hidden, it shows it. If it is visible, it hides it.
	 * @method toggle
	 * @chainable
	 */
	toggle: function () {
		return this.each(function (node) {
			var ns = node.style;
			var oDisplay = node.LIB_oDisplay;
			ns.display = ns.display != NONE ? NONE :
						oDisplay ? oDisplay :
						"";
		});
	},
	/**
	 * Returns true if the first node in the collection has the className CSS class
	 * @method hasClass
	 * @param {String} className
	 * @chainable
	 */
	hasClass: function (className) {
		return classRE(className).test(this._nodes[0].className);
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
			var node = this._nodes[0];
			var offset = {
				left: 0,
				top: 0,
				width: node.offsetWidth,
				height: node.offsetHeight
			};
			var doc = node.ownerDocument;
			if (node && doc) {
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
			} else {
				offset = null;
			}
			
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
	 * Gets/sets the width of all the nodes in the collection
	 * @method width
	 * @param {String|Number} [width]
	 * @memberOf NodeList
	 * @chainable
	 */
	width: function (width) {
		if (Lang.isValue(width)) {
			if (Lang.isNumber(width) && width < 0) {
				width = 0;
			}
			width = Lang.isString(width) ? width : width + "px";
			return this.each(function (node) {
				node.style.width = width;
			});
		}
		return this._nodes[0].offsetWidth;
	},
	/**
	 * Gets/sets the height of all the nodes in the collection
	 * @method height
	 * @param {String|Number} [height]
	 * @chainable
	 */
	height: function (height) {
		if (Lang.isValue(height)) {
			if (Lang.isNumber(height) && height < 0) {
				height = 0;
			}
			height = Lang.isString(height) ? height : height + "px";
			return this.each(function (node) {
				node.style.height = height;
			});
		}
		return this._nodes[0].offsetHeight;
	},
	/**
	 * Returns a new NodeList with all nodes cloned from the current one
	 * @method clone
	 * @param {Boolean} deep If true all nodes in the brach are cloned. If not, only the ones in the collection
	 * @return {NodeList}
	 */
	clone: function (deep) {
		deep = Lang.isValue(deep) ? deep : true;
		return this.map(function (node) {
			return node.cloneNode(deep);
		});
	},
	/**
	 * Appends nodes to the ones in the current node list
	 * @method append
	 * @param {DOMNode|Array|NodeList} appended
	 * @chainable
	 */
	append: function (appended) {
		appended = $(appended);
		return this.each(function (node) {
			appended.each(function (app) {
				node.appendChild(app);
			});
		});
	},
	/**
	 * Appends all nodes in the current collection to the target node
	 * @method appendTo
	 * @param {DOMNode|NodeList} target
	 * @chainable
	 */
	appendTo: function (target) {
		var mytarget = $(target)._nodes[0];
		return this.each(function (node) {
			mytarget.appendChild(node);
		});
	},
	/**
	 * Insert nodes to the ones in the current node list, before their first children
	 * @method append
	 * @param {DOMNode|Array|NodeList} appended
	 * @chainable
	 */
	prepend: function (prepended) {
		prepended = $(prepended);
		return this.each(function (node) {
			prepended.each(function (prep) {
				if (node.firstChild) {
					node.insertBefore(prep, node.firstChild);
				} else {
					node.appendChild(prep);
				}
			});
		});
	},
	/**
	 * Inserts all nodes in the current collection before the first child of the target node
	 * @method prependTo
	 * @param {DOMNode|NodeList} target
	 * @chainable
	 */
	prependTo: function (target) {
		target = $(target)._nodes[0];
		return this.each(function (node) {
			if (target.firstChild) {
				target.insertBefore(node, target.firstChild);
			} else {
				target.appendChild(node);
			}
		});
	},
	/**
	 * Inserts all nodes in the current node list before the target node
	 * @method insertBefore
	 * @param {DOMNode|NodeList} before
	 * @chainable
	 */
	insertBefore: function (target) {
		target = $(target)._nodes[0];
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
		var de = this._nodes[0].ownerDocument.documentElement;
		var parent = this.parent();
		while (parent._nodes[0]) {
			if (parent._nodes[0].nodeName.toLowerCase() == 'html') {
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
	 * Returns a new NodeList with all the first children of the nodes in the collection
	 * @method first
	 * @return {NodeList}
	 */
	first: function () {
		return this.map(function (node) {
			node = $(node).children(0)._nodes[0];
			if (node) {
				return node;
			}
		});
	},
	/**
	 * Returns a new NodeList with all the next siblings of the nodes in the collection
	 * @method next
	 * @return {NodeList}
	 */
	next: function () {
		return this.map(function (next) {
			do {
				next = next.nextSibling;
			}
			while (next && next.nodeType == 1);
			return next;
		});
	},
	/**
	 * Returns a new NodeList with all the previous siblings of the nodes in the collection
	 * @method previous
	 * @return {NodeList}
	 */
	previous: function () {
		return this.map(function (previous) {
			do {
				previous = previous.previousSibling;
			}
			while (previous && previous.nodeType == 3);
			return previous;
		});
	},
	/**
	 * Returns a new NodeList with all the last children of the nodes in the collection
	 * @method first
	 * @return {NodeList}
	 */
	last: function () {
		return this.map(function (node) {
			var children = $(node).children(), i = -1;
			while (children[++i]) {
				node = children[i];
			}
			return node;
		});
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
		}) : this._nodes[0].innerHTML;
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
			return this._nodes[0][key];
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
			return $(this._nodes[0]).currentStyle()[key];
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
		return new NodeList(result);
	},
	/**
	 * Adds an event listener to all the nods in the list
	 * @method on
	 * @param {String} type
	 * @param {Function} callback
	 * @param {Object} thisp
	 */
	on: function (type, callback, thisp) {
		var handlers = [];
		this.each(function (node) {
			handlers.push(addEvent(node, type, callback, thisp));
		});
		return {
			detach: function () {
				for (var i = 0, length = handlers.length; i < length; i++) {
					removeEvent(handlers[i].obj, handlers[i].type, handlers[i].fn);
				}
			}
		};
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
			removeEvent(node, type, callback);
		});
	},
	/**
	 * Removes all event listeners from all the current nodes
	 * If "crawl" is true, it also removes them from all the nodes in the branches defined by the nodes
	 * @method unbindAll
	 * @param {Boolean} crawl
	 * @chainable 
	 */
	unbindAll: function (crawl) {
		return this.each(function (node) {
			if (crawl) {
				$.walkTheDOM(node, EventCache.clear);
			} else {
				EventCache.clear(node);
			}
		});
	},
	/**
	 * Removes all the nodes from the DOM tree and removes all event listeners from the nodes
	 * @method remove
	 * @chainable
	 */
	remove: function () {
		return this.each(function (node) {
			$.walkTheDOM(node, EventCache.clear);
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
		this.children().unbindAll(true).remove();
		return this.html(content);
	},
	/**
	 * Removes all the nodes from the DOM tree. Unline remove(), it keeps all event listeners
	 * @method detach
	 * @chainable
	 */
	detach: function () {
		return this.each(function (node) {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		});
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
		var node = this._nodes[0];
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
		return new NodeList(result);
	},
	/**
	 * Fires the blur event
	 * @method blur
	 * @chainable
	 */
	blur: function () {
		return this.each(function (node) {
			try {
				node.blur();
			} catch (e) {
				$.error(e);
			}
		});
	},
	/**
	 * Fires the focus event
	 * @method focus
	 * @chainable
	 */
	focus: function () {
		return this.each(function (node) {
			try {
				node.focus();
			} catch (e) {
				$.error(e);
			}
		});
	},
	/**
	 * Sets or returns the value of the node. Useful mostly for form elements
	 * @param {String} value - optional
	 * @chainable
	 */
	value: function (val) {
		return this.attr("value", val);
	},
	/**
	 * @method eq
	 * @description Returns a new NodeList with the nth element of the current list
	 * @param {Number} nth
	 */
	eq: function (nth) {
		return new NodeList(this._nodes[nth]);
	}
};
NodeList.is = Lang.is;

A.each(['Left', 'Top'], function (direction) {
	NodeList.prototype['offset' + direction] = function (val) {
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
			
});/**
 * The Base module provides base classes for Utilities and Widgets
 * @module base
 * @requires node
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('base', function ($) {

			
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
var TRACKING = "tracking",
	MOUSEMOVE = "mousemove",
	MOUSEUP = "mouseup",
	SELECTSTART = "selectstart",
	FREQUENCY = "frequency",
	HEIGHT = "height",
	WIDTH = "width",
	PROTO = 'prototype',
	DASH = '-',
	ONCE = '~ONCE~';

function CustomEvent(type, target, onPrevented) {
	this.type = type;
	this.target = target;
	this.preventDefault = function () {
		if (onPrevented) {
			onPrevented();
		}
	};
}

/**
 * <p>A class designed to be inherited or used by other classes to provide custom events.</p>
 * <p>Custom events work by attaching event listeners to a class that extends EventTarget.
 * An event listener can be a function or an object with a method called "handleEvent".
 * If it is a function, when fired the context will be the firing object. In the case of an object, the 
 * context will be the object itself.</p>
 * <p>Attaching an object to the "*" event type allows for a different approach:</p>
 * <code>
 * someObj.handleEvent = function (e) {<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;switch (e.type) {<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;case "someEvent":<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//do something<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break;<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;case "otherEvent":<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//do something else<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break;<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;}<br/>
 * };<br/>
 * eventProvider.on("*", someObj);
 * </code>
 * @class EventTarget
 * @constructor
 */
function EventTarget() {
	
	this._events = {};
	
};
EventTarget.prototype = {
	/**
	 * Adds an event listener 
	 * @method on
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	on: function (eventType, callback, thisp) {
		var collection = this._events;
		var once = false;
		if (!collection[eventType]) {
			collection[eventType] = [];
		}
		
		if (eventType.indexOf(ONCE) > -1) {
			once = true;
			eventType = eventType.substr(ONCE.length);
			console.log(eventType);
		}
		if (Lang.isObject(callback)) {
			collection[eventType].push({
				fn: callback,
				o: thisp || this,
				once: once
			});
		}
		return this;
	},
	
	/**
	 * Listens to an event only once
	 * @method once
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	once: function (eventType, callback, thisp) {
		return this.on(ONCE * eventType, callback, thisp);
	},
	
	/**
	 * Listens to an 'after' event. This is a shortcut for writing on('afterEvent'), callback)
	 * @method after
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	after: function (eventType, callback, thisp) {
		return this.on('after' + eventType.charAt(0).toUpperCase() + eventType.substr(1), callback, thisp);
	},
	/**
	 * Removes and event listener
	 * @method unbind
	 * @param {String} eventType
	 * @param {Function} callback
	 * @chainable
	 */
	unbind: function (eventType, callback) {
		if (eventType) {
			$.Array.remove(callback, this._events[eventType] || []);
		} else {
			this._events = {};
		}
		return this;
	},
	/**
	 * Fires an event, executing all its listeners
	 * @method fire
	 * @param {String} eventType
	 * Extra parameters will be passed to all event listeners
	 */
	fire: function (eventType) {
		var collection = this._events;
		var handlers = collection[eventType] || [];
		var returnValue = true;
		if (collection["*"]) {
			handlers = handlers.concat(collection["*"]);
		}
		var i, collecLength = handlers.length;
		var args = SLICE.call(arguments, 1);
		var callback;
		args.unshift(new CustomEvent(eventType, this, function () {
			returnValue = false;
		}));
		for (i = 0; i < collecLength; i++) {
			callback = handlers[i].fn;
			if (Lang.isFunction(callback)) {
				callback.apply(handlers[i].o, args);
			// if the event handler is an object with a handleEvent method,
			// that method is used but the context is the object itself
			} else if (Lang.isObject(callback) && callback.handleEvent) {
				callback.handleEvent.apply(handlers[i].o || callback, args);
			}
			if (handlers[i].once) {
				A.remove(handlers, handlers[i]);
				i--;
			}
		}
		return returnValue;
	}
};
/**
 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
 * @class Attribute
 * @extends EventTarget
 * @constructor
 */
function Attribute(state) {
	
	Attribute.superclass.constructor.call(this);
	
	this._state = state || {};
	this._stateConf = {};
	
};
extend(Attribute, EventTarget, {
	/**
	 * Adds a configuration attribute, along with its options
	 * @method addAttr
	 * @param {String} attrName
	 * @param {Hash} config
	 * @chainable
	 */
	addAttr: function (attrName, config) {
		this._stateConf[attrName] = config;
		var state = this._state;
		var isValue = Lang.isValue(state[attrName]);
		if (config.required && config.readOnly) {
			$.error("You can't have both 'required' and 'readOnly'");
		}
		if (config.readOnly && isValue) {
			delete state[attrName];
		}
		if (config.required && !isValue) {
			$.error("Missing required attribute: " + attrName);
		}
		if (Lang.isString(config.setter)) {
			config.setter = this[config.setter];
		}
		if (Lang.isString(config.getter)) {
			config.getter = this[config.getter];
		}
		if (isValue && config.setter) {
			state[attrName] = config.setter.call(this, state[attrName]);
		}
		return this;
	},
	
	_set: function (attrName, attrValue) {
		var attrConfig = this._stateConf;
		var state = this._state;
		attrConfig[attrName] = attrConfig[attrName] || {};
		var config = attrConfig[attrName];
		var oldValue = state[attrName];
		if (!config.readOnly) {
			if (!config.validator || config.validator.call(this, attrValue)) {
				attrValue = config.setter ? config.setter.call(this, attrValue) : attrValue;
				if (!Lang.isValue(state[attrName]) && config.value) {
					state[attrName] = config.value;
				}
				if (attrValue !== oldValue) {
					state[attrName] = state[attrName] == attrValue ? attrValue :
											this.fire(attrName + "Change", attrValue, state[attrName]) ? attrValue :
											state[attrName];
					this.fire('after' + Lang.capitalize(attrName) + 'Change', attrValue, oldValue);
				}
			}
			if (config.writeOnce && !config.readOnly) {
				attrConfig[attrName].readOnly = true;
			}
		} else {
			$.error(attrName + " is a " + (config.writeOnce ? "write-once" : "read-only") + " attribute");
		}
		return this;
	},
	/**
	 * Returns a configuration attribute
	 * @method get
	 * @param {String} attrName
	 */	
	get: function (attrName) {
		var attrConfig = this._stateConf;
		var state = this._state;
		attrConfig[attrName] = attrConfig[attrName] || {};
		var config = attrConfig[attrName];
		/*
		 * If it is writstateit wasn't set before, use the default value and mark it as written (readOnly works as written)
		 */
		if (config.writeOnce && !config.readOnly) {
			attrConfig[attrName].readOnly = true;
		}
		if (!Lang.isValue(state[attrName])) {
			state[attrName] = config.value;
		}
		return	config.getter ? config.getter.call(this, state[attrName], attrName) :
				state[attrName];
	},
	/**
	 * Sets a configuration attribute
	 * @method set
	 * @param {String} attrName
	 * @param {Object} attrValue
	 * @chainable
	 */
	set: function (attrName, attrValue) {
		var self = this;
		if (Lang.isObject(attrName)) {
			Hash.each(attrName, this._set, this);
		} else {
			this._set(attrName, attrValue);
		}
		return this;
	},
	/**
	 * Unsets a configuration attribute
	 * @method unset
	 * @param {String} attrName
	 * @chainable
	 */
	unset: function (attrName) {
		delete this._state[attrName];
		return this;
	},
	/**
	 * Adds several configuration attributes
	 * @method addAttrs
	 * @param {Hash} config - key/value pairs of attribute names and configs
	 * @chainable
	 */
	addAttrs: function (config) {
		Hash.each(config, this.addAttr, this);
		return this;
	},
	/**
	 * Returns a key/value paired object with all attributes
	 * @method getAttrs
	 * @return {Hash}
	 */
	getAttrs: function () {
		var result = {};
		var self = this;
		Hash.each(this._state, function (key) {
			result[key] = self.get(key);
		});
		return result;
	}
});
/**
 * Base class for all widgets and utilities.
 * @class Base
 * @extends Attribute
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
Base = function (config) {
	/*
	 * Base should hold basic logic shared among a lot of classes, 
	 * to avoid having to extend the Attribute class which is very specific in what it does
	 */
	Base.superclass.constructor.apply(this, arguments);
	
	var constrct = this.constructor;
	var classes = this._classes = [];
	var i;
	function attachEvent(name, fn) {
		this.on(name, Lang.isString(fn) ? this[fn] : fn);
	}
	while (constrct != Base) {
		classes.unshift(constrct);
		constrct = constrct.superclass.constructor;
	}
	for (i = 0; i < classes.length; i++) {
		if (classes[i].ATTRS) {
			this.addAttrs(classes[i].ATTRS);
		}
		if (classes[i].EVENTS) {
			Hash.each(classes[i].EVENTS, attachEvent, this);
		}
		if (classes[i][PROTO].hasOwnProperty('initializer')) {
			classes[i][PROTO].initializer.call(this, config);
		}
	}
	Hash.each(this.get("on"), attachEvent, this);
};
extend(Base, Attribute, {}, {
	
	ATTRS: {
		/**
		 * Allows quick setting of custom events in the constructor
		 * @attribute on
		 * @writeOnce
		 */
		on: {
			writeOnce: true,
			value: {}
		}
	},
	
	/**
	 * @method create
	 * @description creates a new base class
	 * @static
	 * @param {String} name Name of the base class to create
	 * @param {Function} superclass [Optional] The superclass for this new class. Defaults to Base
	 * @param {Array} extensions [Optional] A list of extensions to apply to the created class
	 * @param {Hash} attrs [Optional] Static properties of the class. Recommended order: ATTRS, EVENTS, HTML_PARSER
	 * @param {Hash} proto [Optional] Prototype properties to add to the class
	 */
	create: function (name, superclass, extensions, attrs, proto) {
		extensions = extensions || [];
		function BuiltClass() {
			var args = arguments;
			var self = this;
			BuiltClass.superclass.constructor.apply(this, args);
			A.each(BuiltClass.exts, function (extension) {
				extension.apply(self, args);
				Hash.each(extension.EVENTS || {}, function (type, fn) {
					self.on(type, fn);
				});
			});
		}
		extend(BuiltClass, superclass || Base, proto, attrs || {});
		$.mix(BuiltClass, {
			NAME: name,
			exts: extensions
		}, true);
		A.each(extensions, function (extension) {
			$.mix(BuiltClass[PROTO], extension[PROTO]);
			Hash.each(extension, function (prop, val) {
				if (!BuiltClass[prop]) {
					BuiltClass[prop] = val;
				} else if (Lang.isObject(BuiltClass[prop]) && Lang.isObject(val)) {
					$.mix(BuiltClass[prop], val);
				}
			});
		});
		return BuiltClass;
	}
	
});
/**
 * Basic class for all utilities
 * @class Utility
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function Utility() {
	Utility.superclass.constructor.apply(this, arguments);
}
extend(Utility, Base, {
	
	initializer: function () {
		this._handlers = [$(this.get('win')).on(UNLOAD, this.destroy, this)];
	},
	
	/**
	 * Calls itself when the window unloads. Allows for easier memory cleanup
	 * @method destroy
	 */
	destroy: function () {
		var self = this;
		/**
		 * Preventing the default behavior will stop the destroy process
		 * @event destroy
		 */
		if (this.fire(DESTROY)) {
			A.each(this._handlers, function (handler) {
				handler.detach();
			});
		}
	},
	
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join(DASH);
	}
}, {
	
	CSS_PREFIX: 'jet',
	
	ATTRS: {
		/**
		 * @attribute cssPrefix
		 * @default Utility.CSS_PREFIX
		 * @writeOnce
		 */
		cssPrefix: {
			value: Utility.CSS_PREFIX,
			writeOnce: true
		}
	}
	
});
var BOUNDING_BOX = 'boundingBox',
	CONTENT_BOX = 'contentBox',
	SRC_NODE = 'srcNode',
	CONTENT = 'content',
	CLASS_PREFIX = 'classPrefix',
	UNLOAD = 'unload',
	VISIBILITY = 'visibility',
	DESTROY = 'destroy';

if (!jet.Widget) {
	jet.Widget = {};
}
if (!Lang.isNumber(jet.Widget._uid)) {
	jet.Widget._uid = -1;
}
if (!jet.Widget._instances) {
	jet.Widget._instances = {};
}

/**
 * Base class for all widgets. 
 * Provides show, hide, render and destroy methods, the rendering process logic
 * and basic attributes shared by all widgets 
 * @class Widget
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
var Widget = Base.create('widget', Base, [], {
	
	/**
	 * @property CSS_PREFIX
	 * @description Default prefix for all css classes used in widget by the getClassName() method
	 * @static
	 * @default 'jet'
	 */
	CSS_PREFIX: 'jet',
	
	NAME: 'widget',
	
	/**
	 * @property DOM_EVENTS
	 * @description DOM events that are routed automatically to the widget instance
	 * @static
	 * @default { click: 1, keypress: 1, mousedown: 1, mouseup: 1, mouseover: 1, mouseout: 1 }
	 */
	DOM_EVENTS: {
		click: 1,
		keypress: 1,
		mousedown: 1,
		mouseup: 1,
		mouseover: 1,
		mouseout: 1
	},
	
	ATTRS: {
		/**
		 * @attribute srcNode
		 * @description The node to which the widget will be appended to. May be set as a 
		 * configuration attribute, with a setter or as the first parameter of the render() method
		 * @type DOMNode | NodeList
		 */
		srcNode: {
			value: $($.context.body),
			setter: $
		},
		/**
		 * @attribute classPrefix
		 * @description Prefix for all CSS clases. Useful for renaming the project
		 * @default Widget.CSS_PREFIX
		 * @writeOnce
		 */
		classPrefix: {
			writeOnce: true,
			getter: function (val) {
				return val || Widget.CSS_PREFIX;
			}
		},
		/**
		 * @attribute rendered
		 * @description Rendered status. Shouldn't be changed by anything appart from the Widget.render() method
		 * @writeOnce
		 * @default false
		 */
		rendered: {
			value: false
		},
		/**
		 * The bounding box contains all the parts of the widget
		 * @attribute boundingBox
		 * @writeOnce
		 * @type NodeList
		 * @default uses BOUNDING_TEMPLATE instance property
		 */
		boundingBox: {
			setter: $
		},
		/**
		 * @attribute contentBox
		 * @description Another container inside the boundingBox added in order to have a more complex design
		 * @writeOnce
		 * @type NodeList
		 * @default uses CONTENT_TEMPLATE instance property
		 */
		contentBox: {
			setter: $
		},
		/**
		 * @attribute width
		 * @description The width of the overlay
		 * @type Number
		 */
		width: {
			validator: Lang.isNumber
		},
		/**
		 * @attribute height
		 * @description The height of the overlay.
		 * If set to 0 (zero) the height changes with the content
		 * @type Number
		 */
		height: {
			validator: Lang.isNumber
		},
		/**
		 * @attribute id
		 * @description The id of the widget
		 * @default class prefix + widget count
		 * @writeOnce
		 */
		 id: {
		 	writeOnce: true
		 },
		 /**
		  * @attribute visible
		  * @description The visibility status of the widget
		  * @default true
		  * @type Boolean
		  */
		 visible: {
		 	value: true,
		 	validator: Lang.isBoolean
		 },
		 /**
		  * @attribute disabled
		  * @description The disabled status of the widget
		  * @default false
		  * @type Boolean
		  */
		 disabled: {
		 	value: false,
		 	validator: Lang.isBoolean
		 }
	},
	
	HTML_PARSER: {
		contentBox: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			if (boundingBox && this.CONTENT_TEMPLATE) {
				return boundingBox.first();
			}
		}
	},
	
	/**
	 * @method getByNode
	 * @description Returns a widget instance based on a node
	 * @static
	 */
	getByNode: function (node) {
		node = $(node)._nodes[0];
		var de = node.ownerDocument.documentElement;
		while (node && node != de) {
			if (node.id && jet.Widget._instances[node.id]) {
				return jet.Widget._instances[node.id];
			}
			node = node.parentNode;
		}
		return null;
	}
	
}, {
	
	BOUNDING_TEMPLATE: '<div/>',
	CONTENT_TEMPLATE: '<div/>',

	_domEventProxy: function (e) {
		this.fire(e.type, e);
	},
	
	/**
	 * Shows the widget
	 * @method show
	 * @chainable
	 */
	show: function () {
		return this.set('visible', true);
	},
	/**
	 * Hides the widget
	 * @method hide
	 * @chainable
	 */
	hide: function () {
		return this.set('visible', false);
	},
	/**
	 * Enables the widget
	 * @method enable
	 * @chainable
	 */
	enable: function () {
		return this.set('enabled', true);
	},
	/**
	 * Disables the widget
	 * @method enable
	 * @chainable
	 */
	disable: function () {
		return this.set('enabled', false);
	},
	/**
	 * Focuses the widget
	 * @method focus
	 * @chainable
	 */
	focus: function () {
		return this.set('focused', true);
	},
	/**
	 * Blurrs the element
	 * @method blur
	 * @chainable
	 */
	blur: function () {
		return this.set('focused', false);
	},
	/**
	 * Starts the rendering process. The rendering process is based on custom events.
	 * The widget class fires a 'render' event to which all subclasses must subscribe.
	 * This way all listeners are fired in the order of the inheritance chain. ie:
	 * In the Overlay class, the render process is:
	 * <code>render() method -> Module listener -> Overlay listener -> rest of the render() method (appends the boundingBox to the srcNode)</code>
	 * This helps to use an easy pattern of OOP CSS: each subclass adds a CSS class name to the boundingBox,
	 * for example resulting in <div class="jet-module jet-overlay jet-panel"></div>. That way
	 * a panel can inherit css properties from module and overlay.
	 * @method render
	 * @param {NodeList|HTMLElement} target
	 * @chainable
	 */
	render: function (target) {
		if (!this.get('rendered')) {
			var self = this;
			var boundingBox = this.get(BOUNDING_BOX);
			var contentBox = this.get(CONTENT_BOX);
			var srcNode = this.get(SRC_NODE);
			var className, classPrefix = this.get(CLASS_PREFIX);
			var classes = this._classes;
			Hash.each(Widget.DOM_EVENTS, function (name, activated) {
				if (activated) {
					self._handlers.push(boundingBox.on(name, self._domEventProxy, self));
				}
			});
			if (target) {
				srcNode = target;
				self.set(SRC_NODE, target);
			}

			if (this.constructor == Widget) {
				classes = [Widget];
			} else {
				classes.shift();
			}
			
			A.each([WIDTH, HEIGHT], function (size) {
				var value = self.get(size);
				if (Lang.isNumber(value)) {
					boundingBox[size](value);
				}
				self.on(size + 'Change', function (e, newVal) {
					newVal = Lang.isNumber(newVal) ? newVal : '';
					self.get(BOUNDING_BOX)[size](newVal);
				});
			});
			
			A.each(classes, function (construct) {
				className = [classPrefix, construct.NAME].join(DASH);
				boundingBox.addClass(className);
				contentBox.addClass([className, CONTENT].join(DASH));
			});
			
			if (boundingBox._nodes[0] != contentBox._nodes[0]) {
				boundingBox.append(contentBox.css(VISIBILITY, 'inherit'));
			}
			if (!boundingBox.attr('id')) {
				boundingBox.attr('id', this.get('id'));
			}
			/**
			 * Render event. Preventing the default behavior will stop the rendering process
			 * @event render
			 * @see Widget.render()
			 */
			if (this.fire('render')) {
				
				if (!boundingBox.inDoc()) {
					boundingBox.appendTo(srcNode);
				}
				/**
				 * Fires after the render process is finished
				 * @event afterRender
				 */
				this.set('rendered', true).focus();
				setTimeout(function () {
					/**
					 * Fires after the render lifecycle finished. It is also fired after a timeout of 0 milliseconds, 
					 * so it is added to the execution queue rather than fired synchronously 
					 * @event afterRender
					 */
					self.fire('afterRender');
				}, 0);
			}
		}
		return this;
	},
	/**
	 * Destroys the widget by removing the elements from the dom and cleaning all event listeners
	 * @method destroy
	 */
	destroy: function () {
		var self = this;
		/**
		 * Preventing the default behavior will stop the destroy process
		 * @event destroy
		 */
		if (this.fire(DESTROY)) {
			A.each(this._handlers, function (handler) {
				if (handler.detach) {
					handler.detach();
				}
			});
			/*
			 * Avoiding memory leaks, specially in IE
			 */
			this.get(BOUNDING_BOX).unbindAll(true).remove();
		}
	},
	
	_parseHTML: function () {
		var self = this;
		var boundingBox = this.get(BOUNDING_BOX);
		if (boundingBox._nodes[0] && boundingBox.inDoc()) {
			A.each(this._classes, function (someClass) {
				Hash.each(someClass.HTML_PARSER || {}, function (attr, parser) {
					var val = parser.call(self, boundingBox);
					if (Lang.isValue(val) && (!(val instanceof $.NodeList) || val._nodes[0])) {
						self.set(attr, val);
					}
				});
			});
		}
	},
	
	_toggleVisibility: function (e, newVal) {
		var visibilityClass = this.getClassName('hidden');
		var boundingBox = this.get(BOUNDING_BOX);
		if (newVal) {
			boundingBox.removeClass(visibilityClass);
		} else {
			boundingBox.addClass(visibilityClass);
		}
	},
	
	_toggleDisabled: function (e, newVal) {
		var disabledClass = this.getClassName('disabled');
		var boundingBox = this.get(BOUNDING_BOX);
		if (newVal) {
			boundingBox.addClass(disabledClass);
		} else {
			boundingBox.removeClass(disabledClass);
		}
	},
	
	initializer: function () {
		this._handlers = [$($.config.win).on(UNLOAD, this.destroy, this)];
		
		this._uid = ++jet.Widget._uid;
		
		var id = this.get('id');
		if (!id) {
			id = this.getClassName(this._uid);
			this.set('id', id);
		}
				
		jet.Widget._instances[id] = this;
		
		if (!this.get(BOUNDING_BOX)) {
			this.set(BOUNDING_BOX, this.BOUNDING_TEMPLATE);
		}
		if (!this.get(CONTENT_BOX)) {
			this.set(CONTENT_BOX, this.CONTENT_TEMPLATE || this.get(BOUNDING_BOX));
		}
		
		this.after('visibleChange', this._toggleVisibility);
		this.after('disabledChange', this._toggleDisabled);
		
		this._parseHTML();
	},
	
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join('-');
	}

});
/**
 * A utility for tracking the mouse movement without crashing the browser rendering engine.
 * Also allows for moving the mouse over iframes and other pesky elements
 * @class Mouse
 * @constructor
 * @extends Utility
 * @param {Object} config Object literal specifying configuration properties
 */
var Mouse = Base.create('mouse', Utility, [], {
	
	ATTRS: {
		/**
		 * Frequency at which the tracker updates
		 * @attribute frequency
		 * @default 20 (ms)
		 * @type Number
		 */
		frequency: {
			value: 20
		},
		/**
		 * Tracking status. Set it to true to start tracking
		 * @attribute tracking
		 * @type Boolean
		 * @default false
		 */
		tracking: {
			value: false,
			validator: Lang.isBoolean
		},
		capturing: {
			value: false,
			validator: Lang.isBoolean
		},
		shields: {
			readOnly: true,
			getter: '_buildShim'
		},
		shim: {
			value: false,
			validator: Lang.isBoolean
		},
		prevX: {
			value: 0
		},
		prevY: {
			value: 0
		}
	}
	
}, {
	
	_buildShim: function () {
		if (!Mouse.shim) {
			var pageSize = this.get('pageSize');
			Mouse.shim = $('<iframe/>').attr({
				frameborder: '0',
				src: 'javascript:;'
			}).css({
				opacity: 0,
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: pageSize.width,
				height: pageSize.height,
				border: 0,
				zIndex: 20000000
			}).appendTo($.config.doc.body).hide();
		}
		return Mouse.shim;
	},
	
	_onTrackingChange: function (e, value) {
		var self = this;
		if (value) {
			if (!this.get('capturing')) {
				if (this.get('shim')) {
					this.shim.show();
				}
				this.interval = setInterval(function () {
					var clientX = self.get('clientX');
					var clientY = self.get('clientY');
					if (self.get('prevX') != clientX || self.get('prevY') != clientY) {
						self.fire(MOUSEMOVE, clientX, clientY);
						self.set({
							prevX: clientX,
							prevY: clientY
						});
					}
				}, this.get(FREQUENCY));
				this.set('capturing', true);
			}
		} else {
			this.shim.hide();
			clearInterval(this.interval);
			this.set('capturing', false);
		}
	},
	
	_onSelectStart: function (e) {
		if (this.get('capturing')) {
			e.preventDefault();
		}
	},
	
	_onMouseMove: function (e) {
		this.set({
			clientX: e.clientX,
			clientY: e.clientY
		});
	},
	
	_onMouseUp: function () {
		/**
		 * Fires when the mouse button is released
		 * @event mouseup
		 */
		this.set(TRACKING, false).fire('mouseup', this.get('clientX'), this.get('clientY'));
	},
	
	initializer: function () {
		this.set('pageSize', $.DOM.pageSize());
		
		var shim = this.shim = this._buildShim();
		
		this.after('trackingChange', this._onTrackingChange);
		
		/**
		 * Fires not when the mouse moves, but in an interval defined by the frequency attribute
		 * This way you can track the mouse position without breakin the browser's rendering engine
		 * because the native mousemove event fires too quickly
		 * @event move
		 */
		var shimDoc = $(shim._nodes[0].contentWindow.document); 
		shimDoc.find('body').css({
			margin: 0,
			padding: 0
		});
		shimDoc.on(MOUSEMOVE, this._onMouseMove, this);
		shimDoc.on(MOUSEUP, this._onMouseUp, this);
		
		var context = $($.config.doc);
		context.on("selectstart", this._onSelectStart, this);
		context.on(MOUSEMOVE, this._onMouseMove, this);
		context.on(MOUSEUP, this._onMouseUp, this);

		this.on('destroy', shim.unbindAll, shim);
	},
	
	/**
	 * Start tracking. Equivalent to setting the tracking attribute to true.
	 * Simulates the mousedown event
	 * @method down
	 * @chainable
	 */
	down: function () {
		return this.set(TRACKING, true);
	},
	/**
	 * Stop tracking. Equivalent to setting the tracking attribute to false
	 * Simulates the mouseup event
	 * @method up
	 * @chainable
	 */
	up: function () {
		return this.set(TRACKING, false);
	}
});
(function () {
	
	var $_event = new EventTarget();
	var interval, timeout;
	var lastScrollLeft, lastScrollTop;
	var win = $.config.win;
	
	var scroll = function () {
		var scrollLeft = $.DOM.scrollLeft();
		var scrollTop = $.DOM.scrollTop();
		if (scrollLeft != lastScrollLeft || scrollTop != lastScrollTop) {
			$_event.fire('scroll', scrollLeft, scrollTop);
		} else {
			clearInterval(interval);
			interval = null;
		}
		lastScrollLeft = scrollLeft;
		lastScrollTop = scrollTop;
	}
	
	$($.config.win).on('scroll', function () {
		if (!interval) {
			interval = setInterval(scroll, 50);
		}
	});
	
	$.on = $.bind($_event.on, $_event);
	
	A.each(['load', 'unload'], function (name) {
		$(win).on(name, function () {
			$_event.fire(name);
		});
	});
	
	$(win).on('resize', function () {
		$_event.fire('resize');
	});
	
}());

$.add({
	Mouse: Mouse,
	Attribute: Attribute,
	Base: Base,
	Utility: Utility,
	Widget: Widget,
	EventTarget: EventTarget,
	extend: extend
});
			
});