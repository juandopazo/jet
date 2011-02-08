/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * The Base module provides base classes for Utilities and Widgets.
 * @module base
 * @requires lang, dom
 */
jet().add('base', function ($) {
	
	var OP = Object.prototype;

	var Hash = $.Hash,
		Lang = $.Lang,
		A = $.Array,
		SLICE = Array.prototype.slice;
		
	var Base;

	/**
	 * Utilities for object oriented programming in JavaScript.
	 * JET doesn't provide a classical OOP environment like Prototype with Class methods,
	 * but instead it helps you take advantage of JavaScript's own prototypical OOP strategy
	 * @class OOP
	 * @static
	 */
	/**
	 * Object function by Douglas Crockford
	 * <a href="https://docs.google.com/viewer?url=http://javascript.crockford.com/hackday.ppt&pli=1">link</a>
	 * @private
	 * @param {Object} o
	 */
	var toObj = function (o) {
		var F = function () {};
		F.prototype = o;
		return new F();
	};
	
	/**
	 * Allows for an inheritance strategy based on prototype chaining.
	 * When exteiding a class with extend, you keep all prototypic methods from all superclasses
	 * @method extend
	 * @param {Function} subclass
	 * @param {Function} superclass
	 * @param {Hash} optional - An object literal with methods to overwrite in the subclass' prototype
	 */
	var extend = function (r, s, px, ax) {
		// From the guys at YUI. This function is GENIUS!
		
		if (!s || !r) {
			// @TODO error symbols
			$.error("extend failed, verify dependencies");
		}

		var sp = s.prototype, rp = toObj(sp);
		r.prototype = rp;

		rp.constructor = r;
		r.superclass = sp;

		// assign constructor property
		if (s != Object && sp.constructor == OP.constructor) {
			sp.constructor = s;
		}
	
		// add prototype overrides
		if (px) {
			$.mix(rp, px, true);
		}
		// add attributes
		if (ax) {
			$.mix(r, ax, true);
		}
		
		return r;
	};
	
	var bind = function(fn, obj) {
		if (Function.prototype.bind) {
			bind = function (fn) {
				return Function.prototype.bind.apply(fn, SLICE.call(arguments, 1));
			};
		} else {
			bind = function(fn, obj) {
				var slice = [].slice,
					args = slice.call(arguments, 1), 
					nop = function () {}, 
					bound = function () {
					  return fn.apply( this instanceof nop ? this : ( obj || {} ), 
										  args.concat( slice.call(arguments) ) );	
					};
				nop.prototype = fn.prototype;
				bound.prototype = new nop();
				return bound;
			};
		}
		return bind(fn, obj);
	};
	
	var BOUNDING_BOX = "boundingBox",
		CONTENT_BOX = 'contentBox',
		SRC_NODE = "srcNode",
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
		PROTO = 'prototype';

	
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
	
	/**
	 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
	 * @class Attribute
	 * @extends EventTarget
	 * @constructor
	 */
	var Attribute = function (classConfig) {
		Attribute.superclass.constructor.apply(this);
		classConfig = classConfig || {};
		var self = this;
		
		var attrConfig = {};
		
		function addAttr(attrName, config) {
			attrConfig[attrName] = config;
			var isValue = Lang.isValue(classConfig[attrName]);
			if (config.required && config.readOnly) {
				$.error("You can't have both 'required' and 'readOnly'");
			}
			if (config.readOnly && isValue) {
				delete classConfig[attrName];
			}
			if (config.required && !isValue) {
				$.error("Missing required attribute: " + attrName);
			}
			if (isValue && config.setter) {
				classConfig[attrName] = config.setter.call(self, classConfig[attrName]);
			}
			return self;
		}
		
		function set(attrName, attrValue) {
			attrConfig[attrName] = attrConfig[attrName] || {};
			var config = attrConfig[attrName];
			if (!config.readOnly) {
				if (!config.validator || config.validator(attrValue)) {
					attrValue = config.setter ? config.setter.call(self, attrValue) : attrValue;
					if (!Lang.isValue(classConfig[attrName]) && config.value) {
						classConfig[attrName] = config.value;
					}
					classConfig[attrName] = classConfig[attrName] == attrValue ? attrValue :
											self.fire(attrName + "Change", attrValue, classConfig[attrName]) ? attrValue :
											classConfig[attrName];
				}
				if (config.writeOnce && !config.readOnly) {
					attrConfig[attrName].readOnly = true;
				}
			} else {
				$.error(attrName + " is a " + (config.writeOnce ? "write-once" : "read-only") + " attribute");
			}
		}
		
		/**
		 * Returns a configuration attribute
		 * @method get
		 * @param {String} attrName
		 */	
		this.get = function (attrName) {
			attrConfig[attrName] = attrConfig[attrName] || {};
			var config = attrConfig[attrName];
			/*
			 * If it is write-once and it wasn't set before, use the default value and mark it as written (readOnly works as written)
			 */
			if (config.writeOnce && !config.readOnly) {
				attrConfig[attrName].readOnly = true;
			}
			if (!Lang.isValue(classConfig[attrName])) {
				classConfig[attrName] = config.value;
			}
			return	config.getter ? config.getter.call(self, classConfig[attrName], attrName) :
					classConfig[attrName];
		};
		/**
		 * Sets a configuration attribute
		 * @method set
		 * @param {String} attrName
		 * @param {Object} attrValue
		 * @chainable
		 */
		this.set = function (attrName, attrValue) {
			if (Lang.isHash(attrName)) {
				Hash.each(attrName, function (name, value) {
					set(name, value);
				});
			} else {
				set(attrName, attrValue);
			}
			return self;
		};
		/**
		 * Unsets a configuration attribute
		 * @method unset
		 * @param {String} attrName
		 * @chainable
		 */
		this.unset = function (attrName) {
			delete classConfig[attrName];
			return self;
		};
		/**
		 * Adds a configuration attribute, along with its options
		 * @method addAttr
		 * @param {String} attrName
		 * @param {Hash} config
		 * @chainable
		 */
		this.addAttr = addAttr;
		/**
		 * Adds several configuration attributes
		 * @method addAttrs
		 * @param {Hash} config - key/value pairs of attribute names and configs
		 * @chainable
		 */
		this.addAttrs = function (config) {
			Hash.each(config, addAttr);
			return self;
		};
		/**
		 * Returns a key/value paired object with all attributes
		 * @method getAttrs
		 * @return {Hash}
		 */
		this.getAttrs = function () {
			var result = {};
			Hash.each(classConfig, function (key) {
				result[key] = self.get(key);
			});
			return result;
		};
		/**
		 * Returns whether an attribute is set or not
		 * @method isSet
		 * @param {String} attrName
		 * @return {Boolean}
		 */
		this.isSet = function (attrName) {
			return Lang.isValue(classConfig[attrName]);
		};
	};
	extend(Attribute, EventTarget);
	
	/**
	 * Base class for all widgets and utilities.
	 * @class Base
	 * @extends Attribute
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	Base = function () {
		/*
		 * Base should hold basic logic shared among a lot of classes, 
		 * to avoid having to extend the Attribute class which is very specific in what it does
		 */
		Base.superclass.constructor.apply(this, arguments);
		
		var constructor = this.constructor;
		var classes = this._classes = [];
		var i;
		while (constructor != Base.superclass.constructor) {
			classes.unshift(constructor);
			constructor = constructor.superclass.constructor;
		}
		for (i = 0; i < classes.length; i++) {
			this.addAttrs(classes[i].ATTRS || {});
			Hash.each(classes[i].EVENTS || {}, this.on);
			if (classes[i].prototype.initializer) {
				classes[i].prototype.initializer.call(this);
			}
		}
	};
	extend(Base, Attribute, {
		
		initializer: function () {
			Hash.each(this.get("on"), this.on);
		}
		
	}, {
		
		ATTRS: {
			/**
			 * Allows quick setting of custom events in the constructor
			 * @config on
			 */
			on: {
				writeOnce: true,
				value: {}
			}
		},
		
		create: function (superclass, proto, attrs) {
			var BuiltClass = function () {
				BuiltClass.superclass.constructor.apply(this, arguments);
			};
			return extend(BuiltClass, superclass, proto, attrs);
		}
		
	});
	
	/**
	 * Basic class for all utilities
	 * @class Utility
	 * @extends Base
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Utility = function () {
		Utility.superclass.constructor.apply(this, arguments);
	};
	extend(Utility, Base, {
		
		initializer: function () {
			$(this.get('win')).on(UNLOAD, this.destroy);
		},
		
		/**
		 * Calls itself when the window unloads. Allows for easier memory cleanup
		 * @method destroy
		 */
		destroy: function () {
			var self = this;
			if (self.fire(DESTROY)) {
				// Helping gargage collection
				Hash.each(self, function (name) {
					delete self[name];
				});
				$(self.get('win')).unbind(self.destroy);
			}
		},
		
		getClassName: function () {
			return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join('-');
		}
	}, {
		
		CSS_PREFIX: 'jet',
		
		ATTRS: {
			cssPrefix: {
				value: Utility.CSS_PREFIX,
				writeOnce: true
			},
			win: {
				value: $.win,
				setter: function (val) {
					this.set('doc', val.document);
					return val;
				}
			},
			
			doc: {
				value: $.doc,
				setter: function (val) {
					this.set('win', val.parentWindow || val.defaultView);
					return val;
				}
			}
		},
		
		create: function (name, attrs, proto) {
			var built = Base.create(Utility, proto, attrs);
			built.NAME = name;
			return built;
		}
		
	});
	
	/**
	 * Base class for all widgets. 
	 * Provides show, hide, render and destroy methods, the rendering process logic
	 * and basic attributes shared by all widgets 
	 * @class Widget
	 * @extends Base
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Widget = function () {
		Widget.superclass.constructor.apply(this, arguments);
	};
	extend(Widget, Base, {
		
		BOUNDING_TEMPLATE: '<div/>',
		CONTENT_TEMPLATE: '<div/>',
		
		_domEventProxy: function (e) {
			this.fire(e.type, e.target);
		},
		
		initializer: function () {
			$(this.get('win')).on(UNLOAD, bind(this.destroy, this));
		},
		/**
		 * Hides the widget
		 * @method hide
		 * @chainable
		 */
		hide: function () {
			var self = this;
			if (self.fire("hide")) {
				self.get(BOUNDING_BOX).css(VISIBILITY, "hidden");
			}
			return self.fire("afterHide");
		},
		/**
		 * Shows the widget
		 * @method show
		 * @chainable
		 */
		show: function () {
			var self = this;
			if (self.fire("show")) {
				self.get(BOUNDING_BOX).css(VISIBILITY, "visible");
			}
			return self.fire("afterShow");
		},
		/**
		 * Focuses the widget
		 * @method focus
		 * @chainable
		 */
		focus: function () {
			if (this.fire("focus")) {
				this.set("focused", true);
			}
			return this;
		},
		/**
		 * Blurrs the element
		 * @method blur
		 * @chainable
		 */
		blur: function () {
			if (this.fire("blur")) {
				this.set("focused", false);
			}
			return this;
		},
		/**
		 * Starts the rendering process. The rendering process is based on custom events.
		 * The widget class fires a "render" event to which all subclasses must subscribe.
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
			var self = this;
			var boundingBox = this.get(BOUNDING_BOX) || $(this.BOUNDING_TEMPLATE);
			var contentBox = this.get(CONTENT_BOX) || (this.CONTENT_TEMPLATE ? $(this.CONTENT_TEMPLATE) : boundingBox);
			var node = this.get(SRC_NODE);
			var first = node.first(), inner = first.first();
			var construct = this.constructor;
			var className, classPrefix = this.get(CLASS_PREFIX);
			var setDomEvents = function (name, activated) {
				if (activated) {
					boundingBox.on(name, self._domEventProxy, self);
				}
			};
			if (target) {
				node = target;
				self.set(SRC_NODE, target);
			}
			
			if (first[0] && first.attr('nodeName') == boundingBox.attr('nodeName')) {
				boundingBox = first;
			}
			if (inner[0] && this.CONTENT_TEMPLATE !== null && inner.attr('nodeName') == contentBox.attr('nodeName')) {
				contentBox = inner;
			}
			
			A.each([WIDTH, HEIGHT], function (size) {
				var value = self.get(size);
				if (Lang.isNumber(value)) {
					boundingBox[size](value);
				}
				self.on(size + 'Change', function (e, newVal) {
					newVal = Lang.isNumber(newVal) ? newVal : '';
					self.get(BOUNDING_BOX)[size](newVal);
				});
			});
			/**
			 * Render event. Preventing the default behavior will stop the rendering process
			 * @event render
			 * @see Widget.render()
			 */
			if (this.fire("render")) {
				
				while (construct != Widget.superclass.constructor) {
					if (construct.NAME) {
						className = classPrefix + '-' + construct.NAME;
						boundingBox.addClass(className);
						contentBox.addClass(className + '-content');
					}
					Hash.each(construct.DOM_EVENTS || {}, setDomEvents);
					construct = construct.superclass.constructor;
				}
				
				boundingBox.prepend(contentBox.css(VISIBILITY, 'inherit')).prependTo(node).css(VISIBILITY, "visible");
				/**
				 * Fires after the render process is finished
				 * @event afterRender
				 */
				self.set("rendered", true).focus();
				setTimeout(function () {
					self.fire("afterRender");
				}, 0);
			}
			return this;
		},
		/**
		 * Destroys the widget by removing the elements from the dom and cleaning all event listeners
		 * @method destroy
		 */
		destroy: function () {
			var self = this;
			/**
			 * Preventing the default behavior will stop the destroy process
			 * @event destroy
			 */
			if (self.fire(DESTROY)) {
				/*
				 * Avoiding memory leaks, specially in IE
				 */
				self.get(BOUNDING_BOX).unbindAll(true).remove();
				/*
				 * Helping gargage collection
				 */
				Hash.each(self, function (name) {
					delete self[name];
				});
				$(self.get('win')).unbind(self.destroy);
			}
		},
		
		getClassName: function () {
			return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join('-');
		}

	}, {
		
		CSS_PREFIX: "yui",
		
		NAME: 'widget',
		
		DOM_EVENTS: {
			click: 1,
			keypress: 1
		},
		
		ATTRS: {
			/**
			 * @config srcNode
			 * @description The node to which the widget will be appended to. May be set as a 
			 * configuration attribute, with a setter or as the first parameter of the render() method
			 * @type DOMNode | NodeList
			 */
			srcNode: {
				value: $($.context.body),
				setter: $
			},
			/**
			 * @config classPrefix
			 * @description Prefix for all CSS clases. Useful for renaming the project
			 * @default "yui"
			 * @writeOnce
			 */
			classPrefix: {
				writeOnce: true,
				getter: function (val) {
					return val || Widget.CSS_PREFIX;
				}
			},
			/**
			 * @config rendered
			 * @description Rendered status. Shouldn't be changed by anything appart from the Widget.render() method
			 * @writeOnce
			 * @default false
			 */
			rendered: {
				value: false
			},
			/**
			 * The bounding box contains all the parts of the widget
			 * @config boundingBox
			 * @writeOnce
			 * @type NodeList
			 * @default uses BOUNDING_TEMPLATE instance property
			 */
			boundingBox: {
				writeOnce: true
			},
			/**
			 * @config contentBox
			 * @description Another container inside the boundingBox added in order to have a more complex design
			 * @writeOnce
			 * @type NodeList
			 * @default uses CONTENT_TEMPLATE instance property
			 */
			contentBox: {
				writeOnce: true
			},
			win: {
				value: $.win,
				setter: function (val) {
					this.set('doc', val.document);
					return val;
				}
			},
			doc: {
				value: $.doc,
				setter: function (val) {
					this.set('win', val.parentWindow || val.defaultView);
					return val;
				}
			},
			/**
			 * @config width
			 * @description The width of the overlay
			 * @type Number
			 * @default 300
			 */
			width: {
				value: 300,
				validator: Lang.isNumber
			},
			/**
			 * @config height
			 * @description The height of the overlay.
			 * If set to 0 (zero) the height changes with the content
			 * @type Number
			 * @default 0
			 */
			height: {
				value: 0,
				validator: Lang.isNumber
			}
		},
		
		/**
		 * @method create
		 * @description creates a new widget class
		 * @static
		 * @param [String] name Name of the widget class to create
		 * @param [Array] [Optional] extensions A list of extensions to apply to the created class
		 * @param [Hash] events [Optional] Event definitions 
		 * @param [Hash] attrs [Optional] Attribute definitions 
		 * @param [Hash] proto [Optional] Prototype properties to add
		 * @param [Function] superclass [Optional] Superclass to use. Default: Widget
		 */
		create: function (name, extensions, attrs, events, proto, superclass) {
			extensions = extensions || [];
			function BuiltWidget() {
				var args = arguments;
				BuiltWidget.superclass.constructor.apply(this, args);
				var self = this;
				A.each(extensions, function (extension) {
					extension.apply(self, args);
					Hash.each(extension.EVENTS || {}, self.on);
				});
			}
			extend(BuiltWidget, superclass || Widget);
			$.mix(BuiltWidget, {
				NAME: name,
				EVENTS: events,
				ATTRS: attrs,
				exts: extensions
			});
			A.each(extensions, function (extension) {
				$.mix(BuiltWidget.prototype, extension.prototype);
				$.mix(BuiltWidget.ATTRS, extension.ATTRS || {});
			});
			return BuiltWidget;
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
	var Mouse = function () {
		Mouse.superclass.constructor.apply(this, arguments);

		var clientX, clientY;
		var prevX, prevY;
		var interval;
		var capturing = false;
		
		var shim = $([]);
		var iframes;
		
		var self = this.addAttrs({
			/**
			 * Frequency at which the tracker updates
			 * @config frequency
			 * @default 20 (ms)
			 * @type Number
			 */
			frequency: {
				value: 20
			},
			context: {
				getter: function () {
					return this.get('doc');
				}
			},
			shields: {
				readOnly: true,
				getter: function () {
					return shim;
				}
			}
		});
		
		/**
		 * Tracking status. Set it to true to start tracking
		 * @config tracking
		 * @type Boolean
		 * @default false
		 */
		self.addAttr(TRACKING, {
			value: false,
			validator: Lang.isBoolean
			
		}).on(TRACKING + "Change", function (e, value) {
			if (value) {
				if (self.get("shim")) {
					var list = [];
					iframes = $("iframe").each(function (iframe) {
						iframe = $(iframe);
						var offset = iframe.offset();
						list.push($("<div/>").height(offset.height).width(offset.width).css({
							position: "absolute",
							left: offset.left,
							top: offset.top
						}).hide().appendTo($.context.body)[0]);
					});	
					shim = $(list);
				}
				if (!capturing) {
					shim.show();
					interval = setInterval(function () {
						if (prevX != clientX || prevY != clientY) {
							self.fire(MOUSEMOVE, clientX, clientY);
							prevX = clientX;
							prevY = clientY;
						}
					}, self.get(FREQUENCY));
					capturing = true;
				}
			} else {
				shim.hide();
				clearInterval(interval);
				capturing = false;
			}
		});
		
		function onSelectStart(e) {
			if (capturing) {
				e.preventDefault();
			}
		}
		
		function onMouseMove(e) {
			clientX = e.clientX;
			clientY = e.clientY;
			if (self.get(TRACKING) && self.get("shim")) {
				iframes.each(function (iframe, i) {
					iframe = $(iframe);
					var offset = iframe.offset();
					$(shim[i]).height(offset.height).width(offset.width).css({
						left: offset.left + "px",
						top: offset.top + "px"
					});
				});
			}
		}
		
		function onMouseUp() {
			/**
			 * Fires when the mouse button is released
			 * @event up
			 */
			self.set(TRACKING, false).fire("up", clientX, clientY);
		}
		
		
		/**
		 * Fires not when the mouse moves, but in an interval defined by the frequency attribute
		 * This way you can track the mouse position without breakin the browser's rendering engine
		 * because the native mousemove event fires too quickly
		 * @event move
		 */
		shim.on(MOUSEMOVE, onMouseMove).on(MOUSEUP, onMouseUp);
		
		$(this.get('context')).on("selectstart", onSelectStart).on(MOUSEMOVE, onMouseMove).on(MOUSEUP, onMouseUp);
		self.on('contextChange', function (e, newVal, prevVal) {
			$(prevVal).unbind("selectstart", onSelectStart).unbind(MOUSEMOVE, onMouseMove).unbind(MOUSEUP, onMouseUp);
			$(newVal).on("selectstart", onSelectStart).on(MOUSEMOVE, onMouseMove).on(MOUSEUP, onMouseUp);
		}).on(DESTROY, function () {
			shim.unbindAll();
		});
	};
	extend(Mouse, Utility, {
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
	
	$.add({
		Mouse: Mouse,
		Attribute: Attribute,
		Base: Base,
		Utility: Utility,
		Widget: Widget,
		EventTarget: EventTarget,
		extend: extend,
		bind: bind
	});
});