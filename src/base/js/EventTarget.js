
var Hash = $.Hash,
	Lang = $.Lang,
	$_Array = $.Array,
	SLICE = Array.prototype.slice,
	extend = $.extend;
	
var Class = $.Class;

var TRACKING = "tracking",
	MOUSEMOVE = "mousemove",
	MOUSEUP = "mouseup",
	SELECTSTART = "selectstart",
	FREQUENCY = "frequency",
	HEIGHT = "height",
	WIDTH = "width",
	PROTO = 'prototype',
	DASH = '-';

/**
 * A custom event object, only to be used by EventTarget
 * @class CustomEvent
 * @constructor
 */
function CustomEvent(type, target, onPrevented, args) {
	
	var self = this;
	
	/**
	 * @property type
	 * @description The type of the event
	 */
	this.type = type;
	/**
	 * @property target
	 * @description The target of the event
	 */
	this.target = target;
	/**
	 * @method preventDefault
	 * @description Prevents the default behavior of the event
	 */
	this.preventDefault = function () {
		if (onPrevented) {
			onPrevented();
		}
	};
	
	Hash.each(args || {}, function (name, val) {
		if (!Lang.isValue(self[name])) {
			self[name] = val;
		}
	});
}

/**
 * <p>A class designed to be inherited or used by other classes to provide custom events.</p>
 * <p>Custom events work by attaching event listeners to a class that extends EventTarget.
 * An event listener can be a function or an object with a method called "handleEvent".
 * If it is a function, when fired the context will be the firing object. In the case of an object, the 
 * context will be the object itself.</p>
 * <p>Attaching an object to the "*" event type allows for a different approach:</p>
 * <code>
 * someObj.handleEvent = function (e) {<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;switch (e.type) {<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;case "someEvent":<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//do something<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break;<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;case "otherEvent":<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//do something else<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;break;<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;}<br/>
 * };<br/>
 * eventProvider.on("*", someObj);
 * </code>
 * @class EventTarget
 * @constructor
 */
$.EventTarget = Class.create('EventTarget', null, {
	
	initializer: function () {
		this._events = {};
	},
	
	_on: function (eventType, handler) {
		var collection = this._events;
		if (!collection[eventType]) {
			collection[eventType] = [];
		}
		
		if (Lang.isObject(handler.fn)) {
			collection[eventType].push({
				fn: callback,
				o: thisp || this,
				once: once
			});
		}
		return this;
	},
	
	/**
	 * Adds an event listener 
	 * @method on
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	on: function (eventType, callback, thisp) {
		return this._on(eventType, {
			fn: callback,
			o: thisp
		});
	},
	
	/**
	 * Listens to an event only once
	 * @method once
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	once: function (eventType, callback, thisp) {
		return this._on(eventType, {
			fn: callback,
			o: thisp,
			once: true
		});
	},
	
	/**
	 * Listens to an 'after' event. This is a shortcut for writing on('afterEvent'), callback)
	 * @method after
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	after: function (eventType, callback, thisp) {
		return this.on('after' + eventType.charAt(0).toUpperCase() + eventType.substr(1), callback, thisp);
	},
	/**
	 * Removes and event listener
	 * @method unbind
	 * @param {String} eventType
	 * @param {Function} callback
	 * @chainable
	 */
	unbind: function (eventType, callback) {
		var events = this._events[eventType] || [],
			i = 0;
		if (eventType && callback) {
			while (i < events.length) {
				if (events[i].fn == calback) {
					events[i].splice(i, 1);
				} else {
					i++;
				}
			}
		} else if (eventType) {
			this._events[eventType] = [];
		} else {
			this._events = {};
		}
		return this;
	},
	/**
	 * Fires an event, executing all its listeners
	 * @method fire
	 * @param {String} eventType
	 * Extra parameters will be passed to all event listeners
	 */
	fire: function (eventType, args) {
		var collection = this._events;
		var handlers = collection[eventType] || [];
		var returnValue = true;
		if (collection["*"]) {
			handlers = handlers.concat(collection["*"]);
		}
		var i = 0;
		var callback;
		var e = new CustomEvent(eventType, this, function () {
			returnValue = false;
		}, args);
		while (i < handlers.length) {
			callback = handlers[i].fn;
			if (Lang.isFunction(callback)) {
				callback.call(handlers[i].o, e);
			// if the event handler is an object with a handleEvent method,
			// that method is used but the context is the object itself
			} else if (Lang.isObject(callback) && Lang.isFunction(callback.handleEvent)) {
				callback.handleEvent.call(handlers[i].o || callback, e);
			}
			if (handlers[i].once) {
				handlers.splice(i, 1);
			} else {
				i++;
			}
		}
		return returnValue;
	}
});