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
		if (!Lang.isValue(self[name])) {
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
	
	_publish: function(eventName, config) {
		config = config || {};
		var _event = this._events[eventName];
		if (!_event) {
			_event = this._events[eventName] = {
				listeners: [],
				afterListeners: []
			};
		}
		if (Lang.isFunction(config.defaultFn)) {
			_event.defaultFn = config.defaultFn;
		}
		if (Lang.isFunction(config.stoppedFn)) {
			_event.stoppedFn = config.stoppedFn;
		}
	},
	
	publish: function(eventName, config) {
		if (Lang.isObject(eventName)) {
			$Object.each(eventName, function (name, conf) {
				if (!this._events[name]) {
					this._publish(name, conf);
				}
			}, this);
		} else if (!this._events[eventName]) {
			this._publish(eventName, config);
		}
		return this;
	},
	
	getEvent: function(eventName) {
		return this._events[eventName] || this._publish(eventName);
	},
	
	_attach: function (after, once, eventType, callback, context) {
		var handler = {
			fn: callback,
			o: context || this,
			once: once
		};
		var event = this.getEvent(eventType);
		
		if (Lang.isObject(handler.fn)) {
			event[after ? 'afterListeners' : 'listeners'].push(handler);
		}
		return this;
	},
	
	_on: function (eventType, callback, thisp, once, after) {
		if (Lang.isObject(eventType)) {
			$Object.each(eventType, function (type, fn) {
				this._attach(after, once, type, fn, callback);
			}, this);
		} else {
			this._attach(after, once, eventType, callback, thisp);
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
		return this._on(eventType, callback, thisp);
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
		return this._on(eventType, callback, thisp, true);
	},
	
	/**
	 * Listens to an 'after' event. This listeners are called after the defaultFn defined when publishing the event
	 * @method after
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	after: function (eventType, callback, thisp) {
		return this._on(eventType, callback, thisp, false, true);
	},
	/**
	 * Listens to an 'after' event just once
	 * @method after
	 * @param {String} eventType Name of the event to listen to
	 * @param {Function} callback Callback to execute when the event fires
	 * @param {Object} thisp Optional. Context on which the callback will run
	 * @chainable
	 */
	onceAfter: function(eventType, callback, thisp) {
		return this._on(eventType, callback, thisp, true, true);
	},
	_unbind: function (after, eventType, callback) {
		var event = this.getEvent(eventType),
			listeners = event[after ? 'afterListeners' : 'listener'];
			type,
			i = 0;
		if (eventType && callback) {
			while (i < listeners.length) {
				if (listeners[i].fn == callback) {
					listeners.splice(i, 1);
				} else {
					i++;
				}
			}
		} else if (eventType) {
			this._events[eventType] = [];
		} else {
			for (type in this._events) {
				if (this._events.hasOwnProperty(type)) {
					delete this._events[type];
				}
			}
		}
		return this;
	},
	/**
	 * Removes and event listener
	 * @method unbind
	 * @param {String} eventType
	 * @param {Function} callback
	 * @chainable
	 */
	unbind: function (eventType, callback) {
		return this._unbind(false, eventType, callback);
	},
	unbindAfter: function (eventType, callback) {
		return this._unbind(true, eventType, callback);
	},
	_fire: function (handlers, args) {
		var i = 0;
		while (i < handlers.length) {
			if (Lang.isFunction(handlers[i].fn)) {
				handlers[i].fn.apply(handlers[i].o, args);
			}
			if (!handlers[i] || handlers[i].once) {
				handlers.splice(i, 1);
			} else {
				i++;
			}
		}
	},
	/**
	 * Fires an event, executing all its listeners
	 * @method fire
	 * @param {String} eventType
	 * Extra parameters will be passed to all event listeners
	 */
	fire: function (eventType, args) {
		var event = this.getEvent(eventType),
			beforeListeners = event.listeners,
			afterListeners = event.afterListeners,
			returnValue = true,
			e = new $.EventFacade(eventType, this, function () { returnValue = false; }, args);
		
		args = [e].concat(SLICE.call(arguments, 2));
		
		this._fire(beforeListeners, args);
		if (returnValue) {
			if (Lang.isFunction(event.defaultFn)) {
				event.defaultFn.apply(this, args);
			}
			if (returnValue) {
				this._fire(afterListeners, args);
			}
		} else if (Lang.isFunction(event.stoppedFn)) {
			event.stoppedFn.apply(this, args);
		}
		
		return returnValue;
	}
});

$.EventTarget = EventTarget;