(function () {
	var baseUrl = location.protocol + "//jet.googlecode.com/svn/trunk/src/";
	
	var win = window,
		doc = document,
		nav = navigator,
		OP = Object.prototype,
		SLICE = Array.prototype.slice,
		TOSTRING = OP.toString,
		TRUE = true,
		FALSE = false,
		BASE = "base";
	
	/*
	 * These modules can be called by the jet().use() method without defining a path
	 */
	var predefinedModules = {
		dom: TRUE,
		base: TRUE,
		ajax: ['json'],
		json: TRUE,
		cookie: TRUE,
		forms: TRUE,
		sizzle: TRUE,
		tabs: [BASE],
		resize: [BASE/*, {
			name: 'resize-css',
			type: 'css',
			path: 'resize.css',
			beacon: {
				name: 'borderLeftStyle',
				value: 'solid'
			}
		}*/],
		xsl: TRUE,
		flash: TRUE,
		container: [BASE/*, {
			name: 'container-css',
			type: 'css',
			path: 'container.css',
			beacon: {
				name: 'borderRightStyle',
				value: 'solid'
			}
		}*/],
		dragdrop: [BASE],
		imageloader: [BASE],
		anim: [BASE],
		datasource: [BASE],
		datatable: ['datasource']
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
	var loadScript = function (url) {
		head.appendChild(createNode("script", {
			type: "text/javascript",
			asyng: TRUE,
			src: url
		}));
	};
	
	var loadCSS = function (url) {
		head.appendChild(createNode("link", {
			type: "text/css",
			rel: "stylesheet",
			href: url
		}));
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
			
	var NONE = "none",
		ON = "on";
		
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
				ArrayHelper.remove(getCache(type), {
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
	
	/*
	 * Base object for the library.
	 */
	var Core = function () {
		var $;
		
		var NodeList = function (collection, doc) {
			if (Lang.isString(collection)) {
				collection = $(collection, doc).getNode();
			}
			if (!Lang.isArray(collection) && !collection.length) {
				collection = [collection];
			}
			
			var mySelf = this;
			
			mySelf.each = function (callback) {
				var collecLength = collection.length;
				for (var i = 0; i < collecLength; i++) {
					callback.call(collection[i], collection[i], i);
				}
				return mySelf;
			};
			
			mySelf.getNodes = function () {
				return collection;
			};
			
			mySelf.getNode = function () {
				return collection[0];
			};
		};
		
		$ = function (query, root) {
			if (root) {
				$.context = root;
				$.win = doc.defaultView || doc.parentWindow;
			}
			if (Lang.isString(query)) {
				query = $.parseQuery(query, $.context);
			}
			if (Lang.isArray(query)) {
				var i = 0;
				while (i < query.length) {
					if (query[i] instanceof NodeList) {
						query.push.apply(query, query[i].getNodes());
					}
					if (!query[i].nodeType) {
						query.splice(i, 1);
					} else {
						i++;
					}
				}
			}
			if (!(query instanceof NodeList)) {
				query = new NodeList(query);
			}
			return query;
		};
		
		$.win = win;
		$.context = doc;
		
		if (win.JSON) {
			$.JSON = win.JSON;
		}
		
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
						if (c) {
							if (ArrayHelper.indexOf(className, c.split(" "))) {
								result[result.length] = node;
							}
						}
					});
					return result;
				};
			}
			getByClass(className, root);
		};
		
		$.readyList = [];
		$.domReady = {};
		
		$.parseQuery = function (query, root) {
			root = root || $.context;
			var c = query.substr(0, 1);
			if (c == "<") {
				var tmpDiv = root.createElement("div");
				tmpDiv.innerHTML = query;
				return $(tmpDiv).first().getNode();
			} else {
				return c == "#" ? root.getElementById(query.substr(1)) : 
					   c == "." ? getByClass(query.substr(1), root) :
					   root.getElementsByTagName(query);
			}
		};
		
		var pxToFloat = function (px) {
			return Lang.isNumber(parseFloat(px)) ? parseFloat(px) :
				   Lang.isString(px) ? parseFloat(px.substr(0, px.length - 2)) : px;
		};
		
		var isNodeList = function (candidate) {
			return candidate instanceof NodeList;
		};
		
		var DOCUMENT_ELEMENT = "documentElement",
			DEFAULT_VIEW	= "defaultView";
		
		var GET_COMPUTED_STYLE = "getComputedStyle",
			CURRENT_STYLE = "currentStyle";
			
		var LEFT = "left",
			RIGHT = "right",
			TOP = "top",
			BOTTOM = "bottom";
			
		var AUTO = "auto";
			
		var TEXT_NODE = 3;
		
		NodeList.prototype = {
			constructor: NodeList,
			hide: function () {
				return this.each(function (node) {
					var display = node.style.display;
					if (!node.LIB_oDisplay && display != NONE) {
						node.LIB_oDisplay = display;
					}
					node.style.display = NONE;
				});
			},
			show: function () {
				return this.each(function (node) {
					node.style.display = node.LIB_oDisplay || "";
				});
			},
			toggle: function () {
				return this.each(function (node) {
					var ns = node.style;
					var oDisplay = node.LIB_oDisplay;
					ns.display = ns.display != NONE ? NONE :
								oDisplay ? oDisplay :
								"";
				});
			},
			hasClass: function (sClass) {
				var node = this.getNode();
				return ArrayHelper.inArray(sClass, node.className ? node.className.split(" ") : []);
			},
			removeClass: function () {
				var args = arguments;
				return this.each(function (node) {
					ArrayHelper.each(args, function (sClass) {
						node.className = ArrayHelper.remove(sClass, node.className ? node.className.split(" ") : []).join(" ");
					});
				});
			},
			addClass: function () {
				var args = arguments;
				return this.each(function (node) {
					ArrayHelper.each(args, function (sClass) {
						var classes = node.className ? node.className.split(" ") : [];
						if (!ArrayHelper.inArray(sClass, classes)) {
							classes[classes.length] = sClass;
							node.className = classes.join(" ");
						}
					});
				});
			},
			toggleClass: function (sClass) {
				return this.each(function (node) {
					var classes = node.className ? node.className.split(" ") : [];
					if (!ArrayHelper.inArray(sClass, classes)) {
						classes[classes.length] = sClass;
					} else {
						ArrayHelper.remove(sClass, classes);
					}
					node.className = classes.join(" ");
				});
			},
			setClass: function (sClass) {
				return this.each(function (node) {
					node.className = sClass;
				});
			},
			scrollLeft: function () {
				var node = this.getNode();
				var doc = !node ? $.context :
						  node.ownerDocument ? node.ownerDocument : node;
				var dv = doc[DEFAULT_VIEW];
				return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, (dv) ? dv.pageXOffset : 0);
			},
			scrollTop: function () {
				var node = this.getNode();
				var doc = !node ? $.context :
						  node.ownerDocument ? node.ownerDocument : node;
				var dv = doc[DEFAULT_VIEW];
				return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, (dv) ? dv.pageYOffset : 0);
			},
			offset: function () {
				var node = this.getNode();
				var offset = {
					left: 0,
					top: 0,
					width: node.offsetWidth,
					height: node.offsetHeight
				};
				var doc = node.ownerDocument;
				if (node) {
					if (node.getBoundingClientRect) {
						var box  = node.getBoundingClientRect();
						var body = doc.body;
						var de = doc[DOCUMENT_ELEMENT];
						offset.left = box.left + this.scrollLeft() - de.clientLeft || body.clientLeft || 0;
						offset.top = box.top + this.scrollTop() - de.clientTop || body.clientTop || 0;
					} else if (node.offsetParent) {
						do {
							offset.left += node.offsetLeft;
							offset.top += node.offsetTop;
							node = node.offsetParent;
						} while (node);
					}
				}
				return offset;
			},
			offsetLeft: function () {
				return this.offset().left;
			},
			offsetTop: function () {
				return this.offset().top;
			},
			width: function (width) {
				if (Lang.isValue(width)) {
					width = Lang.isString(width) ? width : width + "px";
					return this.each(function (node) {
						node.style.width = width;
					});
				}
				return this.getNode().offsetWidth;
			},
			height: function (height) {
				return Lang.isValue(height) ? this.each(function (node) {
						node.style.height = Lang.isString(height) ? height : height + "px";
					}) : this.getNode().offsetHeight;
			},
			clip: function (clipping) {
				if (!clipping) {
					clipping = this.getNode().style.clip;
					clipping = clipping.substr(5, clipping.length - 1);
					clipping = clipping.split(",");
					return {
						top:	clipping[0] == AUTO ? clipping[0] : pxToFloat(clipping[0]),
						right:	clipping[1] == AUTO ? clipping[1] : pxToFloat(clipping[1]),
						bottom:	clipping[2] == AUTO ? clipping[2] : pxToFloat(clipping[2]),
						left:	clipping[3] == AUTO ? clipping[3] : pxToFloat(clipping[3])
					};
				} else {
					ArrayHelper.each([TOP, RIGHT, BOTTOM, LEFT], function (name) {
						clipping[name] = Lang.isValue(clipping[name]) ? clipping[name] : AUTO;
						if (Lang.isNumber(clipping[name])) {
							clipping[name] = clipping[name] + "px";
						}
					});
					clipping = "rect(" + [clipping[TOP], clipping[RIGHT], clipping[BOTTOM], clipping[LEFT]].join(",") + ")";
					return this.each(function (node) {
						node.style.clip = clipping;
					});
				}
			},
			clone: function (deep) {
				deep = deep || TRUE;
				var result = [];
				this.each(function (node) {
					result[result.length] = node.cloneNode(deep);
				});
				return new NodeList(result);
			},
			appendTo: function (target) {
				var myself = this;
				if (target.nodeType) {
					myself.each(function (node) {
						target.appendChild(node);
					});
				} else if (isNodeList(target)) {
					myself.each(function (node) {
						target.each(function (subnode) {
							subnode.appendChild(node);
						});
					});
				}
				return myself;
			},
			prependTo: function (target) {
				var myself = this;
				if (target.nodeType) {
					myself.each(function (node) {
						if (target.firstChild) {
							target.insertBefore(node, target.firstChild);
						} else {
							target.appendChild(node);
						}
					});
				} else if (isNodeList(target)) {
					myself.each(function (node) {
						target.each(function (subnode) {
							if (subnode.firstChild) {
								subnode.insertBefore(node, subnode.firstChild);
							} else {
								subnode.appendChild(node);
							}
						});
					});
				}
				return myself;
			},
			append: function (nodes) {
				if (nodes.nodeType) {
					this.each(function (node) {
						node.appendChild(nodes);
					});
				} else if (isNodeList(nodes)) {
					this.each(function (node) {
						nodes.each(function (subnode, i) {
							node.appendChild(i === 0 ? subnode : subnode.cloneNode(TRUE));
						});
					});
				} else if (Lang.isString(nodes)) {
					this.each(function (node) {
						node.appendChild($.context.createTextNode(nodes));
					});
				}
				return this;
			},
			insertBefore: function (before) {
				before = $(before);
				return this.each(function (node) {
					before.each(function (subnode) {
						subnode.parentNode.insertBefore(node, subnode);
					});
				});
			},
			prepend: function (nodes) {
				nodes = $(nodes);
				return this.each(function (node) {
					if (node.firstChild) {
						nodes.insertBefore(node.firstChild);
					} else {
						nodes.appendTo(node);
					}
				});	
			},
			parent: function () {
				var result = [];
				this.each(function (node) {
					node = node.parentNode;
					if (node && !ArrayHelper.inArray(node, result)) {
						result[result.length] = node;
					}
				});
				return new NodeList(result);
			},
			first: function () {
				var result = [];
				this.each(function (node) {
					result[result.length] = $(this).children().getNodes().shift();
				});
				return new NodeList(result);
			},
			last: function () {
				var result = [];
				this.each(function (node) {
					result[result.length] = $(this).children().getNodes().pop();
				});
				return new NodeList(result);
			},
			html: function (html) {
				return this.each(function (node) {
					node.innerHTML = html;
				});
			},
			attr: function (key, value) {
				var attrs = {};
				if (Lang.isHash(key)) {
					attrs = key;
				} else if (Lang.isValue(value)) {
					attrs[key] = value;
				} else {
					return this.getNode()[key];
				}
				return this.each(function (node) {
					Hash.each(attrs, function (name, val) {
						node[name] = val;
					});
				});
			},
			css: function (key, value) {
				var css = {};
				if (Lang.isHash(key)) {
					css = key;
				} else if (Lang.isValue(value)) {
					css[key] = value;
				} else {
					return this.getNode().style[key];
				}
				return this.each(function (node) {
					Hash.each(css, function (prop, value) {
						if (prop == "opacity") {
							node.style[prop] = value;
							if ($.UA.ie < 7) {
								var ieOpacity = Math.ceil(value * 100);
								node.style["-ms-filter"] = "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + ieOpacity + ")";
							} else {
								node.style.filter = "alpha(opacity=" + ieOpacity + ")";
							}
						} else {
							if (Lang.isNumber(value) && prop != "zIndex" && prop != "zoom") {
								value += "px";
							}
							node.style[prop] = value;
						}
					});
				});
			},
			find: function (query) {
				var result = [];
				this.each(function (node) {
					result.push.apply(result, $(query, node).getNodes());
				});
				return new NodeList(result);
			},
			children: function (filter) {
				filter = !Lang.isValue(filter) ? FALSE :
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
				});
				return new NodeList(result);
			},
			eq: function (index) {
				return new NodeList(this.getNodes()[index]);
			},
			notEq: function (index) {
				return new NodeList(this.getNodes().slice(0, index).slice(1));
			},
			on: function (type, callback) {
				return this.each(function (node) {
					addEvent(node, type, callback);
				});
			},
			unbind: function (type, callback) {
				return this.each(function (node) {
					removeEvent(node, type, callback);
				});
			},
			unbindAll: function (crawl) {
				return this.each(function (node) {
					if (crawl) {
						$.walkTheDOM(node, EventCache.clear);
					} else {
						EventCache.clear(node);
					}
				});
			},
			remove: function (keepEvents) {
				return this.each(function (node) {
					if (!keepEvents) {
						$.walkTheDOM(node, EventCache.clear);
					}
					node.parentNode.removeChild(node);
				});
			},
			getDocument: function () {
				var result = [];
				this.each(function (node) {
					if (node.nodeName == "IFRAME") {
						result[result.length] = node.contentDocument ||
															node.contentWindow.document ||
															node.document ||
															null;
					}
				});
				return new NodeList(result);
			},
			currentStyle: function () {
				var node = this.getNode();
				return $.win[GET_COMPUTED_STYLE] ? $.win[GET_COMPUTED_STYLE](node, null) : 
						node[CURRENT_STYLE] ? node[CURRENT_STYLE] : node.style;
			},
			ready: function (callback) {
				var that = this;
				/*
				 * Based on jQuery's ready() method
				 */
				return this.each(function (node) {
					var root = node.ownerDocument;
					var fn, i = 0;
					if (!$.domReady[root]) {
						if (callback) {
							$.readyList[$.readyList.length] = {
								fn: callback,
								obj: node
							};
						}
						if (!root.body) {
							setTimeout(that.ready, 13);
						} else {
							// Remember that the DOM is ready
							$.domReady[root] = TRUE;
							var callb;
							// If there are functions bound, to execute
							if ($.readyList) {
								// Execute all of them
								while ((callb = $.readyList[i++])) {
									callb.fn.call(callb.obj);
								}
								
								// Reset the list of functions
								$.readyList = null;
							}
						}
					} else if (callback) {
						callback.call(node);
					}
				});
			}
		};
		
		
		var head = $("head");
		
		var add = function (o) {
			mix($, o);
		};
		
		add({
			
			mix: mix,
			
			add: add,
			
			clone: clone,
			
			walkTheDOM: walkTheDOM,
			
			getWindowFromDocument: function (doc) {
				doc = doc || $.context;
				return doc.defaultView || doc.parentWindow || $.win;
			},
			
			Lang: Lang,
			
			"Array": ArrayHelper,
			
			Hash: Hash,
			
			NodeList: NodeList,
			
			Get: {
				script: loadScript,
				css: loadCSS
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
			
			pxToFloat: pxToFloat,
			
			UA: (function () {
				var ua = nav.userAgent.toLowerCase(),
                	p = nav.platform.toLowerCase();

				var webkit = /KHTML/.test(ua) || /webkit/i.test(ua),
					chrome = /chrome/i.test(ua),
					opera = /opera/i.test(ua),
					ie = !+"\v1"; // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
				
                return {
					w3: !!(doc.getElementById && doc.getElementsByTagName && doc.createElement),
					webkit: webkit,
					chrome: chrome,
					ie: ie ? doc.documentMode : FALSE,
					opera: opera,
					gecko: !webkit && !opera && !ie && /Gecko/i.test(ua),
					win: p ? /win/.test(p) : /win/.test(ua), 
					mac: p ? /mac/.test(p) : /mac/.test(ua)
				};
	        }())
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
			if (ready == requiredLength) {
				/*
				 * Create a new instance of the core, call each module and the queue's callback 
				 */
				core = new Core();
				for (j = 0; j < requiredLength; j++) {
					modules[required[j].name](core);
				}
				queueList[i].main(core);
				/*
				 * remove the queue from the queue list
				 */
				queueList.splice(i, 1);
			} else {
				i++;
			}
		}
	};
		
	if (!win.jet) {
		addEvent(win, "unload", EventCache.flush);
		
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
			var predef = mix(clone(predefinedModules), config.modules || {}, TRUE);
			
			var loadCssModule = function (module) {
				loadCSS(module.fullpath || (base + module.path));
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
					var i, j, k, module;
					for (i = 0; i < request.length - 1; i++) {
						module = request[i];
						if (Lang.isString(module)) {
							request[i] = module.toLowerCase();
						}
						module = predef[request[i]];
						if (module && Lang.isArray(module)) {
							ArrayHelper.each(module, function (val) {
								if (!ArrayHelper.inArray(val, request)) {
									request.splice(i, 0, val);
									i--;
								}
							});
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
						if (!modules[module.name] && !queuedScripts[module.name]) {
							if (!module.type || module.type == "js") {
								loadScript(module.fullpath || (base + module.path)); 
							} else if (module.type == "css") {
								loadCssModule(module);
							}
							queuedScripts[module.name] = 1;
						}
					}
					queueList.push({
						main: request.pop(),
						req: request
					});
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