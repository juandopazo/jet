"use strict";


var $Object = $.Object,
	Lang = $.Lang,
	$Array = $.Array,
	SLICE = Array.prototype.slice,
	extend = $.extend;
	
var TRACKING = "tracking",
	MOUSEMOVE = "mousemove",
	MOUSEUP = "mouseup",
	SELECTSTART = "selectstart",
	FREQUENCY = "frequency",
	HEIGHT = "height",
	WIDTH = "width",
	PROTO = 'prototype',
	DASH = '-';

var BOUNDING_BOX = 'boundingBox',
	CONTENT_BOX = 'contentBox',
	SRC_NODE = 'srcNode',
	CONTENT = 'content',
	CLASS_PREFIX = 'classPrefix',
	UNLOAD = 'unload',
	VISIBILITY = 'visibility',
	DESTROY = 'destroy',
	
	widgetInstances = jet.namespace('Widget._instances');
	
/**
 * A custom event object, only to be used by EventTarget
 * @class EventFacade
 * @constructor
 */
function EventFacade(type, target, onPrevented, args) {
	
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
	this.halt = function() {
		this.preventDefault();
	};
	
	$Object.each(args || {}, function (name, val) {
		if (!Lang.isValue(this[name])) {
			this[name] = val;
		}
	}, this);
}

$.EventFacade = EventFacade;

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
}
$.mix(EventTarget.prototype, {
	
	_attach: function (eventType, handler) {
		handler.o = handler.o || this;
		
		var collection = this._events;
		if (!collection[eventType]) {
			collection[eventType] = [];
		}
		
		if (Lang.isObject(handler.fn)) {
			collection[eventType].push(handler);
		}
		return this;
	},
	
	_on: function (eventType, callback, thisp, once, args) {
		if (Lang.isObject(eventType)) {
			$Object.each(eventType, function (type, fn) {
				this._attach(type, {
					fn: fn,
					o: callback,
					once: once,
					args: args
				});
			}, this);
		} else {
			this._attach(eventType, {
				fn: callback,
				o: thisp,
				once: once,
				args: args
			});
		}
		return this;
	},
	
	/**
	 * Adds an event listener
	 * @method addListener
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} [thisp] Context on which the callback will run
	 * @chainable
	 */
	addListener: function (eventType, callback, thisp) {
		return this._on(eventType, callback, thisp, false, SLICE.call(arguments, 3));
	},
	
	/**
	 * Listens to an event only once
	 * @method once
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} [thisp] Context on which the callback will run
	 * @chainable
	 */
	once: function (eventType, callback, thisp) {
		return this._on(eventType, callback, thisp, true, SLICE.call(arguments, 3));
	},
	
	/**
	 * Listens to an 'after' event. This is a shortcut for writing on('afterEvent'), callback)
	 * @method after
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} [thisp] Context on which the callback will run
	 * @chainable
	 */
	after: function (eventType, callback, thisp) {
		return this.on.apply(this, ['after' + eventType.charAt(0).toUpperCase() + eventType.substr(1)].concat(SLICE.call(arguments, 1)));
	},
	/**
	 * Removes and event listener
	 * @method removeListener
	 * @param {String} eventType
	 * @param {Function} callback
	 * @chainable
	 */
	removeListener: function (eventType, callback) {
		var events = this._events[eventType] || [],
			type,
			i = 0;
		if (eventType && callback) {
			while (i < events.length) {
				if (events[i].fn == callback) {
					events.splice(i, 1);
				} else {
					i++;
				}
			}
		} else if (eventType) {
			this._events[eventType] = [];
		} else {
			for (type in this._events) {
				if (this._events.hasOwnProperty(type)) {
					this._events[type] = [];
				}
			}
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
		var handlers = this._events[eventType] = this._events[eventType] || [],
			extraArgs = SLICE.call(arguments, 2),
			returnValue = true,
			e = new $.EventFacade(eventType, this, function () { returnValue = false; }, args),
			i = 0;
			
		while (i < handlers.length) {
			if (Lang.isFunction(handlers[i].fn)) {
				handlers[i].fn.apply(handlers[i].o, handlers[i].args.concat([e]).concat(extraArgs));
			}
			if (!handlers[i] || handlers[i].once) {
				handlers.splice(i, 1);
			} else {
				i++;
			}
		}
		return returnValue;
	}
});

/**
 * Alias for <a href="#method_addListener">addListener</a>
 * @method on
 * @param {String} eventType Name of the event to listen to
 * @param {Function} callback Callback to execute when the event fires
 * @param {Object} thisp Optional. Context on which the callback will run
 * @chainable
 */
EventTarget.prototype.on = EventTarget.prototype.addListener;
/**
 * Alias for <a href="#method_removeListener">removeListener</a>
 * @method unbind
 * @param {String} eventType
 * @param {Function} callback
 * @chainable
 */
EventTarget.prototype.unbind = EventTarget.prototype.removeListener;

$.EventTarget = EventTarget;