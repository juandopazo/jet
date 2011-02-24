/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * @module	jet
 * @description <p>Based on YUI3's namespace</p>
 * 
 * <p>This module allows to load different modules asynchronously and to reuse
 * them when they were already loaded. Its basic use looks like:</p>
 */
(function () {
	var baseUrl = location.protocol + "//github.com/juandopazo/jet/raw/master/build/";
	
	var win = window,
		doc = document,
		OP = Object.prototype,
		AP = Array.prototype,
		SP = String.prototype,
		SLICE = AP.slice,
		TOSTRING = OP.toString,
		BASE = "base",
		NODE = "node",
		WIDGET_PARENTCHILD = "widget-parentchild";
	
	/*
	 * These modules can be called by the jet().use() method without defining a path.
	 * Each module should be defined after its requirements
	 */
	var predefinedModules = {
		ua: true,
		log: true,
		node: ["log", "ua"],
		xsl: [NODE],
		swf: true,
		json: [NODE],
		cookie: [NODE],
		sizzle: [NODE],
		base: [NODE],
		io: ["json"],
		"io-xdr": [NODE, "swf", "io"],
		"io-xsl": ["io"],
		"history": [BASE, "json"],
		resize: [BASE, {
			name: "resize-css",
			type: "css",
			path: "resize.css",
			beacon: {
				name: "borderLeftStyle",
				value: "solid"
			}
		}],
		button: [WIDGET_PARENTCHILD, {
			name: "button-css",
			type: "css",
			path: "button.css",
			beacon: {
				name: "borderBottomStyle",
				value: "solid"
			}
		}],
		container: [BASE, 'widget-alignment', {
			name: "container-css",
			type: "css",
			path: "container.css",
			beacon: {
				name: "borderRightStyle",
				value: "solid"
			}
		}],
		progressbar: [BASE, {
			name: "progressbar-css",
			type: "css",
			path: "progressbar.css",
			beacon: {
				name: "cursor",
				value: "pointer"
			}
		}],
		dragdrop: [BASE],
		imageloader: [BASE],
		anim: [BASE],
		datasource: [BASE, "io"],
		datatable: ["datasource", {
			name: "datatable-css",
			type: "css",
			path: "datatable.css",
			beacon: {
				name: "borderTopStyle",
				value: "solid"
			}
		}],
		tabview: [WIDGET_PARENTCHILD, {
			name: "tabview-css",
			type: "css",
			path: "tabview.css",
			beacon: {
				name: "display",
				value: "none"
			}
		}],
		treeview: [WIDGET_PARENTCHILD],
		'widget-alignment': [BASE],
		'widget-parentchild': [BASE],
		'widget-sandbox': [BASE],
		menu: [WIDGET_PARENTCHILD, 'container'],
		vector: ["anim"]
	};
	
	 //A couple of functions of this module are used throughout the Loader.
	 //Should this be defined as any other module with the jet().add() method?
	var ARRAY		= "array",
		BOOLEAN		= "boolean",
		FUNCTION	= "function",
		OBJECT		= "object",
		HASH		= "hash",
		NULL		= "null",
		NUMBER		= "number",
		STRING		= "string",
		UNDEFINED	= "undefined";
		
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
			"[object Object]"	: HASH,
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
			 * Returns if o is an object literal
			 * @method isHash
			 * @param {Object} o
			 */
			isHash: function (o) {
				return type(o) === HASH;
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
			}
		};
	}());
	var ArrayHelper, Hash;
	/**
	 * Clones an object, returning a copy with the sames properties
	 * @method clone
	 * @param {Object} o
	 */
	var clone = function (o) {
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
	};
	Lang.clone = clone;
	
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
	
	var createNode = function (name, attrs, s, docum) {
		docum = docum || doc;
		var node = docum.createElement(name);
		Hash.each(attrs, function (attr, val) {
			node[attr] = val;
		});
		Hash.each(s, function (name, val) {
			node.style[name] = val;
		});
		return node;
	};
	
	var head = doc.getElementsByTagName("head")[0];
	/**
	 * Dinamically inserts a script before the first script it finds on the page (at least the one executing this)
	 * It loads scripts asynchronously, so it doesn't lock the browser and the loaded scripts can't use document.write()
	 * 
	 * @private
	 * @param {String} url
	 */
	var loadScript = function (url, keep) {
		var script = createNode("script", {
			type: "text/javascript",
			asyng: true,
			src: url
		});
		head.appendChild(script);
		if (!keep) {
			setTimeout(function () {
				
				//Added src = null as suggested by Google in 
				//http://googlecode.blogspot.com/2010/11/instant-previews-under-hood.html
				script.src = null;
				head.removeChild(script);
			}, 10000);
		}
	};
	
	var loadCSS = function (url) {
		head.appendChild(createNode("link", {
			type: "text/css",
			rel: "stylesheet",
			href: url
		}));
	};
	
	var domReady = function (fn, lib) {
		if (doc.body) {
			fn.call(doc, lib);
		} else {
			setTimeout(function () {
				domReady(fn, lib);
			}, 13);
		}
	};
	
	var getCurrentStyle = function (node) {
		return win.getComputedStyle ? win.getComputedStyle(node, null) : 
						node.currentStyle ? node.currentStyle : {};
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


	var Core = function (config) {
		/**
		 * Core methods
		 * @class Core
		 * @static
		 */
		
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
		var $ = function (query, root) {
			root = root || $.context;
			$.context = root.ownerDocument || $.context;
			if (Lang.isString(query)) {
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
		
		if (win.JSON) {
			$.JSON = win.JSON;
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
			
			utils: {},
			
			/**
			 * Loads scripts and CSS files.
			 * Included in the jet() core
			 * @class Get
			 * @static
			 */
			Get: {
				/**
				 * Loads a script asynchronously
				 * @method script
				 * @param {String} url
				 */
				script: function (url, keep) {
					var script =$('<script/>').attr({
						type: "text/javascript",
						asyng: true,
						src: url
					});
					$('head').append(script);
					if (!keep) {
						setTimeout(function () {
							
							//Added src = null as suggested by Google in 
							//http://googlecode.blogspot.com/2010/11/instant-previews-under-hood.html
							script[0].src = null;
							script.remove();
						}, 10000);
					}
				},
				/**
				 * Loads a CSS file
				 * @method css
				 * @param {String} url
				 */
				css: function (url) {
					$('head').append($('<link/>').attr({
						type: "text/css",
						rel: "stylesheet",
						href: url
					}));
				}
			}
		});
		
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
	var update = function (win, doc) {
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
				core = new Core(win, doc);
				for (j = 0; j < requiredLength; j++) {
					modules[required[j].name](core);
				}
				domReady(queueList.splice(i, 1)[0].main, core);
			} else {
				i++;
			}
		}
	};
	
	if (!win.jet) {
		var trackerDiv;
		domReady(function () {
			trackerDiv = createNode("div", {
				id: "jet-tracker"
			}, {
				position: "absolute",
				width: "1px",
				height: "1px",
				top: "-1000px",
				left: "-1000px",
				visibility: "hidden"
			});
			doc.body.appendChild(trackerDiv);
		});
			
		/**
		 * <p>Global function. Returns an object with 2 methods: use() and add().</p>
		 *  
		 * <code>jet().use("node", function ($) {
		 *	 //do something with $
		 * });</code>
		 * 
		 * <p>This snippet will load the Node module, and when it finishes loading it'll execute
		 * the function. Each module must call the jet().add() method to tell the loader
		 * it has finished loading:</p>
		 * 
		 * <code>jet().add("node", function ($) {
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
		win.jet = function (o) {
			var config = Lang.isHash(o) ? o : {};
			var base = baseUrl;
			/**
			 * @config base
			 * @description prefix for all script and css urls
			 * @type String
			 * @default "//jet-js.googlecode.com/svn/trunk/src/"
			 */
			if (config.base) {
				base = config.base;
				base = base.substr(base.length - 1, 1) == "/" ? base : base + "/";
			}
			/**
			 * @config base
			 * @description defines whether predefined modules should be minified or not
			 * @type Boolean
			 * @default true
			 */
			config.minify = Lang.isBoolean(config.minify) ? config.minify : false;
			/**
			 * @config loadCss
			 * @description If true, css modules are loaded
			 * @type Boolean
			 * @default true
			 */
			config.loadCss = Lang.isBoolean(config.loadCss) ? config.loadCss : true;
			/**
			 * @config modules
			 * @description Allows to define your own modules. Currently the same as using object literals in the use() method
			 * @type Array
			 */
			var predef = mix(clone(predefinedModules), config.modules || {}, true);
			
			/**
			 * @config win
			 * @description A reference to the global object that is accesible later with $.win
			 */
			config.win = config.win || window;
			/**
			 * @config doc
			 * @description A reference to the document that is accesible later with $.doc
			 */
			config.doc = config.doc || document;
			
			var loadCssModule = function (module) {
				var url = module.fullpath || (module.path ? (base + module.path) : (base + module.fileName + (config.minify ? ".min.css" : ".css")));
				loadCSS(url);
				var t = setInterval(function () {
					if (getCurrentStyle(trackerDiv)[module.beacon.name] == module.beacon.value) {
						clearInterval(t);
						jet().add(module.name, function () {});
					}
				}, 50);
			};
			
			var use = function () {
				
				var request = SLICE.call(arguments);
				var i = 0, j = 0, k, module, moveForward;
				
				// if "*" is used, include everything
				if (ArrayHelper.indexOf("*", request) > -1) {
					while (j < request.length) {
						if (Lang.isString(request[j])) {
							request.splice(j, 1);
						} else {
							j++;
						}
					}
					AP.unshift.apply(request, Hash.keys(predef));
					
				// add widget-parentchild by default
				} else if (ArrayHelper.indexOf(BASE, request) == -1) {
					request.unshift(BASE);
				}
				
				// handle requirements
				while (i < request.length - 1) {
					module = request[i];
					moveForward = 1;
					if (Lang.isString(module)) {
						module = predef[module.toLowerCase()];
						if (module && Lang.isArray(module)) {
							for (j = module.length - 1; j >= 0; j--) {
								if (!ArrayHelper.inArray(module[j], request)) {
									request.splice(i, 0, module[j]);
									moveForward = 0;
								}
							}
						}
					}
					i += moveForward;
				}
				
				// remove JSON module if there's native JSON support
				if (win.JSON) {
					ArrayHelper.remove("json", request);
				}
				
				// transform every module request into an object and load the required css/script if not already loaded
				for (i = 0; i < request.length - 1; i++) {
					module = request[i];
					/*
					 * If a module is a string, it is considered a predefined module.
					 * If it isn't defined, it's probably a mistake and will lead to errors
					 */
					if (Lang.isString(module) && predef[module]) {
						request[i] = module = Lang.isHash(predef[module]) ? predef[module] : {
							name: module,
							path: module + (config.minify ? ".min.js" : ".js")
						};
					}
					if (module.type == "css" && !config.loadCss) {
						request.splice(i, 1);
						i--;
					} else if (!(modules[module.name] || queuedScripts[module.fullpath || (base + module.path)])) {
						if (!module.type || module.type == "js") {
							loadScript(module.fullpath || (base + module.path)); 
						} else if (module.type == "css") {
							domReady(loadCssModule, module);
						}
						queuedScripts[module.fullpath || (base + module.path)] = 1;
					}
				}
				
				// add the queue to the waiting list
				queueList.push({
					main: request.pop(),
					req: request,
					// onProgress handlers are managed by queue
					onProgress: config.onProgress
				});
				update(config);
			};
		
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
				use: use,
				/**
				 * Adds a module to the loaded module list and calls update() to check if a queue is ready to fire
				 * This method must be called from a module to register it
				 * @method add
				 * @param {String} moduleName
				 * @param {Function} expose
				 */
				add: function (moduleName, expose) {
					/*
					 * Modules are overwritten by default.
					 * Maybe it would be a good idea to add an option not to overwrite if present?
					 */ 
					modules[moduleName] = expose;
					update(config);
				}
			};
		};
	}
}());