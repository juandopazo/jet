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
	var baseUrl = location.protocol + "//jet-js.googlecode.com/svn/trunk/build/";
	
	var win = window,
		doc = document,
		OP = Object.prototype,
		AP = Array.prototype,
		SP = String.prototype,
		SLICE = AP.slice,
		TOSTRING = OP.toString,
		BASE = "base",
		NODE = "node";
	
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
		spbar: [NODE],
		json: [NODE],
		cookie: [NODE],
		sizzle: [NODE],
		base: [NODE],
		io: ["json"],
		"io-xdr": [NODE, "swf", "io"],
		"io-xsl": ["io"],
		"history": [BASE, "json"],
		tabs: [BASE],
		resize: [BASE, {
			name: "resize-css",
			type: "css",
			fileName: "resize",
			beacon: {
				name: "borderLeftStyle",
				value: "solid"
			}
		}],
		button: [BASE, {
			name: "button-css",
			type: "css",
			fileName: "button",
			beacon: {
				name: "borderBottomStyle",
				value: "solid"
			}
		}],
		container: [BASE, {
			name: "container-css",
			type: "css",
			fileName: "container",
			beacon: {
				name: "borderRightStyle",
				value: "solid"
			}
		}],
		dragdrop: [BASE],
		imageloader: [BASE],
		anim: [BASE],
		datasource: [BASE, "io"],
		datatable: ["datasource", {
			name: "datatable-css",
			type: "css",
			fileName: "datatable",
			beacon: {
				name: "borderTopStyle",
				value: "solid"
			}
		}],
		treeview: [BASE],
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
		    return (new RegExp('^\s*function[^\{]+{\s*\[native code\]\s*\}\s*$"')).test(func);
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
				i = str.length;
				while (ws.test(str.charAt(--i))) {}
				return str.slice(0, i + 1);
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
	
	var createNode = function (name, attrs, s) {
		var node = doc.createElement(name);
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


	var Core = function () {
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
			/**
			 * A pointer to the last Windo that was referenced by the $() function
			 * @property win
			 */
			win: win,
			/**
			 * A pointer to the last Document that was referenced by the $() function.
			 * @property context
			 */
			context: doc,
			
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
				script: loadScript,
				/**
				 * Loads a CSS file
				 * @method css
				 * @param {String} url
				 */
				css: loadCSS
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
				core = new Core();
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
		win.jet = function (config) {
			config = config || {};
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
			
			return {
				/**
				 * Allows to load modules and obtain a unique reference to the library augmented by the requested modules 
				 * 
				 * This method works by overloading its parameters. It takes names (String) of predefined modules
				 * or objects defining name and path/fullpath of a module. The last parameter must be a function 
				 * that contains the main logic of the application.
				 * @method use 
				 */
				use: function () {
					
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
						
					// add ajax by default
					} else if (ArrayHelper.indexOf("io", request) == -1) {
						request.unshift("io");
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
					update();
				},
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
					update();
				}
			};
		};
	}
}());/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Handles AJAX requests
 * @module io
 * @namespace
 */
jet().add('io', function ($) {
	var win = $.win;
	var Lang = $.Lang,
		Hash = $.Hash;
	
	var XML = "xml",
	XSL = "xsl",
	TYPE_JSON = "json",
	GET = "GET";
	
	var HAS_AXO = !!win.ActiveXObject;
	var HAS_XHR = !!win.XMLHttpRequest;
	
	var newAXO = function (t) {
		return new win.ActiveXObject(t);
	};
	
	var hashToURI = function (hash) {
		var result = [];
		Hash.each(hash, function (key, value) {
			result.push(key + "=" + value);
		});
		return result.join("&");
	};
	
	var getActiveXParser = function (type) {
		var freeThreadedDOM = "Msxml2.FreeThreadedDOMDocument.",
			domDocument = "Msxml2.DOMDocument.",
			test,
		/* La eleccion de versiones 6.0 y 3.0 es adrede.
		   La version 4.0 es especifica de windows 2000 y la 5.0 viene unicamente con Microsoft Office
		   La version 6 viene con Windows Vista y uno de los service pack de XP, por lo que el usuario quizas no la tenga
		   Se la usa porque es considerablemente mas rapida */
			v6 = "6.0",
			v3 = "3.0";
		try {
			test = newAXO(domDocument + v6);
			getActiveXParser = function (type) {
				if (type == XSL) {
					return newAXO(freeThreadedDOM + v6);
				} else {
					return newAXO(domDocument + v6);
				}
			};
		} catch (e) {
			try {
				test = newAXO(domDocument + v3);
				getActiveXParser = function (type) {
					if (type == XSL) {
						return newAXO(freeThreadedDOM + v3);
					} else {
						return newAXO(domDocument + v3);
					}
				};
			} catch (ex) {
				
			}
		}
		return getActiveXParser(type);
	},
	
	getAjaxObject = function () {
		var hostname = location.host,
			msxml = "Microsoft.XMLHTTP",
			test;
		if ((location.protocol == "file:" || hostname == "localhost" || hostname == "127.0.0.1") && HAS_AXO) {
			getAjaxObject = function () {
				return newAXO(msxml);
			};
		} else if (HAS_XHR) {
			getAjaxObject = function () {
				return new XMLHttpRequest();
			};
		} else if (HAS_AXO) {
			getAjaxObject = function () {
				return newAXO(msxml);
			};
		}
		return getAjaxObject();
	};
	
	var timeoutError = "timeout",
	noObjectError = "Can't create object",
	noStatusError = "Bad status",
	notFoundError = "File not found";
	
	/* Parsea un XML
	En Internet Explorer instancia un objeto ActiveX llamado MSXML. En el resto usa XMLHttpRequest.responseXML */
	var parseXML = function (xmlFile, type, errorHandler) {
		var xmlDoc = null;
		if (xmlFile.responseXML) {
			xmlDoc = xmlFile.responseXML;
		} else if (win.DOMParser) {
			xmlDoc = new win.DOMParser();
			xmlDoc = xmlDoc.parseFromString(xmlFile.responseText || xmlFile, "text/xml");
		} else if (HAS_AXO) {
			xmlDoc = getActiveXParser(type);
			xmlDoc.async = false;
			xmlDoc.loadXML(xmlFile.responseText || xmlFile);
			if (xmlDoc.parseError.errorCode !== 0) {
				errorHandler(noStatusError, xmlDoc.parseError);
			}
		} else {
			errorHandler(0, {
				reason: "Can't find a suitable XML parser",
				srcText: xmlFile
			});
		}
		return xmlDoc;
	};
				
	var getResultByContentType = function (xhr, dataType, onError) {
		var contentType = dataType || xhr.getResponseHeader('Content-type');
		switch (contentType) {
		case 'application/xml':
		case XML:
		case XSL:
			return parseXML(xhr, contentType, onError);
		case TYPE_JSON:
			try {
				return $.JSON.parse(xhr.responseText);
			} catch (e) {
				$.error(e);
			}
			break;
		default:					
			return xhr.responseText;
		}
	};
	
	if (!jet.IO) {
		jet.IO = {};
	}
	if (!jet.IO.jsonCallbacks) {
		jet.IO.jsonCallbacks = [];
	}

	/**
	 * Handles AJAX requests
	 * @class IO
	 * @static
	 */
	$.IO = {
		/**
		 * Makes an ajax request
		 * @method ajax
		 * @param {Hash} settings
		 */
		ajax: function (settings) {
			var xhr = getAjaxObject();
		   
			var success = settings.success,
	
			result = null;
			
			var dataType 		= settings.dataType;
			var timeout			= settings.timeout || 10000; /* Tiempo que tarda en cancelarse la transaccion */
			var method			= settings.method || "GET"; /* Metodo para enviar informacion al servidor */
			var async			= settings.async || true;
			var complete		= settings.complete || function () {};
			var onSuccess		= function () {
				if (success) {
					success.apply($, arguments);
				}
				complete.apply($, arguments);
			};
			var onError			= function (a, b, c) {
				if (settings.error) {
					settings.error(a, b, c);
				}
				complete.apply($, arguments);
			};
			var url = settings.url;
		
			if (xhr) {
				/* Esto corrije el problema de ausencia de tipos mime solo si existe el metodo overrideMimeType (no existe en IE) */
				if (dataType && (dataType === XML || dataType === XSL) && xhr.overrideMimeType) {
					xhr.overrideMimeType('text/xml');
				}
				if (url) {
					if (url.substr(url.length - 1) != "?") {
						url += "?";
					}
					if (settings.data) {
						url += hashToURI(settings.data);
					}
					if (async === true) {
						xhr.onreadystatechange = function () {
							if (xhr.readyState === 4) {
								/* Normalmente deberia chequearse unicamente el status == 200, pero cuando se hace una transaccion local el status en IE termina siendo 0
								 por lo que con revisar que exista la respuesta alcanza */
								if (xhr.status === 404) {
									onError(notFoundError, xhr.status, xhr);
								} else if (xhr.status === 408) {
									onError(timeoutError, xhr.status, xhr);
								} else if (xhr.status === 200 || xhr.responseText || xhr.responseXML) { 
									onSuccess(getResultByContentType(xhr, dataType, onError), xhr);
								} else {
									onError(noStatusError, xhr.status, xhr); 
								}
							}
						};
					}
					/* Cuando la transaccion se hace en un filesystem local y el archivo de destino no existe,
					   no se llega a pasar por el evento onreadystatechange sino que puede lanzar una excepcion en algunos navegadores */
					try {
						xhr.open(method, url, async);
						xhr.send(null);
					} catch (e) {
						onError(noStatusError, 404, xhr); 
					}
					if (async === false) {
						result = getResultByContentType(xhr, dataType, onError);
					} else {
						setTimeout(function () {
							if (xhr.readyState !== 4) {
								xhr.abort();
								onError(timeoutError, 408, xhr);
							}
						}, timeout);
					}
				}
			}
			return result || $;
		},
		jsonp: function (settings) {
			settings = settings || {};
			var jsonCallbackParam = settings.jsonCallbackParam || "p";
			var success = function (result) {
				if (settings.success) {
					settings.success(result);
				}
				if (settings.complete) {
					settings.complete(result);
				}
			};
			var error = function (result) {
				if (settings.error) {
					settings.error(result);
				}
				if (settings.complete) {
					settings.complete(result);
				}
			};
			var callbacks = jet.IO.jsonpCallbacks;
			var index = callbacks.length;
			var loaded = false;
			var url = settings.url;
			if (url) {
				callbacks[index] = function (data) {
					loaded = true;
					success(data);
				};
				if (url.substr(url.length - 1) != "?") {
					url += "?";
				}
				if (settings.data) {
					url += hashToURI(settings.data);
				}
				$.Get.script(url + jsonCallbackParam + "=jet.IO.jsonpCallbacks[" + index + "]");
				setTimeout(function () {
					if (!loaded) {
						error({
							message: "Request failed",
							reason: "Timeout"
						});
					}
				}, settings.timeout || 10000);
			}
		}
	};
	$.add($.IO);
	$.IO.utils = {
		parseXML: parseXML
	};
});/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Base structure for logging
 * @module log
 */
jet().add("log", function ($) {
	
	if (!jet.Log) {
		jet.Log = [];
	}
	
	$.error = function (msg) {
		jet.Log.push(msg);
	};

});/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Node collections and DOM abstraction
 * @module node
 * @requires lang, ua
 */
jet().add("node", function ($) {
	
	var NONE = "none",
		ON = "on",
		Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array,
		AP = Array.prototype,
		SLICE = AP.slice;
	
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
	var addEvent = function (obj, type, callback) {
		if (obj.addEventListener) {
			addEvent = function (obj, type, callback) {
				obj.addEventListener(type, callback, false);
				EventCache.add(obj, type, callback);
			};
		} else if (obj.attachEvent) {
			addEvent = function (obj, type, callback) {
				obj.attachEvent(ON + type, function (ev) {
					ev.target = ev.srcElement;
					ev.preventDefault = function () {
						ev.returnValue = false;
					};
					ev.stopPropagation = function () {
						ev.cancelBubble = true;
					};
					callback.call(event.srcElement, ev);
				});
				EventCache.add(obj, type, callback);
			};
		}
		addEvent(obj, type, callback);
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
	
	
	var TEXT_NODE = 3;
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
		pageSize: function () {
			var win = $.win,
				doc = $.context,
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
		var myself = this;
		if ((myself[0].ownerDocument || myself[0]).body) {
			fn.call(myself);
		} else {
			setTimeout(function () {
				ready(fn);
			}, 13);
		}
		return myself;
	};
	
	/**
	 * A collection of DOM Nodes
	 * @class NodeList
	 * @constructor
	 * @param {Array|DOMCollection|DOMNode} nodes
	 * @param {DOMNode|Document} root
	 */
	var NodeList = function (nodes, root) {
		root = root || $.context;
		nodes = Lang.isValue(nodes) ? nodes : [];
		if (NodeList.is(nodes)) {
			return nodes;
		}
		if (Lang.isString(nodes)) {
			nodes = [root.createElement(nodes)];
		} else if (nodes.nodeType || nodes.body || nodes.navigator) {
			nodes = [nodes];
		} else if (Lang.isArray(nodes)) {
			var i = 0;
			while (i < nodes.length) {
				if (!(nodes[i].nodeType || nodes[i].body || nodes[i].navigator)) {
					nodes.splice(i, 1);
				} else {
					i++;
				}
			}
		} else if (Lang.isNumber(nodes.length)) {
			var tmp = [];
			for (i = 0; i < nodes.length; i++) {
				tmp[i] = nodes[i];
			}
			nodes = tmp;
			//nodes = SLICE.call(nodes);
		} else {
			$.error("Wrong argument for NodeList");
		}
		var i, length = nodes.length;
		for (var i = 0; i < length; i++) {
			this[i] = nodes[i];
		}
		this.length = length;
	};
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
		each: function (fn) {
			var i, myself = this, length = myself.length;
			for (i = 0; i < length; i++) {
				fn.call(myself[i], myself[i], i);
			}
			return myself;
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
			var node = this[0];
			return A.inArray(className, node.className ? node.className.split(" ") : []);
		},
		/**
		 * Removes a number of classes from all nodes in the collection.
		 * Takes multiple string parameters
		 * @method removeClass
		 * @chainable
		 */
		removeClass: function () {
			var args = SLICE.call(arguments);
			return this.each(function (node) {
				A.each(args, function (sClass) {
					node.className = A.remove(sClass, node.className ? node.className.split(" ") : []).join(" ");
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
			var args = SLICE.call(arguments);
			return this.each(function (node) {
				A.each(args, function (sClass) {
					var classes = node.className ? node.className.split(" ") : [];
					if (!A.inArray(sClass, classes)) {
						classes[classes.length] = sClass;
						node.className = classes.join(" ");
					}
				});
			});
		},
		/**
		 * Adds/removes a certain class from all nodes in the collection
		 * @method toggleClass
		 * @param {String} sClass
		 * @chainable
		 */
		toggleClass: function (sClass) {
			return this.each(function (node) {
				var classes = node.className ? node.className.split(" ") : [];
				if (!A.inArray(sClass, classes)) {
					classes[classes.length] = sClass;
				} else {
					A.remove(sClass, classes);
				}
				node.className = classes.join(" ");
			});
		},
		/**
		 * Sets the class name of all nodes in the collection
		 * @method setClass
		 * @param {String} sClass
		 * @chainable
		 */
		setClass: function (sClass) {
			return this.each(function (node) {
				node.className = sClass;
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
		offset: function () {
			var node = this[0];
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
			return this[0].offsetWidth;
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
			return this[0].offsetHeight;
		},
		/**
		 * Returns a new NodeList with all nodes cloned from the current one
		 * @method clone
		 * @param {Boolean} deep If true, all nodes in the brach are cloned. If not, only the ones in the collection
		 * @return {NodeList}
		 */
		clone: function (deep) {
			deep = Lang.isValue(deep) ? deep : true;
			var result = [];
			this.each(function (node) {
				result.push(node.cloneNode(deep));
			});
			return new NodeList(result);
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
			target = $(target)[0];
			return this.each(function (node) {
				target.appendChild(node);
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
			target = $(target)[0];
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
			target = $(target)[0];
			return this.each(function (node) {
				target.parentNode.insertBefore(node, target);
			});
		},
		/**
		 * Returns a new NodeList with all the parents of the current nodes
		 * @method parent
		 * @return {NodeList}
		 */
		parent: function () {
			var result = [];
			this.each(function (node) {
				if (A.indexOf(node.parentNode, result) == -1) {
					result.push(node.parentNode);
				}
			});
			return new NodeList(result);
		},
		/**
		 * Returns a new NodeList with all the first children of the nodes in the collection
		 * @method first
		 * @return {NodeList}
		 */
		first: function () {
			var result = [];
			this.each(function (node) {
				node = $(node).children(0)[0];
				if (node) {
					result.push(node);
				}
			});
			return new NodeList(result);
		},
		/**
		 * Returns a new NodeList with all the next siblings of the nodes in the collection
		 * @method next
		 * @return {NodeList}
		 */
		next: function () {
			var result = [];
			this.each(function (next) {
				do {
					next = next.nextSibling;
				}
				while (next && next.nodeType == TEXT_NODE);
				if (next) {
					result.push(next);
				}
			});
			return new NodeList(result);
		},
		/**
		 * Returns a new NodeList with all the previous siblings of the nodes in the collection
		 * @method previous
		 * @return {NodeList}
		 */
		previous: function () {
			var result = [];
			this.each(function (previous) {
				do {
					previous = previous.previousSibling;
				}
				while (previous && previous.nodeType == TEXT_NODE);
				if (previous) {
					result.push(previous);
				}
			});
			return new NodeList(result);
		},
		/**
		 * Returns a new NodeList with all the last children of the nodes in the collection
		 * @method first
		 * @return {NodeList}
		 */
		last: function () {
			// @TODO: find another solution that doesn't involve iterations
			var result = [];
			this.each(function (node) {
				var children = $(node).children(), i = -1;
				while (children[++i]) {
					node = children[i];
				}
				if (node) {
					result.push(node);
				}
			});
			return new NodeList(result);
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
			}) : this[0].innerHTML;
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
			if (Lang.isHash(key)) {
				attrs = key;
			} else if (Lang.isValue(value)) {
				attrs[key] = value;
			} else {
				return this[0][key];
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
			if (Lang.isHash(key)) {
				css = key;
			} else if (Lang.isValue(value)) {
				css[key] = value;
			} else {
				return $(this[0]).currentStyle()[key];
			}
			return this.each(function (node) {
				Hash.each(css, function (prop, value) {
					if (prop == "opacity" && $.UA.ie) {
						var ieOpacity = Math.ceil(value * 100);
						if ($.UA.ie < 7) {
							node.style["-ms-filter"] = "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + ieOpacity + ")";
						} else {
							node.style.filter = "alpha(opacity=" + ieOpacity + ")";
						}
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
			var result = [];
			this.each(function (node) {
				$(query, node).each(function (subnode) {
					result.push(subnode);
				});
			});
			return new NodeList(result);
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
					if (children[i].nodeType != TEXT_NODE) {
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
		 * @chainable
		 */
		on: function (type, callback) {
			return this.each(function (node) {
				addEvent(node, type, callback);
			});
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
		/**
		 * Returns a new NodeList with all the documents of all the nodes in the collection that are Iframes
		 * @method getDocument
		 * @return {NodeList}
		 */
		getDocument: function () {
			var result = [];
			this.each(function (node) {
				if (node.nodeName == "IFRAME") {
					var doc = node.contentDocument || node.contentWindow.document || node.document || null;
					if (doc) {
						result[result.length] = doc;
					}
				}
			});
			return $(result);
		},
		/**
		 * Returns the computed style of the first node in the collection
		 * @method currentStyle
		 * @return {CSSDeclaration}
		 */
		currentStyle: function () {
			var node = this[0];
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
				if (nodelist instanceof NodeList) {
					nodelist.each(function (node) {
						result.push(node);
					});
				}
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
			return new NodeList(this[nth]);
		}
	};
	NodeList.is = Lang.is;
	

	$.add({

		NodeList: NodeList,
		
		DOM: DOM,
		
		pxToFloat: function (px) {
			return Lang.isNumber(parseFloat(px)) ? parseFloat(px) :
				   Lang.isString(px) ? parseFloat(px.substr(0, px.length - 2)) : px;
		}
	});
	
	addEvent($.win, "unload", EventCache.flush);
});/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Browser sniffing
 * @module ua
 */
jet().add("ua", function ($) {
	/**
	 * Browser sniffing
	 * @class UA
	 * @static
	 */
	$.UA = (function () {
		var nav = $.win.navigator,
			ua = nav.userAgent.toLowerCase(),
        	p = nav.platform.toLowerCase();

		var webkit = /KHTML/.test(ua) || /webkit/i.test(ua),
			opera = /opera/i.test(ua),
			ie = /(msie) ([\w.]+)/.exec(ua);
		
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
			ie: ie && ie[1] && ie[2] ? parseFloat(ie[2]) : false, // ie is false, 6, 7 or 8
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
			mac: p ? /mac/.test(p) : /mac/.test(ua)
		};
    }());
});