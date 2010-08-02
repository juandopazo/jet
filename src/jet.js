(function () {
	var baseUrl = location.protocol + "//jet-js.googlecode.com/svn/trunk/src/";
	
	var win = window,
		doc = document,
		OP = Object.prototype,
		AP = Array.prototype,
		SLICE = AP.slice,
		TOSTRING = OP.toString,
		TRUE = true,
		FALSE = false,
		BASE = "base",
		NODE = "node";
	
	/*
	 * These modules can be called by the jet().use() method without defining a path
	 */
	var predefinedModules = {
		ua: TRUE,
		log: TRUE,
		node: ['log', 'ua'],
		base: [NODE],
		ajax: ['json'],
		json: [NODE],
		cookie: [NODE],
		sizzle: [NODE],
		tabs: [BASE],
		resize: [BASE, {
			name: 'resize-css',
			type: 'css',
			fileName: 'resize',
			beacon: {
				name: 'borderLeftStyle',
				value: 'solid'
			}
		}],
		xsl: [NODE],
		flash: [NODE],
		container: [BASE, {
			name: 'container-css',
			type: 'css',
			fileName: 'container',
			beacon: {
				name: 'borderRightStyle',
				value: 'solid'
			}
		}],
		dragdrop: [BASE],
		imageloader: [BASE],
		anim: [BASE],
		datasource: [BASE, 'ajax'],
		datatable: ['datasource', {
			name: 'datatable-css',
			type: 'css',
			fileName: 'datatable',
			beacon: {
				name: 'borderTopStyle',
				value: 'solid'
			}
		}],
		plasma: ['anim'],
		"simple-progressbar": [NODE]
	};
	
	var ARRAY		= 'array',
		BOOLEAN		= 'boolean',
		FUNCTION	= 'function',
		OBJECT		= 'object',
		HASH		= 'hash',
		NULL		= 'null',
		NUMBER		= 'number',
		STRING		= 'string',
		UNDEFINED	= 'undefined';
		
	var Lang = (function () {
		
		var types = {
			'number'			: NUMBER,
			'string'			: STRING,
			'undefined'			: UNDEFINED,
			'[object Object]'	: HASH,
			'[object Function]' : FUNCTION,
			'[object Array]'	: ARRAY,
			'boolean'           : BOOLEAN
		};
		
		/*
		 * Type function and constants from YUI
		 */
		var type = function (o) {
			return types[typeof o] || types[TOSTRING.call(o)] || (o ? OBJECT : NULL);
		};
		
		return {
			isNumber: function (o) {
				return type(o) === NUMBER && isFinite(o);
			},
			isString: function (o) {
				return type(o) === STRING;
			},
			isArray: function (o) {
				return type(o) === ARRAY;
			},
			isHash: function (o) {
				return type(o) === HASH;
			},
			isFunction: function (o) {
				return type(o) === FUNCTION;
			},
			isBoolean: function (o) {
				return typeof o == BOOLEAN;
			},
			isUndefined: function (o) {
				return typeof o == UNDEFINED;
			},
			type: type,
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
			/**
			 * Returns a string without any leading or trailing whitespace.
			 * Code by Steven Levithan
			 * http://blog.stevenlevithan.com/archives/faster-trim-javascript
			 * 
			 * @static
			 * @param {String} the string to trim
			 * @return {string} the trimmed string
			 */
			trim: function (str) {
				str = str.replace(/^\s\s*/, '');
				var ws = /\s/,
				i = str.length;
				while (ws.test(str.charAt(--i))) {}
				return str.slice(0, i + 1);
			}
		};
	}());
	
	var ArrayHelper = {
		each: function (arr, callback) {
			arr = arr || [];
			var i, length = arr.length;
			for (i = 0; i < length; i++) {
				callback.call(arr[i], arr[i], i);
			}
		},
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
		indexOf: function (needle, haystack) {
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
		 * 
		 * @param {Object} needle
		 * @param {Array} haystack
		 */
		inArray: function (needle, haystack) {
			return this.indexOf(needle, haystack) > -1;
		}
	};
	
	var Hash = (function () {
		var BREAK = "break";
		var each = function (hash, fn) {
			for (var x in hash) {
				if (hash.hasOwnProperty(x)) {
					if (fn.call(hash, x, hash[x]) == BREAK) {
						break;
					}
				}
			}
		};
		
		return {
			each: each,
			BREAK: BREAK,
			keys: function (hash) {
				var keys = [];
				each(hash, function (key) {
					keys[keys.length] = key;
				});
				return keys;
			},
			values: function (hash) {
				var values = [];
				each(hash, function (key, value) {
					values[values.length] = value;
				});
				return values;
			}
		};
	}());
	
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
	
	/*
	 * DOM ready logic copyright jQuery
	 */
	var isReady = FALSE;
	var readyList = [];
	
	var domReady = function (fn, lib) {
		if (isReady) {
			fn.call(doc, lib);
		} else {
			if (Lang.isFunction(fn)) {
				readyList.push({
					fn: fn,
					lib: lib
				});
			}
			if (!doc.body) {
				return setTimeout(domReady, 13);
			}
			isReady = TRUE;
			if (readyList.length) {
				ArrayHelper.each(readyList, function (callback) {
					callback.fn.call(doc, callback.lib);
				});
				readyList = [];
			}
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
	
	/*
	 * Base object for the library.
	 */
	var Core = function () {
		
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
			getByClass(className, root);
		};
		
		var $ = function (query, root) {
			root = root || $.context;
			$.context = root.ownerDocument || $.context;
			if (Lang.isString(query)) {
				query = $.parseQuery(query, root);
				query = !Lang.isValue(query) ? new $.NodeList([]) :
						Lang.isNumber(query.length) ? new $.NodeList(query) : new $.Node(query, root);
			} else if (Lang.isArray(query)) {
				query = new $.NodeList(query, root);
				/* weird way of allowing window and document to be nodes (for using events). Not sure it is a good idea */
			} else if (query.nodeType || query.navigator || query.body) {
				query = new $.Node(query);
			}
			return query;
		};
		
		$.win = win;
		$.context = doc;
		
		if (win.JSON) {
			$.JSON = win.JSON;
		}
		
		var nodeCreation = {
			table: ["thead", "tbody", "tfooter", "tr"],
			tr: ["th", "td"]
		};
		
		$.parseQuery = function (query, root) {
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
		};
		
		var add = function (o) {
			mix($, o, TRUE);
		};
		
		add({
			
			mix: mix,
			
			add: add,
			
			walkTheDOM: walkTheDOM,
			
			Lang: Lang,
			
			"Array": ArrayHelper,
			
			Hash: Hash,
			
			utils: {},
			
			Get: {
				script: loadScript,
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
		
		domReady(function () {
			var trackerDiv = createNode("div", {
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
		 * Global function. Returns an object with 2 methods: use() and add().
		 * See the comments at the beginning for more information on this object and its use. 
		 * 
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
				 */
				use: function () {
					var request = SLICE.call(arguments);
					var i = 0, j, k, module, moveForward;
					while (i < request.length - 1) {
						module = request[i];
						if (Lang.isString(module)) {
							/*if (module == "*") {
								var m = Hash.keys(predef);
								m.unshift(i, 1);
								j = i + 1;
								while (j < request.length) {
									if (Lang.isString(request[j])) {
										request.splice(j, 1);
									} else {
										j++;
									}
								}
								AP.splice.apply(request, m);
								i--;
							}*/
							module = predef[module.toLowerCase()];
							if (module && Lang.isArray(module)) {
								moveForward = 1;
								for (j = module.length - 1; j >= 0; j--) {
									if (!ArrayHelper.inArray(module[j], request)) {
										request.splice(i, 0, module[j]);
										moveForward = 0;
									}
								}
								i += moveForward;
							} else {
								i++;
							}
						} else {
							i++;
						}
					}
					if (win.JSON) {
						ArrayHelper.remove("json", request);
					}
					for (i = 0; i < request.length - 1; i++) {
						module = request[i];
						/*
						 * If a module is a string, it is considered a predefined module.
						 * If it isn't defined, it's probably a mistake and will lead to errors
						 */
						if (Lang.isString(module) && predef[module]) {
							if (Lang.isHash(predef[module])) {
								module = predef[module];
							} else {
								request[i] = module = {
									name: module,
									path: module + (config.minify ? ".min.js" : ".js")
								};
							}
						}
						request[i] = module;
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
					var queue = {
						main: request.pop(),
						req: request
					};
					if (config.onProgress) {
						queue.onProgress = config.onProgress;
					}
					queueList.push(queue);
					update();
				},
				/**
				 * Adds a module to the loaded module list and calls update() to check if a queue is ready to fire
				 * This method must be called from a module to register it
				 * 
				 * @param {String} moduleName
				 * @param {Function} expose
				 */
				add: function (moduleName, expose) {
					modules[moduleName] = expose;
					update();
				}
			};
		};
	}
}());

jet().add('log', function ($) {
	
	$.error = function (msg) {
		throw new Error(msg);
	};

});

jet().add('ua', function ($) {
	$.UA = (function () {
		var nav = $.win.navigator,
			ua = nav.userAgent.toLowerCase(),
        	p = nav.platform.toLowerCase();

		var webkit = /KHTML/.test(ua) || /webkit/i.test(ua),
			opera = /opera/i.test(ua),
			ie = /(msie) ([\w.]+)/.exec(ua);
		
        return {
			webkit: webkit,
			chrome:  /chrome/i.test(ua),
			ie: ie && ie[1] && ie[2] ? parseFloat(ie[2]) : false,
			opera: opera,
			gecko: !webkit && !opera && !ie && /Gecko/i.test(ua),
			win: p ? /win/.test(p) : /win/.test(ua), 
			mac: p ? /mac/.test(p) : /mac/.test(ua)
		};
    }());
});

jet().add('node', function ($) {
	
	var TRUE = true,
		FALSE = false,
		NONE = "none",
		ON = "on",
		Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;
		
	var EventCache = (function () {
		var cache = {};
		
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
			add: function (obj, type, fn) {
				if (obj.nodeType) {
					var c = getCache(type);
					c[c.length] = {
						obj: obj,
						fn: fn
					};
				}
			},
			remove: function (obj, type, fn) {
				A.remove(getCache(type), {
					obj: obj,
					fn: fn
				});
			},
			clear: clear,
			flush: function () {
				for (var o in cache) {
					if (cache.hasOwnProperty(o)) {
						clear(o);
					}
				}
			}
		};
	}());
	
	var addEvent = function (obj, type, callback) {
		if (obj.addEventListener) {
			addEvent = function (obj, type, callback) {
				obj.addEventListener(type, callback, FALSE);
				EventCache.add(obj, type, callback);
			};
		} else if (obj.attachEvent) {
			addEvent = function (obj, type, callback) {
				obj.attachEvent(ON + type, function () {
					var ev = window.event;
					ev.target = ev.srcElement;
					ev.preventDefault = function () {
						ev.returnValue = FALSE;
					};
					ev.stopPropagation = function () {
						ev.cancelBubble = TRUE;
					};
					callback.call(event.srcElement, ev);
				});
				EventCache.add(obj, type, callback);
			};
		}
		addEvent(obj, type, callback);
	};
	
	var removeEvent = function (obj, type, callback) {
		if (obj.removeEventListener) {
			removeEvent = function (obj, type, callback) {
				obj.removeEventListener(type, callback, FALSE);
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
		
	var NodeList;
	
	var Node = function (node, root) {
		root = root || $.context;
		if (Lang.isNode(node)) {
			return node;
		}
		if (Lang.isString(node)) {
			node = root.createElement(node);
		} else if (!node.nodeType && node != $.win) {
			$.error("Node must receive either a node name or a DOM node");
		}
		
		this._node = node;
	};
	
	Lang.isNode = function (o) {
		return o instanceof Node;
	};
	$.mix(Node.prototype, {
		hide: function () {
			var myself = this;
			var node = myself._node;
			var display = node.style.display;
			if (!node.JET_oDisplay && display != NONE) {
				node.JET_oDisplay = display;
			}
			node.style.display = NONE;
			return myself;
		},
		show: function () {
			var myself = this;
			var node = myself._node;
			node.style.display = node.JET_oDisplay || "";
			return myself;
		},
		toggle: function () {
			var myself = this;
			var node = myself._node;
			var ns = node.style;
			var oDisplay = node.LIB_oDisplay;
			ns.display = ns.display != NONE ? NONE :
						oDisplay ? oDisplay :
						"";
			return myself;
		},
		hasClass: function (sClass) {
			var node = this._node;
			return A.inArray(sClass, node.className ? node.className.split(" ") : []);
		},
		removeClass: function () {
			var myself = this;
			var node = myself._node;
			A.each(arguments, function (sClass) {
				node.className = A.remove(sClass, node.className ? node.className.split(" ") : []).join(" ");
			});
			return myself;
		},
		addClass: function () {
			var myself = this;
			var node = myself._node;
			A.each(arguments, function (sClass) {
				var classes = node.className ? node.className.split(" ") : [];
				if (!A.inArray(sClass, classes)) {
					classes[classes.length] = sClass;
					node.className = classes.join(" ");
				}
			});
			return myself;
		},
		toggleClass: function (sClass) {
			var myself = this;
			var node = myself._node;
			var classes = node.className ? node.className.split(" ") : [];
			if (!A.inArray(sClass, classes)) {
				classes[classes.length] = sClass;
			} else {
				A.remove(sClass, classes);
			}
			node.className = classes.join(" ");
			return myself;
		},
		setClass: function (sClass) {
			this._node.className = sClass;
			return this;
		},
		scrollLeft: function (value) {
			if (Lang.isValue(value)) {
				$.win.scrollTo(value, this.scrollTop());
			} else {
				var doc = $.context;
				var dv = doc.defaultView;
		        return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, (dv) ? dv.pageXOffset : 0);
			}
		},
		scrollTop: function (value) {
			if (Lang.isValue(value)) {
				$.win.scrollTo(this.scrollTop(), value);
			} else {
				var doc = $.context;
				var dv = doc.defaultView;
		        return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, (dv) ? dv.pageYOffset : 0);
			}
		},
		offset: function () {
			var node = this._node;
			var offset = {
				left: 0,
				top: 0,
				width: node.offsetWidth,
				height: node.offsetHeight
			};
			var doc = node.ownerDocument;
			if (node && doc) {
				if (node.getBoundingClientRect) {
					/*
					 * getBoundingClientRect implementation from jQuery
					 */
					var box  = node.getBoundingClientRect();
					var body = doc.body;
					var de = doc[DOCUMENT_ELEMENT];
					offset.left = box.left + this.scrollLeft() - (de.clientLeft || body.clientLeft || 0);
					offset.top = box.top + this.scrollTop() - (de.clientTop || body.clientTop || 0);
				} else if (node.offsetParent) {
					/*
					 * Not interested in supporting other browsers very well
					 */
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
		width: function (width) {
			var myself = this;
			var node = myself._node;
			if (Lang.isValue(width)) {
				node.style.width = Lang.isString(width) ? width : width + "px";
				return myself;
			}
			return node.offsetWidth;
		},
		height: function (height) {
			var myself = this;
			var node = myself._node;
			if (Lang.isValue(height)) {
				node.style.height = Lang.isString(height) ? height : height + "px";
				return myself;
			}
			return node.offsetWidth;
		},
		clone: function (deep) {
			deep = Lang.isValue(deep) ? deep : TRUE;
			return new Node(this._node.cloneNode(deep));
		},
		append: function (node) {
			if (node._node) {
				node = node._node;
			}
			this._node.appendChild(node);
			return this;
		},
		appendTo: function (target) {
			if (target._node) {
				target = target._node;
			}
			target.appendChild(this._node);
			return this;
		},
		prepend: function (node) {
			if (Lang.isNode(node)) {
				node = node._node;
			}
			var mynode = this._node;
			if (mynode.firstChild) {
				mynode.insertBefore(node, mynode.firstChild);
			} else {
				mynode.appendChild(node);
			}
			return this;
		},
		prependTo: function (target) {
			if (Lang.isNode(target)) {
				target = target._node;
			}
			var node = this._node;
			if (target.firstChild) {
				target.insertBefore(node, target.firstChild);
			} else {
				target.appendChild(node);
			}
			return this;
		},
		insertBefore: function (before) {
			if (Lang.isNode(before)) {
				before = before._node;
			}
			if (before.parentNode) {
				before.parentNode.insertBefore(this._node, before);
			}
			return this;
		},
		parent: function () {
			return new Node(this._node.parentNode);
		},
		first: function () {
			return new Node(this.children()._nodes.shift());
		},
		next: function () {
			var next = this._node;
			do {
				next = next.nextSibling;
			}
			while (next && next.nodeType == TEXT_NODE);
			return next ? new Node(next) : null;
		},
		previous: function () {
			var previous = this._node;
			do {
				previous = previous.previousSibling;
			}
			while (previous && previous.nodeType == TEXT_NODE);
			return previous ? new Node(previous) : null;
		},
		last: function () {
			return new Node(this.children()._nodes.pop());
		},
		html: function (html) {
			if (Lang.isValue(html)) {
				this._node.innerHTML = html;
				return this;
			} else {
				return this._node.innerHTML;
			}
		},
		attr: function (key, value) {
			key = key || {};
			var node = this._node;
			var attrs = {};
			if (Lang.isHash(key)) {
				attrs = key;
			} else if (Lang.isValue(value)) {
				attrs[key] = value;
			} else {
				return node[key];
			}
			Hash.each(attrs, function (name, val) {
				node[name] = val;
			});
			return this;
		},
		css: function (key, value) {
			var myself = this;
			var node = myself._node;
			var css = {};
			if (Lang.isHash(key)) {
				css = key;
			} else if (Lang.isValue(value)) {
				css[key] = value;
			} else {
				return this._node.style[key];
			}
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
			return myself;
		},
		find: function (query) {
			return $(query, this._node);
		},
		children: function (filter) {
			filter = !Lang.isValue(filter) ? FALSE :
					  Lang.isString(filter) ? filter.toUpperCase() : filter;
			var result = [];
			var myself = this;
			var node = myself._node;
			var children = node.childNodes;
			var newChildren = [];
			var length = children.length;
			for (var i = 0; i < length; i++) {
				if (children[i].nodeType != TEXT_NODE) {
					newChildren[newChildren.length] = children[i];
				}
			}
			if (filter !== FALSE) {
				length = newChildren.length;
				for (i = 0; i < length; i++) {
					if (i == filter || newChildren[i].nodeName == filter) {
						result[result.length] = newChildren[i];
					}
				}
			} else {
				result.push.apply(result, newChildren);
			}
			return new NodeList(result);
		},
		on: function (type, callback) {
			addEvent(this._node, type, callback);
			return this;
		},
		unbind: function (type, callback) {
			removeEvent(this._node, type, callback);
			return this;
		},
		unbindAll: function (crawl) {
			var node = this._node;
			if (crawl) {
				$.walkTheDOM(node, EventCache.clear);
			} else {
				EventCache.clear(node);
			}
			return this;
		},
		remove: function (keepEvents) {
			var node = this._node;
			if (!keepEvents) {
				$.walkTheDOM(node, EventCache.clear);
			}
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
			return this;
		},
		getDocument: function () {
			var node = this._node;
			if (node.nodeName == "IFRAME") {
				return new Node(node.contentDocument ||
								node.contentWindow.document ||
								node.document ||
								null);
			}
			return null;
		},
		currentStyle: function () {
			var node = this._node;
			return $.win[GET_COMPUTED_STYLE] ? $.win[GET_COMPUTED_STYLE](node, null) : 
					node[CURRENT_STYLE] ? node[CURRENT_STYLE] : node.style;
		}
	});
	
	NodeList = function () {
		var collection = [];
		var addToCollection = function (node) {
			if (Lang.isNode(node)) {
				collection[collection.length] = node;
			} else if (node.nodeType || Lang.isString(node)) {
				collection[collection.length] = new Node(node);
			}
		};
		A.each(arguments, function (node) {
			if (node.length) {
				A.each(node, addToCollection);
			} else {
				addToCollection(node);
			}
		});
		
		this._nodes = collection;
		var _DOMNodes = [];
		A.each(collection, function (node) {
			_DOMNodes[_DOMNodes.length] = node._node;
		});
		this._DOMNodes = _DOMNodes;
	};
	var NodeListP = NodeList.prototype;
	$.mix(NodeListP, {
		each: function (callback) {
			var nodes = this._nodes;
			var length = nodes.length;
			for (var i = 0; i < length; i++) {
				callback.call(nodes[i], nodes[i], i);
			}
			return this;
		},
		eq: function (index) {
			return this._nodes[index];
		},
		notEq: function (index) {
			var nodes = Lang.clone(this._nodes);
			nodes.splice(index, 1);
			return new NodeList(nodes);
		},
		link: function (nodes, createNewList) {
			var myself = this;
			if (Lang.isNodeList(nodes)) {
				nodes = nodes._nodes;
			} else if (Lang.isNode(nodes)) {
				nodes = [nodes];
			} else if (nodes.nodeType) {
				nodes = [new Node(nodes)];
			}
			if (createNewList) {
				return new NodeList(myself._nodes.concat(nodes));
			} else {
				myself._nodes = myself._nodes.concat(nodes);
				return myself;
			}
		}
	});
	
	Lang.isNodeList = function (o) {
		return o instanceof NodeList;
	};
	
	NodeList.addSetter = function (name) {
		NodeListP[name] = function () {
			var args = arguments;
			return this.each(function (node) {
				node[name].apply(node, args);
			});
		};
	};
	A.each(['append', 'appendTo', 'preprend', 'prependTo', 'insertBefore', 'remove', 
			'on', 'unbind', 'unbindAll', 
			'addClass', 'removeClass', 'toggleClass', 
			'hide', 'show', 'toggle'], NodeList.addSetter);
			
	NodeList.addGetter = function (name) {
		NodeListP[name] = function () {
			var args = arguments;
			var results = [];
			this.each(function (node) {
				results[results.length] = node[name].apply(node, args);
			});
			return results;
		};
	};
	A.each(['hasClass', 'offset', 'getDocument', 'currentStyle'], NodeList.addGetter);
	
	NodeList.addListGetter = function (name) {
		NodeListP[name] = function () {
			var args = arguments;
			var results = [];
			this.each(function (node) {
				A.each(node[name].apply(node, args), function (found) {
					if (!A.inArray(found._node, results)) {
						results[results.length] = found._node;
					}
				});
			});
			return new NodeList(results);
		};
	};
	A.each(['children', 'first', 'last', 'parent', 'find', 'clone'], NodeList.addListGetter);
	
	NodeList.addMixed = function (name) {
		NodeListP[name] = function () {
			var myself = this;
			var args = arguments;
			if (args.length === 0) {
				var results = [];
				myself.each(function (node) {
					results[results.length] = node[name]();
				});
				return results;
			} else {
				return myself.each(function (node) {
					node[name].apply(node, args);
				});
			}
		};
	};
	A.each(['html', 'css', 'attr', 'widt', 'height'], NodeList.addMixed);

	$.add({
		Node: Node,
		NodeList: NodeList,
		
		getWindowFromDocument: function (doc) {
			doc = doc || $.context;
			return doc.defaultView || doc.parentWindow || $.win;
		},
		
		screenSize: function () {
			var doc = $.context,
				de = doc.documentElement,
				db = doc.body;
			return {
				height: de.clientHeight || $.win.innerHeight || db.clientHeight,
				width: de.clientWidth || $.win.innerWidth || db.clientWidth
			};
		},
		
		pxToFloat: function (px) {
			return Lang.isNumber(parseFloat(px)) ? parseFloat(px) :
				   Lang.isString(px) ? parseFloat(px.substr(0, px.length - 2)) : px;
		}
	});
	
	addEvent($.win, "unload", EventCache.flush);
});