
var BOUNDING_BOX = "boundingBox",
	CONTENT_BOX = 'contentBox',
	SRC_NODE = "srcNode",
	CONTENT = 'content',
	CLASS_PREFIX = 'classPrefix',
	UNLOAD = "unload",
	VISIBILITY = "visibility",
	DESTROY = "destroy",
	TRACKING = "tracking",
	MOUSEMOVE = "mousemove",
	MOUSEUP = "mouseup",
	SELECTSTART = "selectstart",
	FREQUENCY = "frequency",
	HEIGHT = "height",
	WIDTH = "width",
	PROTO = 'prototype',
	DASH = '-';


/**
 * <p>A class designed to be inherited or extended by other classes and provide custom events.</p>
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
var EventTarget = function () {
	var collection = {};
	
	var self = this;
	var onceList = [];
	
	/**
	 * Adds an event listener 
	 * @method on
	 * @param {String} eventType
	 * @param {Function} callback
	 * @chainable
	 */
	this.on = function (eventType, callback) {
		if (!collection[eventType]) {
			collection[eventType] = [];
		}
		if (Lang.isObject(callback)) {
			collection[eventType].push(callback);
		}
		return self;
	};
	
	this.once = function (eventType, callback) {
		onceList.push(callback);
		return self.on(eventType, callback);
	};
	
	this.after = function (eventType, callback) {
		return self.on('after' + eventType.substr(0, 1).toUpperCase() + eventType.substr(1), callback);
	};
	
	/**
	 * Removes and event listener
	 * @method unbind
	 * @param {String} eventType
	 * @param {Function} callback
	 * @chainable
	 */
	this.unbind = function (eventType, callback) {
		if (eventType) {
			$.Array.remove(callback, collection[eventType] || []);
		} else {
			collection = {};
		}
		return self;
	};
	
	/**
	 * Fires an event, executing all its listeners
	 * @method fire
	 * @param {String} eventType
	 * Extra parameters will be passed to all event listeners
	 */
	this.fire = function (eventType) {
		var handlers = collection[eventType] || [];
		var returnValue = true;
		if (collection["*"]) {
			handlers = handlers.concat(collection["*"]);
		}
		var i, collecLength = handlers.length;
		var stop = false;
		var args = SLICE.call(arguments, 1);
		args.unshift({
			stopPropagation: function () {
				stop = true;
			},
			preventDefault: function () {
				returnValue = false;
			},
			type: eventType,
			target: self
		});
		for (i = 0; i < collecLength; i++) {
			if (Lang.isFunction(handlers[i])) {
				handlers[i].apply(self, args);
			// if the event handler is an object with a handleEvent method,
			// that method is used but the context is the object itself
			} else if (Lang.isObject(handlers[i]) && handlers[i].handleEvent) {
				handlers[i].handleEvent.apply(handlers[i], args);
			}
			if (A.indexOf(onceList, handlers[i]) > -1) {
				A.remove(onceList, handlers[i]);
				A.remove(handlers, handlers[i]);
				i--;
			}
			if (stop) {
				break;
			}
		}
		return returnValue;
	};
	
};