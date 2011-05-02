
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
	
	/**
	 * Removes all listeners from a node
	 * @method clear
	 * @param {DOMNode} obj
	 */
	var clear = function (obj, type) {
		var c, i = 0;
		if (type) {
			c = getCache(type);
			while (i < c.length) {
				if (c[i].obj == obj) {
					detachEvent(obj, type, c[i].fn);
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
							detachEvent(obj, type, c[i].fn);
							c.splice(i, 1);
						} else {
							i++;
						}
					}
				}
			}
		}
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
			detachEvent(obj, type, fn);
			var c = getCache(type),
			i = 0;
			while (i < c.length) {
				if (c[i].obj == obj && c[i].fn == fn) {
					c.splice(i, 1);
				} else {
					i++;
				}
			}
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

/**
 * A collection of DOM Event handlers for later detaching
 * @class DOMEventHandler
 * @constructor
 * @param {Array} handlers
 */
function DOMEventHandler(handlers) {
	this._handlers = handlers || [];
}
DOMEventHandler.prototype = {
	/**
	 * Unbinds all event handlers from their hosts
	 * @method detach
	 */
	detach: function () {
		for (var handlers = this._handlers, i = 0, length = handlers.length; i < length; i++) {
			EventCache.remove(handlers[i].obj, handlers[i].type, handlers[i].fn);
		}
		this._handlers = [];
	}
};
