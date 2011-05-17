/**
 * The Base module provides base classes for Utilities and Widgets
 * @module base
 * @requires node
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('base', function ($) {

			
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
	DASH = '-',
	ONCE = '~ONCE~';

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
	fire: function (eventType, args) {
		var collection = this._events;
		var handlers = collection[eventType] || [];
		var returnValue = true;
		if (collection["*"]) {
			handlers = handlers.concat(collection["*"]);
		}
		var i, collecLength = handlers.length;
		var callback;
		var e = new CustomEvent(eventType, this, function () {
			returnValue = false;
		}, args);
		for (i = 0; i < collecLength; i++) {
			callback = handlers[i].fn;
			if (Lang.isFunction(callback)) {
				callback.call(handlers[i].o, e);
			// if the event handler is an object with a handleEvent method,
			// that method is used but the context is the object itself
			} else if (Lang.isObject(callback) && callback.handleEvent) {
				callback.handleEvent.call(handlers[i].o || callback, e);
			}
			if (handlers[i].once) {
				$_Array.remove(handlers, handlers[i]);
				i--;
			}
		}
		return returnValue;
	}
});
/**
 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
 * @class Attribute
 * @extends EventTarget
 * @constructor
 */
$.Attribute = Class.create('Attribute', $.EventTarget, {
	
	initializer: function (state) {
		this._state = state || {};
		this._attrs = {};
		
		Class.walk(this, function (constructor) {
			if (constructor.ATTRS) {
				this.addAttrs(constructor.ATTRS);
			}
		});
	},
	
	/**
	 * Adds a configuration attribute, along with its options
	 * @method addAttr
	 * @param {String} attrName
	 * @param {Hash} config
	 * @chainable
	 */
	addAttr: function (attrName, config) {
		this._attrs[attrName] = config;
		var state = this._state;
		var isValue = Lang.isValue(state[attrName]);
		/*if (config.required && config.readOnly) {
			$.error("You can't have both 'required' and 'readOnly'");
		}*/
		if (config.readOnly && isValue) {
			delete state[attrName];
		}
		/*if (config.required && !isValue) {
			$.error("Missing required attribute: " + attrName);
		}*/
		if (Lang.isString(config.setter)) {
			config.setter = this[config.setter];
		}
		if (Lang.isString(config.getter)) {
			config.getter = this[config.getter];
		}
		if (isValue && config.setter) {
			state[attrName] = config.setter.call(this, state[attrName]);
		}
		return this;
	},
	
	_set: function (attrName, attrValue) {
		var attrConfig = this._attrs;
		var state = this._state;
		var config = attrConfig[attrName] = attrConfig[attrName] || {};
		var oldValue = state[attrName];
		var args;
		if (!config.readOnly) {
			if (!config.validator || config.validator.call(this, attrValue)) {
				if (config.setter) {
					attrValue = config.setter.call(this, attrValue);
				}
				if (!Lang.isValue(state[attrName]) && config.value) {
					state[attrName] = oldValue = config.value;
				}
				args = {
					newVal: attrValue,
					prevVal: oldValue
				};
				if (attrValue !== oldValue && this.fire(attrName + "Change", args)) {
					state[attrName] = attrValue;
					this.fire('after' + Lang.capitalize(attrName) + 'Change', args);
				}
			}
			if (config.writeOnce && !config.readOnly) {
				attrConfig[attrName].readOnly = true;
			}
		} /*else {
			$.error(attrName + " is a " + (config.writeOnce ? "write-once" : "read-only") + " attribute");
		}*/
		return this;
	},
	/**
	 * Returns a configuration attribute
	 * @method get
	 * @param {String} attrName
	 */	
	get: function (attrName) {
		var attrConfig = this._attrs;
		var state = this._state;
		attrConfig[attrName] = attrConfig[attrName] || {};
		var config = attrConfig[attrName];
		/*
		 * If it is writstateit wasn't set before, use the default value and mark it as written (readOnly works as written)
		 */
		if (config.writeOnce && !config.readOnly) {
			attrConfig[attrName].readOnly = true;
		}
		if (!Lang.isValue(state[attrName])) {
			state[attrName] = config.value;
		}
		return config.getter ? config.getter.call(this, state[attrName], attrName) : state[attrName];
	},
	/**
	 * Sets a configuration attribute
	 * @method set
	 * @param {String} attrName
	 * @param {Object} attrValue
	 * @chainable
	 */
	set: function (attrName, attrValue) {
		var self = this;
		if (Lang.isObject(attrName)) {
			Hash.each(attrName, this._set, this);
		} else {
			this._set(attrName, attrValue);
		}
		return this;
	},
	/**
	 * Unsets a configuration attribute
	 * @method unset
	 * @param {String} attrName
	 * @chainable
	 */
	unset: function (attrName) {
		delete this._state[attrName];
		return this;
	},
	/**
	 * Adds several configuration attributes
	 * @method addAttrs
	 * @param {Hash} config - key/value pairs of attribute names and configs
	 * @chainable
	 */
	addAttrs: function (config) {
		Hash.each(config, this.addAttr, this);
		return this;
	},
	/**
	 * Returns a key/value paired object with all attributes
	 * @method getAttrs
	 * @return {Hash}
	 */
	getAttrs: function () {
		var result = {};
		var self = this;
		Hash.each(this._state, function (key) {
			result[key] = self.get(key);
		});
		return result;
	}
});
/**
 * Base class for all widgets and utilities.
 * @class Base
 * @extends Attribute
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Base = Class.create('Base', $.Attribute, {
	
	initializer: function (config) {
		config = config || {};
		function attachEvent(name, fn) {
			this.on(name, Lang.isString(fn) ? this[fn] : fn);
		}
		
		Class.walk(this, function (constructor) {
			$_Array.each(constructor.EXTS, function (extension) {
				Hash.each(extension.EVENTS, attachEvent, this);
			}, this);
			Hash.each(constructor.EVENTS, attachEvent, this);
		});
		
		Hash.each(config.on, attachEvent, this);

		this._handlers = [$($.config.win).on(UNLOAD, this.destroy, this)];
	},
	
	/**
	 * Starts the destruction lifecycle
	 * @method destroy
	 */
	destroy: function () {
		/**
		 * Preventing the default behavior will stop the destroy process
		 * @event destroy
		 */
		if (this.fire(DESTROY)) {
			Class.walk(this, function (constructor) {
				if (constructor.prototype.hasOwnProperty('destructor')) {
					constructor.prototype.destructor.call(this);
				}
			});

			$_Array.each(this._handlers, function (handler) {
				if (handler.detach) {
					handler.detach();
				}
			});
		}
	}
	
}, {
	
	ATTRS: {
		/**
		 * Allows quick setting of custom events in the constructor
		 * @attribute on
		 * @writeOnce
		 */
		on: {
			writeOnce: true,
			getter: function (val) {
				return val || {};
			}
		}
	},
	
	create: function (name, superclass, extensions, attrs, proto) {
		return Class.create(name, superclass || $.Base, proto, attrs).mixin(extensions || []);
	}
	
});

/**
 * Basic class for all utilities
 * @class Utility
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Utility = $.Base.create('utility', $.Base, [], {
	
	CSS_PREFIX: 'jet',
	
	ATTRS: {
		/**
		 * @attribute cssPrefix
		 * @default Utility.CSS_PREFIX
		 * @writeOnce
		 */
		cssPrefix: {
			getter: function (val) {
				return val || $.Utility.CSS_PREFIX;
			},
			writeOnce: true
		}
	}
	
}, {
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join(DASH);
	}
});
var BOUNDING_BOX = 'boundingBox',
	CONTENT_BOX = 'contentBox',
	SRC_NODE = 'srcNode',
	CONTENT = 'content',
	CLASS_PREFIX = 'classPrefix',
	UNLOAD = 'unload',
	VISIBILITY = 'visibility',
	DESTROY = 'destroy';

if (!jet.Widget) {
	jet.Widget = {};
}
if (!Lang.isNumber(jet.Widget._uid)) {
	jet.Widget._uid = -1;
}
if (!jet.Widget._instances) {
	jet.Widget._instances = {};
}

/**
 * Base class for all widgets. 
 * Provides show, hide, render and destroy methods, the rendering process logic
 * and basic attributes shared by all widgets 
 * @class Widget
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Widget = $.Base.create('widget', $.Base, [], {
	
	/**
	 * @property CSS_PREFIX
	 * @description Default prefix for all css classes used in widget by the getClassName() method
	 * @static
	 * @default 'jet'
	 */
	CSS_PREFIX: 'jet',
	
	NAME: 'widget',
	
	/**
	 * @property DOM_EVENTS
	 * @description DOM events that are routed automatically to the widget instance
	 * @static
	 * @default { click: 1, keypress: 1, mousedown: 1, mouseup: 1, mouseover: 1, mouseout: 1 }
	 */
	DOM_EVENTS: {
		click: 1,
		keypress: 1,
		mousedown: 1,
		mouseup: 1,
		mouseover: 1,
		mouseout: 1
	},
	
	ATTRS: {
		/**
		 * @attribute srcNode
		 * @description The node to which the widget will be appended to. May be set as a 
		 * configuration attribute, with a setter or as the first parameter of the render() method
		 * @type DOMNode | NodeList
		 */
		srcNode: {
			value: $($.context.body),
			setter: $
		},
		/**
		 * @attribute classPrefix
		 * @description Prefix for all CSS clases. Useful for renaming the project
		 * @default Widget.CSS_PREFIX
		 * @writeOnce
		 */
		classPrefix: {
			writeOnce: true,
			getter: function (val) {
				return val || $.Widget.CSS_PREFIX;
			}
		},
		/**
		 * @attribute rendered
		 * @description Rendered status. Shouldn't be changed by anything appart from the Widget.render() method
		 * @writeOnce
		 * @default false
		 */
		rendered: {
			value: false
		},
		/**
		 * The bounding box contains all the parts of the widget
		 * @attribute boundingBox
		 * @writeOnce
		 * @type NodeList
		 * @default uses BOUNDING_TEMPLATE instance property
		 */
		boundingBox: {
			setter: $
		},
		/**
		 * @attribute contentBox
		 * @description Another container inside the boundingBox added in order to have a more complex design
		 * @writeOnce
		 * @type NodeList
		 * @default uses CONTENT_TEMPLATE instance property
		 */
		contentBox: {
			setter: $
		},
		/**
		 * @attribute width
		 * @description The width of the overlay
		 * @type Number
		 */
		width: {
			validator: Lang.isNumber
		},
		/**
		 * @attribute height
		 * @description The height of the overlay.
		 * If set to 0 (zero) the height changes with the content
		 * @type Number
		 */
		height: {
			validator: Lang.isNumber
		},
		/**
		 * @attribute id
		 * @description The id of the widget
		 * @default class prefix + widget count
		 */
		 id: {
		 },
		 /**
		  * @attribute visible
		  * @description The visibility status of the widget
		  * @default true
		  * @type Boolean
		  */
		 visible: {
		 	value: true,
		 	validator: Lang.isBoolean
		 },
		 /**
		  * @attribute disabled
		  * @description The disabled status of the widget
		  * @default false
		  * @type Boolean
		  */
		 disabled: {
		 	value: false,
		 	validator: Lang.isBoolean
		 }
	},
	
	HTML_PARSER: {
		contentBox: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			if (boundingBox && this.CONTENT_TEMPLATE) {
				return boundingBox.first();
			}
		}
	},
	
	/**
	 * @method getByNode
	 * @description Returns a widget instance based on a node
	 * @static
	 */
	getByNode: function (node) {
		node = $(node).getDOMNode();
		var de = node.ownerDocument.documentElement;
		while (node && node != de) {
			if (node.id && jet.Widget._instances[node.id]) {
				return jet.Widget._instances[node.id];
			}
			node = node.parentNode;
		}
		return null;
	}
	
}, {
	
	BOUNDING_TEMPLATE: '<div/>',
	CONTENT_TEMPLATE: '<div/>',

	_domEventProxy: function (e) {
		this.fire(e.type, { domEvent: e });
	},
	
	/**
	 * Shows the widget
	 * @method show
	 * @chainable
	 */
	show: function () {
		return this.set('visible', true);
	},
	/**
	 * Hides the widget
	 * @method hide
	 * @chainable
	 */
	hide: function () {
		return this.set('visible', false);
	},
	/**
	 * Enables the widget
	 * @method enable
	 * @chainable
	 */
	enable: function () {
		return this.set('enabled', true);
	},
	/**
	 * Disables the widget
	 * @method enable
	 * @chainable
	 */
	disable: function () {
		return this.set('enabled', false);
	},
	/**
	 * Focuses the widget
	 * @method focus
	 * @chainable
	 */
	focus: function () {
		return this.set('focused', true);
	},
	/**
	 * Blurrs the element
	 * @method blur
	 * @chainable
	 */
	blur: function () {
		return this.set('focused', false);
	},
	/**
	 * Starts the rendering process. The rendering process is based on custom events.
	 * The widget class fires a 'render' event to which all subclasses must subscribe.
	 * This way all listeners are fired in the order of the inheritance chain. ie:
	 * In the Overlay class, the render process is:
	 * <code>render() method -> Module listener -> Overlay listener -> rest of the render() method (appends the boundingBox to the srcNode)</code>
	 * This helps to use an easy pattern of OOP CSS: each subclass adds a CSS class name to the boundingBox,
	 * for example resulting in <div class="jet-module jet-overlay jet-panel"></div>. That way
	 * a panel can inherit css properties from module and overlay.
	 * @method render
	 * @param {NodeList|HTMLElement} target
	 * @chainable
	 */
	render: function (target) {
		if (!this.get('rendered')) {
			var self = this;
			var boundingBox = this.get(BOUNDING_BOX);
			var contentBox = this.get(CONTENT_BOX);
			var srcNode = this.get(SRC_NODE);
			var className, classPrefix = this.get(CLASS_PREFIX);
			var classes = Class.getClasses(this);
			Hash.each($.Widget.DOM_EVENTS, function (name, activated) {
				if (activated) {
					self._handlers.push(boundingBox.on(name, self._domEventProxy, self));
				}
			});
			if (target) {
				srcNode = target;
				self.set(SRC_NODE, target);
			}

			if (this.constructor == $.Widget) {
				classes = [$.Widget];
			} else {
				classes.splice(0, 4);
			}
			
			$_Array.each([WIDTH, HEIGHT], function (size) {
				var value = self.get(size);
				if (Lang.isNumber(value)) {
					boundingBox[size](value);
				}
				self.after(size + 'Change', function (e) {
					newVal = Lang.isNumber(e.newVal) ? e.newVal : '';
					self.get(BOUNDING_BOX)[size](e.newVal);
				});
			});
			
			$_Array.each(classes, function (construct) {
				className = [classPrefix, construct.NAME].join(DASH);
				boundingBox.addClass(className);
				contentBox.addClass([className, CONTENT].join(DASH));
			});
			
			if (boundingBox.getDOMNode() != contentBox.getDOMNode()) {
				boundingBox.append(contentBox.css(VISIBILITY, 'inherit'));
			}
			if (!boundingBox.attr('id')) {
				boundingBox.attr('id', this.get('id'));
			}
			
			this._toggleVisibility({
				newVal: this.get('visible')
			});
			this._toggleDisabled({
				newVal: this.get('disabled')
			});
			/**
			 * Render event. Preventing the default behavior will stop the rendering process
			 * @event render
			 * @see Widget.render()
			 */
			if (this.fire('render')) {
				
				$_Array.each(['renderUI', 'bindUI', 'syncUI'], function (method) {
					$_Array.each(classes, function (constructor) {
						if (constructor.prototype.hasOwnProperty(method)) {
							constructor.prototype[method].call(self, boundingBox, contentBox);
						}
					});
				});
				
				if (!boundingBox.inDoc()) {
					boundingBox.appendTo(srcNode);
				}
				/**
				 * Fires after the render process is finished
				 * @event afterRender
				 */
				this.set('rendered', true).focus();
				setTimeout(function () {
					/**
					 * Fires after the render lifecycle finished. It is also fired after a timeout of 0 milliseconds, 
					 * so it is added to the execution queue rather than fired synchronously 
					 * @event afterRender
					 */
					self.fire('afterRender');
				}, 0);
			}
		}
		return this;
	},
	
	destructor: function () {
		this.get(BOUNDING_BOX).remove(true);
	},
	
	_parseHTML: function () {
		var self = this;
		var boundingBox = this.get(BOUNDING_BOX);
		if (boundingBox.getDOMNode() && boundingBox.inDoc()) {
			$_Array.each(this._classes, function (someClass) {
				Hash.each(someClass.HTML_PARSER || {}, function (attr, parser) {
					var val = parser.call(self, boundingBox);
					if (Lang.isValue(val) && (!(val instanceof $.NodeList) || val.getDOMNode())) {
						self.set(attr, val);
					}
				});
			});
		}
	},
	
	_toggleVisibility: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName('hidden'), !e.newVal);
	},
	
	_toggleDisabled: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName('disabled'), e.newVal);
	},
	
	_widgetIdChange: function (e) {
		this.get('boundingBox').attr('id', e.newVal);
		jet.Widget._instances[e.newVal] = this;
		delete jet.Widget._instances[e.prevVal];
	},
	
	initializer: function () {
		this._handlers = [$($.config.win).on(UNLOAD, this.destroy, this)];
		
		this._uid = ++jet.Widget._uid;
		
		var id = this.get('id');
		if (!id) {
			id = this.getClassName(this._uid);
			this.set('id', id);
		}
		this.after('idChange', this._widgetIdChange);
				
		jet.Widget._instances[id] = this;
		
		if (!this.get(BOUNDING_BOX)) {
			this.set(BOUNDING_BOX, this.BOUNDING_TEMPLATE);
		}
		if (!this.get(CONTENT_BOX)) {
			this.set(CONTENT_BOX, this.CONTENT_TEMPLATE || this.get(BOUNDING_BOX));
		}
		
		this.after('visibleChange', this._toggleVisibility);
		this.after('disabledChange', this._toggleDisabled);
		
		this._parseHTML();
	},
	
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join('-');
	}

});
/**
 * A utility for tracking the mouse movement without crashing the browser rendering engine.
 * Also allows for moving the mouse over iframes and other pesky elements
 * @class Mouse
 * @constructor
 * @extends Utility
 * @param {Object} config Object literal specifying configuration properties
 */
var Mouse = $.Mouse = $.Base.create('mouse', $.Utility, [], {
	
	ATTRS: {
		/**
		 * Frequency at which the tracker updates
		 * @attribute frequency
		 * @default 20 (ms)
		 * @type Number
		 */
		frequency: {
			value: 20
		},
		/**
		 * Tracking status. Set it to true to start tracking
		 * @attribute tracking
		 * @type Boolean
		 * @default false
		 */
		tracking: {
			value: false,
			validator: Lang.isBoolean
		},
		capturing: {
			value: false,
			validator: Lang.isBoolean
		},
		shields: {
			readOnly: true,
			getter: '_buildShim'
		},
		shim: {
			value: false,
			validator: Lang.isBoolean
		},
		prevX: {
			value: 0
		},
		prevY: {
			value: 0
		}
	}
	
}, {
	
	_buildShim: function () {
		if (!Mouse.shim) {
			var pageSize = this.get('pageSize');
			Mouse.shim = $('<iframe/>').attr({
				frameborder: '0',
				src: 'javascript:;'
			}).css({
				opacity: 0,
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: pageSize.width,
				height: pageSize.height,
				border: 0,
				zIndex: 20000000
			}).appendTo($.config.doc.body).hide();
		}
		return Mouse.shim;
	},
	
	_onTrackingChange: function (e) {
		var self = this;
		var value = e.newVal;
		if (value) {
			if (!this.get('capturing')) {
				if (this.get('shim')) {
					this.shim.show();
				}
				this.interval = setInterval(function () {
					var clientX = self.get('clientX');
					var clientY = self.get('clientY');
					if (self.get('prevX') != clientX || self.get('prevY') != clientY) {
						self.fire(MOUSEMOVE, {
							clientX: clientX,
							clientY: clientY
						});
						self.set({
							prevX: clientX,
							prevY: clientY
						});
					}
				}, this.get(FREQUENCY));
				this.set('capturing', true);
			}
		} else {
			this.shim.hide();
			clearInterval(this.interval);
			this.set('capturing', false);
		}
	},
	
	_onSelectStart: function (e) {
		if (this.get('capturing')) {
			e.preventDefault();
		}
	},
	
	_onMouseMove: function (e) {
		this.set({
			clientX: e.clientX,
			clientY: e.clientY
		});
	},
	
	_onMouseUp: function () {
		/**
		 * Fires when the mouse button is released
		 * @event mouseup
		 */
		this.set(TRACKING, false).fire('mouseup', { clientX: this.get('clientX'), clientY: this.get('clientY') });
	},
	
	initializer: function () {
		this.set('pageSize', $.DOM.pageSize());
		
		var shim = this.shim = this._buildShim();
		
		this.after('trackingChange', this._onTrackingChange);
		
		/**
		 * Fires not when the mouse moves, but in an interval defined by the frequency attribute
		 * This way you can track the mouse position without breakin the browser's rendering engine
		 * because the native mousemove event fires too quickly
		 * @event move
		 */
		var shimDoc = $(shim.getDOMNode().contentWindow.document); 
		shimDoc.find('body').css({
			margin: 0,
			padding: 0
		});
		shimDoc.on(MOUSEMOVE, this._onMouseMove, this);
		shimDoc.on(MOUSEUP, this._onMouseUp, this);
		
		var context = $($.config.doc);
		context.on("selectstart", this._onSelectStart, this);
		context.on(MOUSEMOVE, this._onMouseMove, this);
		context.on(MOUSEUP, this._onMouseUp, this);

		this.on('destroy', shim.unbindAll, shim);
	},
	
	/**
	 * Start tracking. Equivalent to setting the tracking attribute to true.
	 * Simulates the mousedown event
	 * @method down
	 * @chainable
	 */
	down: function () {
		return this.set(TRACKING, true);
	},
	/**
	 * Stop tracking. Equivalent to setting the tracking attribute to false
	 * Simulates the mouseup event
	 * @method up
	 * @chainable
	 */
	up: function () {
		return this.set(TRACKING, false);
	}
});
(function () {
	
	var $_event = new $.EventTarget();
	var interval, timeout;
	var lastScrollLeft, lastScrollTop;
	var win = $.config.win;
	
	var scroll = function () {
		var scrollLeft = $.DOM.scrollLeft();
		var scrollTop = $.DOM.scrollTop();
		if (scrollLeft != lastScrollLeft || scrollTop != lastScrollTop) {
			$_event.fire('scroll', { scrollLeft: scrollLeft, scrollTop: scrollTop });
		} else {
			clearInterval(interval);
			interval = null;
		}
		lastScrollLeft = scrollLeft;
		lastScrollTop = scrollTop;
	}
	
	$($.config.win).on('scroll', function () {
		if (!interval) {
			interval = setInterval(scroll, 50);
		}
	});
	
	$_Array.each(['on', 'once', 'fire'], function (eventMethod) {
		$[eventMethod] = $.bind($_event[eventMethod], $_event);
	});
	
	$_Array.each(['load', 'unload'], function (name) {
		$(win).on(name, function () {
			$_event.fire(name);
		});
	});
	
	$(win).on('resize', function () {
		$_event.fire('resize');
	});
	
}());
			
});
