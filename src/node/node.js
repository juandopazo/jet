/**
 * Node collections and DOM abstraction
 * @module node
 * @requires lang, ua
 */
jet().add("node", function ($) {
	
	var TRUE = true,
		FALSE = false,
		NONE = "none",
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
	
	// cross browser listener removal
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
				if (!(nodes.nodeType || nodes.body || nodes.navigator)) {
					nodes.splice(i, 1);
				} else {
					i++;
				}
			}
		} else if (Lang.isNumber(nodes.length)) {
			nodes = SLICE.call(nodes);
		} else {
			$.error("Wrong argument for NodeList");
		}
		AP.push.apply(this, nodes);
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
			var i = -1, myself = this;
			while (this[++i]) {
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
				console.log(node);
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
					/*
					 * getBoundingClientRect implementation from jQuery
					 */
					var box  = node.getBoundingClientRect();
					var body = doc.body;
					var de = doc[DOCUMENT_ELEMENT];
					offset.left = box.left + DOM.scrollLeft() - (de.clientLeft || body.clientLeft || 0);
					offset.top = box.top + DOM.scrollTop() - (de.clientTop || body.clientTop || 0);
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
			deep = Lang.isValue(deep) ? deep : TRUE;
			var result = new NodeList();
			this.each(function (node) {
				result.push(node.cloneNode(deep));
			});
			return result;
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
		insertBefore: function (before) {
			before = $(before)[0];
			return this.each(function (node) {
				before.parentNode.insertBefore(node, before);
			});
		},
		/**
		 * Returns a new NodeList with all the parents of the current nodes
		 * @method parent
		 * @return {NodeList}
		 */
		parent: function () {
			var result = new NodeList();
			this.each(function (node) {
				if (A.indexOf(node.parentNode, result) == -1) {
					result.push(node.parentNode);
				}
			});
			return result;
		},
		/**
		 * Returns a new NodeList with all the first children of the nodes in the collection
		 * @method first
		 * @return {NodeList}
		 */
		first: function () {
			var result = new NodeList();
			this.each(function (node) {
				node = $(node).children(0)[0];
				if (node) {
					result.push(node);
				}
			});
			return result;
		},
		/**
		 * Returns a new NodeList with all the next siblings of the nodes in the collection
		 * @method next
		 * @return {NodeList}
		 */
		next: function () {
			var result = new NodeList();
			this.each(function (next) {
				do {
					next = next.nextSibling;
				}
				while (next && next.nodeType == TEXT_NODE);
				if (next) {
					result.push(next);
				}
			});
			return result;
		},
		/**
		 * Returns a new NodeList with all the previous siblings of the nodes in the collection
		 * @method previous
		 * @return {NodeList}
		 */
		previous: function () {
			var result = new NodeList();
			this.each(function (previous) {
				do {
					previous = previous.previousSibling;
				}
				while (previous && previous.nodeType == TEXT_NODE);
				if (previous) {
					result.push(previous);
				}
			});
			return result;
		},
		/**
		 * Returns a new NodeList with all the last children of the nodes in the collection
		 * @method first
		 * @return {NodeList}
		 */
		last: function () {
			var result = new NodeList();
			this.each(function (node) {
				node = $(node).children().pop();
				if (node) {
					result.push(node);
				}
			});
			return result;
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
				return this[0].style[key];
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
			var result = new NodeList();
			this.each(function (node) {
				result.push.apply(result, $(query, node));
			});
			return result;
		},
		/**
		 * Returns a new NodeList with all the children of the current nodes
		 * @method children
		 * @param {String|Number} filter Return only the children that match the tag or index in this parameter
		 * @return {NodeList}
		 */
		children: function (filter) {
			filter = !Lang.isValue(filter) ? FALSE :
					  Lang.isString(filter) ? filter.toUpperCase() : filter;
			var result = new NodeList();
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
							result.push(newChildren[i]);
						}
					}
				} else {
					result.push.apply(result, newChildren);
				}
			});
			return result;
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
		 * Removes all the nodes from the DOM tree.
		 * Unless keepEvents is true, it alse removes all event listeners from the nodes
		 * @method remove
		 * @param {Boolean} keepEvents
		 * @chainable
		 */
		remove: function (keepEvents) {
			return this.each(function (node) {
				if (!keepEvents) {
					$.walkTheDOM(node, EventCache.clear);
				}
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
		link: function (nodelist) {
			var result = new NodeList(SLICE.call(this));
			A.each(nodelist, function (node) {
				result.push(node);
			});
			return result;
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
});