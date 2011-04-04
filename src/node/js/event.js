
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