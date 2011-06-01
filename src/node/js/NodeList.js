
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

function classRE(name) {
	return new RegExp('(^|\\s)' + name + '(\\s|$)');
}
/**
 * A collection of DOM Nodes
 * @class NodeList
 * @constructor
 * @extends ArrayList
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
	} else {
		//$.error('Wrong argument for NodeList');
	}
	this._items = nodes;
}
$.NodeList = $.extend(NodeList, $.ArrayList, {
	
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
			$Array.forEach(SLICE.call(args), function (name) {
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
			$Array.forEach(SLICE.call(args), function (name) {
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
	 * </ul>
	 * @method position
	 * @return {Object}
	 */
	position: function (left, top) {
		if (Lang.isNumber(left) || Lang.isNumber(top)) {
			return this.each(function (node) {
				node = $(node);
				var parentOffset = node.offsetParent().offset();
				if (Lang.isNumber(left)) {
					node.css('left', left - parentOffset.left);
				}
				if (Lang.isNumber(top)) {
					node.css('top', top - parentOffset.top);
				}
			});
		} else {
			var node = this.getDOMNode();
			var offset = {
				left: 0,
				top: 0
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
	offset: function () {
		return $.mix(this.position(), this.offsetSize());
	},
	offsetSize: function (width, height) {
		var node = this.getDOMNode();
		if (Lang.isNumber(width)) {
			width += 'px';
		}
		if (Lang.isNumber(height)) {
			height += 'px';
		}
		if (Lang.isString(width) || Lang.isString(height)) {
			this.css('width', width);
			this.css('height', height);
		} else {
			return {
				width: node.offsetWidth,
				height: node.offsetHeight
			};
		}
		return this;
	},
	width: function (val) {
		return this.offsetSize(val);
	},
	height: function (val) {
		return this.offsetSize(null, val);
	},
	/**
	 * Returns a new NodeList with all the offset parents of this one
	 * @method offsetParent
	 * @return NodeList
	 */
	offsetParent: function () {
		return this.map(function(node) {
			var offsetParent = node.offsetParent || document.body;
			while (offsetParent && (!rroot.test(offsetParent.nodeName) && $(offsetParent).css('position') === 'static')) {
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
			node.appendChild(app);
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
	 * @param {String|Object} key
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
			$Object.each(attrs, function (name, val) {
				node[name] = val;
			});
		});
	},
	/**
	 * Gets or sets CSS styles
	 * @method css
	 * @param {String|Object} key
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
			$Object.each(css, function (prop, value) {
				if (prop == 'opacity' && $.UA.ie) {
					node.style.filter = 'alpha(opacity=' + Math.ceil(value * 100) + ')';
				} else {
					if (Lang.isNumber(value)) {
						value += (prop != 'zIndex' && prop != 'zoom' && prop != 'opacity') ? 'px' : '';
					}
					if (Lang.isString(value)) {
						node.style[prop] = value;
					}
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
		return new this.constructor(result);
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
			$Object.each(type, function (evType, fn) {
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
	 * Fires an event as if it was created from a user interaction
	 * @method trigger
	 * @param {String} type
	 * @param {Object} data optional. Extra data to pass in the event
	 * @chainable
	 */
	trigger: function (type, data) {
		return this.each(function (node) {
			triggerEvent(node, type, data);
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
			if (node.nodeName == 'IFRAME') {
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
		$Array.forEach(SLICE.call(arguments), function (nodelist) {
			$(nodelist).each(function (node) {
				result.push(node);
			});
		});
		return new this.constructor(result);
	},
	/**
	 * Sets or returns the value of the node. Useful mostly for form elements
	 * @param {String} value - optional
	 * @chainable
	 */
	value: function (val) {
		return this.attr('value', val);
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
$Array.forEach(['blur', 'focus'], function (method) {
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
$Array.forEach(['next', 'previous'], function (method) {
	PROTO[method] = function () {
		return this.map(function (node) {
			do {
				node = node[method + 'Sibling'];
			}
			while (node && node.nodeType !== 1);
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
$Array.forEach(['Width', 'Height'], function (size) {
	var method = size.toLowerCase();
	PROTO[method] = function (value) {
		if (Lang.isValue(value)) {
			if (Lang.isNumber(value) && value < 0) {
				value = 0;
			}
			value = Lang.isString(value) ? value : value + 'px';
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
$Array.forEach(['Left', 'Top'], function (direction) {
	PROTO['offset' + direction] = function (val) {
		if (Lang.isValue(val)) {
			return direction == 'Left' ? this.offset(val) : this.offset(null, val);
		} else {
			return this.offset()[direction.toLowerCase()];
		}
	};
});

$.pxToFloat = function (px) {
	return Lang.isNumber(parseFloat(px)) ? parseFloat(px) :
		   Lang.isString(px) ? parseFloat(px.substr(0, px.length - 2)) : px;
};