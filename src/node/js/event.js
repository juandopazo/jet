
var ON = 'on',
	Lang = $.Lang,
	$Object = $.Object,
	$Array = $.Array,
	AP = Array.prototype,
	SLICE = AP.slice,
	NONE = 'none',
	rroot = /^(?:body|html)$/i,
	PROTO;

var Event = $.namespace('Event');
/**
 * Keeps a record of all listeners attached to the DOM in order to remove them when necessary
 * @class Event.Cache
 * @static
 */
var EventCache = Event.Cache = (function () {
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
	
	return {
		/**
		 * Adds a listener to the cache
		 * @method add
		 * @param {DOMNode} obj
		 * @param {String} type
		 * @param {Function} fn
		 */
		add: function (obj, type, callback, listener) {
			if (obj.nodeType) {
				var c = getCache(type);
				c[c.length] = {
					obj: obj,
					callback: callback,
					listener: listener
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
		remove: function (obj, type, callback) {
			var c = getCache(type),
			i = 0;
			while (i < c.length) {
				if (c[i].obj == obj && c[i].callback == callback) {
					detachEvent(obj, type, c[i].listener);
					c.splice(i, 1);
				} else {
					i++;
				}
			}
		},
		/**
		 * Removes all listeners from a node
		 * @method clear
		 * @param {DOMNode} obj
		 */
		clear: function (obj, type) {
			var c, i = 0;
			if (type) {
				c = getCache(type);
				while (i < c.length) {
					if (c[i].obj == obj) {
						detachEvent(obj, type, c[i].listener);
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
								detachEvent(obj, type, c[i].listener);
								c.splice(i, 1);
							} else {
								i++;
							}
						}
					}
				}
			}
		},
		/**
		 * Removes all listeners from all nodes recorded in the cache
		 * @method flush
		 */
		flush: function () {
			for (var o in cache) {
				if (cache.hasOwnProperty(o)) {
					EventCache.clear(o);
				}
			}
		}
	};
}());

var makeHandler = function (callback, thisp) {
	return function (e) {
		e = e || $.config.win.Event;
		e.target = e.srcElement;
		e.preventDefault = function () {
			e.returnValue = false;
		};
		e.stopPropagation = function () {
			e.cancelBubble = true;
		};
		e.halt = function() {
			e.stopPropagation();
			e.preventDefault();
		};
		callback.call(thisp || e.srcElement, e);
	};
};

// adds a DOM event and provides event object normalization
var addEvent = function (obj, type, callback, thisp) {
	if (obj.addEventListener) {
		addEvent = function (obj, type, callback, thisp) {
			var handlerFn = function(e) {
				e.halt = function() {
					e.stopPropagation();
					e.preventDefault();
				};
				callback.call(thisp || this, e);
			}
			obj.addEventListener(type, handlerFn, false);
			EventCache.add(obj, type, callback, handlerFn);
			return {
				obj: obj,
				type: type,
				fn: handlerFn
			};
		};
	} else if (obj.attachEvent) {
		addEvent = function (obj, type, callback, thisp) {
			// Use makeHandler to prevent the handler function from having obj in its scope
			var handlerFn = makeHandler(callback, thisp);
			obj.attachEvent(ON + type, handlerFn);
			EventCache.add(obj, type, callback, handlerFn);
			return {
				obj: obj,
				type: type,
				fn: handlerFn
			};
		};
	}
	return addEvent(obj, type, callback, thisp);
};

var triggerEvent = function (node, type, data) {
	var doc = $.config.doc;
	if (doc.createEvent) {
		triggerEvent = function (node, type, data) {
			var e = node.ownerDocument.createEvent('Events');
			e.initEvent(event, true, true)
			$.mix(e, data);
			node.dispatchEvent(e);
		};
	} else {
		triggerEvent = function (node, type, data) {
			var e = node.ownerDocument.createEventObject();
			$.mix(e, data);
			node.fireEvent(ON + type, e);
		};
	}
	triggerEvent(node, type, data);
};

if ($.UA.ie && $.UA.ie < 7) {
    addEvent($.config.win, 'unload', EventCache.flush);
}

/**
 * A collection of DOM Event handlers for later detaching
 * @class DOMEventHandler
 * @constructor
 * @param {Array} handlers
 */
function DOMEventHandler(handlers) {
	this._handlers = handlers || [];
}
$.DOMEventHandler = $.mix(DOMEventHandler.prototype, {
	/**
	 * Unbinds all event handlers from their hosts
	 * @method detach
	 */
	detach: function () {
		for (var handlers = this._handlers, i = 0, length = handlers.length; i < length; i++) {
			EventCache.remove(handlers[i].obj, handlers[i].type, handlers[i].callback);
		}
		this._handlers = [];
	}
});

