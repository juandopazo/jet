/*
 * MODULE LOADER
 * 25/06/2010
 * Based on YUI3's namespace
 * 
 * This script allows to load different modules asynchronously and to reuse
 * them when they were already loaded. Its basic use looks like:
 * 
 * jet().use("node", function ($) {
 *	 //do something with $
 * });
 * 
 * This snippet will load the Node module, and when it finishes loading it'll execute
 * the function. Each module must call the jet().add() method to tell the loader
 * it has finished loading:
 * 
 * jet().add("node", function ($) {
 *	 $.method = function () {};
 * });
 * 
 * A variable is passed to every module and the function defined in the use() method. 
 * This variable acts as a main library and is shared by each module and the main
 * function, but not between different calls to the "use" method. Ie:
 * 
 * jet().use("node", function ($) {
 *	 $.testProperty = "test";
 * });
 * 
 * jet().use("node", function ($) {
 *	 alert($.testProperty); //alerts "undefined"
 * });
 * 
 * Since it is a parameter, it can have any name but it still acts the same way. Also,
 * each module is called in the order defined by the "use" method. So:
 * 
 * jet().use("node", "anim", function (L) {
 *	 // Here the L variable contains both Node and Anim
 *	 // The Node module is called first on L and the Anim module after,
 *	 // so it can overwrite anything Node did, extend classes, etc
 * });
 * 
 * New modules can be defined by passing an object literal instead of a string to the
 * "use" method with a "name" property and a "path" or "fullpath" property. 
 * 
 * jet().use("node", {name:"myModule", fullpath:"http://localhost/myModule.js"}, function ($) {
 *	 //do something
 * });
 * 
 * If "path" is defined instead of "fullpath", the loader will append "path"
 * to a predefined base URL. This base URL can be modified by passing
 * the jet() function an object literal with a "base" property:
 * 
 *  jet({
 *	  base: "http://www.mydomain.com/modules/"
 *  }).use("node", function ($) {
 *	  //in this case the "core" module is loaded from http://www.mydomain.com/modules/node.min.js
 *  });
 * 
 * Other configuration options:
 * - minify {Boolean} defines whether predefined modules should be minified or not. TRUE by default
 * - loadCss {Boolean} if TRUE, css modules are loaded. TRUE by default
 * - modules {Array} allows to define your own modules. Currently the same as using object literals in the use() method
 * 
 */
(function () {
	var baseUrl = location.protocol + "//jet-js.googlecode.com/svn/trunk/src/";
	
	var win = window,
		doc = document,
		OP = Object.prototype,
		AP = Array.prototype,
		SP = String.prototype,
		SLICE = AP.slice,
		TOSTRING = OP.toString,
		TRUE = true,
		FALSE = false,
		BASE = "base",
		NODE = "node";
	
	/*
	 * These modules can be called by the jet().use() method without defining a path.
	 * Each module should be defined after its requirements
	 */
	var predefinedModules = {
		ua: TRUE,
		log: TRUE,
		node: ["log", "ua"],
		xsl: [NODE],
		flash: [NODE],
		"simple-progressbar": [NODE],
		json: [NODE],
		cookie: [NODE],
		sizzle: [NODE],
		base: [NODE],
		ajax: ["json"],
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
		datasource: [BASE, "ajax"],
		datatable: ["datasource", {
			name: "datatable-css",
			type: "css",
			fileName: "datatable",
			beacon: {
				name: "borderTopStyle",
				value: "solid"
			}
		}],
		plasma: ["anim"]
	};
	
	/**
	 * Includes Lang, ArrayHelper and Hash.
	 * @module lang
	 */
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
		    return /^\s*function[^{]+{\s*\[native code\]\s*}\s*$"/.test(func);
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
					return FALSE;
				case BOOLEAN:
					return TRUE;
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
	 * @class Array
	 * @static
	 */
	var ArrayHelper = {
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
	 * @class Hash
	 * @static
	 */
	var Hash = {
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
					if (fn.call(thisp || hash, x, hash[x], hash) === FALSE) {
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
			asyng: TRUE,
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

	/**
	 * @module core
	 */
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
			mix($, o, TRUE);
		};
		
		if (win.JSON) {
			$.JSON = win.JSON;
		}
			
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
		 * From the guys at YUI (Thanks! This function is GENIUS!)
	     * 
	     * Utility to set up the prototype, constructor and superclass properties to
	     * support an inheritance strategy that can chain constructors and methods.
	     * Static members will not be inherited.
	     *
	     * @method extend
	     * @param {Function} r	the object to modify
	     * @param {Function} s	the object to inherit
	     * @param {Object} [px]	prototype properties to add/override
	     * @param {Object} [sx]	static properties to add/override
	     */
	    var extend = function (r, s, px) {
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
	
	    };
		
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
			 * Doesn't overwrite properties unless the overwrite parameter is TRUE
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
			
			extend: extend,
			
			walkTheDOM: walkTheDOM,
			
			Lang: Lang,
			
			"Array": ArrayHelper,
			
			Hash: Hash,
			
			utils: {},
			
			/**
			 * Loads scripts and CSS files.
			 * Included with the jet() core
			 * @module get
			 */
			/**
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
		 * Main namespace. Handles loading of modules
		 * @module loader
		 */
		/**
		 * @class Loader
		 */
		/**
		 * Global function. Returns an object with 2 methods: use() and add().
		 * See the comments at the beginning for more information on this object and its use. 
		 * @method jet
		 * @param {Object} config
		 */
		win.jet = function (config) {
			config = config || {};
			var base = baseUrl;
			if (config.base) {
				base = config.base;
				base = base.substr(base.length - 1, 1) == "/" ? base : base + "/";
			}
			config.minify = Lang.isBoolean(config.minify) ? config.minify : FALSE;
			config.loadCss = Lang.isBoolean(config.loadCss) ? config.loadCss : TRUE;
			var predef = mix(clone(predefinedModules), config.modules || {}, TRUE);
			
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
					} else if (ArrayHelper.indexOf("ajax", request) == -1) {
						request.unshift("ajax");
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
						} else if (!(modules[module.name] || queuedScripts[module.name])) {
							if (!module.type || module.type == "js") {
								loadScript(module.fullpath || (base + module.path)); 
							} else if (module.type == "css") {
								domReady(loadCssModule, module);
							}
							queuedScripts[module.name] = 1;
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
}());