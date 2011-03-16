
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
	 * @param {String} sClass
	 * @chainable
	 */
	toggleClass: function (name) {
		return this.each(function (node) {
			node = $(node);
			if (!node.hasClass(name)) {
				node.addClass(name);
			} else {
				node.removeClass(name);
			}
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
	 * @param {Boolean} deep If true, all nodes in the brach are cloned. If not, only the ones in the collection
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
	 * @param [Document] doc
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
			while (previous && previous.nodeType == TEXT_NODE);
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