
var Hash = $.Hash,
	Lang = $.Lang,
	$_Array = $.Array,
	SLICE = Array.prototype.slice,
	extend = $.extend;
	
var Base;

var TRACKING = "tracking",
	MOUSEMOVE = "mousemove",
	MOUSEUP = "mouseup",
	SELECTSTART = "selectstart",
	FREQUENCY = "frequency",
	HEIGHT = "height",
	WIDTH = "width",
	PROTO = 'prototype',
	DASH = '-',
	ONCE = '~ONCE~';

/**
 * A custom event object, only to be used by EventTarget
 * @class CustomEvent
 * @constructor
 */
function CustomEvent(type, target, onPrevented) {
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
function EventTarget() {
	
	this._events = {};
	
};
EventTarget.prototype = {
	/**
	 * Adds an event listener 
	 * @method on
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	on: function (eventType, callback, thisp) {
		var collection = this._events;
		var once = false;
		if (!collection[eventType]) {
			collection[eventType] = [];
		}
		
		if (eventType.indexOf(ONCE) > -1) {
			once = true;
			eventType = eventType.substr(ONCE.length);
		}
		if (Lang.isObject(callback)) {
			collection[eventType].push({
				fn: callback,
				o: thisp || this,
				once: once
			});
		}
		return this;
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
		return this.on(ONCE * eventType, callback, thisp);
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
		if (eventType) {
			$_Array.remove(callback, this._events[eventType] || []);
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
	fire: function (eventType) {
		var collection = this._events;
		var handlers = collection[eventType] || [];
		var returnValue = true;
		if (collection["*"]) {
			handlers = handlers.concat(collection["*"]);
		}
		var i, collecLength = handlers.length;
		var args = SLICE.call(arguments, 1);
		var callback;
		args.unshift(new CustomEvent(eventType, this, function () {
			returnValue = false;
		}));
		for (i = 0; i < collecLength; i++) {
			callback = handlers[i].fn;
			if (Lang.isFunction(callback)) {
				callback.apply(handlers[i].o, args);
			// if the event handler is an object with a handleEvent method,
			// that method is used but the context is the object itself
			} else if (Lang.isObject(callback) && callback.handleEvent) {
				callback.handleEvent.apply(handlers[i].o || callback, args);
			}
			if (handlers[i].once) {
				$_Array.remove(handlers, handlers[i]);
				i--;
			}
		}
		return returnValue;
	}
};