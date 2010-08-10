/**
 * The Base module provides base classes for Utilities and Widgets.
 * @module base
 * @requires lang, dom
 */
jet().add('base', function ($) {
	
	var TRUE = true,
		FALSE = false,
		OP = Object.prototype;

	var Hash = $.Hash,
		Lang = $.Lang,
		ArrayHelper = $.Array,
		extend = $.extend;

	/**
	 * Utilities for object oriented programming in JavaScript.
	 * JET doesn't provide a classical OOP environment like Prototype with Class methods,
	 * but instead it helps you take advantage of JavaScript's own prototypical OOP strategy
	 * @class OOP
	 * @static
	 */
	/**
	 * Allows for an inheritance strategy based on prototype chaining.
	 * When exteiding a class with extend, you keep all prototypic methods from all superclasses
	 * @method extend
	 * @param {Function} subclass
	 * @param {Function} superclass
	 * @param {Hash} optional - An object literal with methods to overwrite in the subclass' prototype
	 */
	/**
	 * Augments a class with the functionality of another, without chaining prototypes
	 * @method augment
	 * @param {Function} subclass
	 * @param {Function|Object} augmenter
	 * @param {Boolean} overwrite
	 */
	var augment = function (A, B, overwrite) {
		if (Lang.isFunction(B)) {
			B = new B();
		}
		var copy = function (name, method) {
			if ((!A.prototype[name] || overwrite) && name != "constructor") {
				A.prototype[name] = method;
			}
		};
		Hash.each(B, copy);
		if (B.constructor != Object) {
			Hash.each(B.prototype, copy);
		}
	};
	
	var BOUNDING_BOX = "boundingBox",
		SRC_NODE = "srcNode",
		UNLOAD = "unload",
		VISIBILITY = "visibility",
		DESTROY = "destroy",
		TRACKING = "tracking",
		MOUSEMOVE = "mousemove",
		FREQUENCY = "frequency";

	
	/**
	 * A class designed to be inherited or augmented into other classes and provide custom events
	 * @class EventTarget
	 * @constructor
	 */
	var EventTarget = function () {
		var collection = {};
		
		var myself = this;
		
		/**
		 * Adds an event listener
		 * @method on
		 * @param {String} eventType
		 * @param {Function} callback
		 * @chainable
		 */
		myself.on = function (eventType, callback) {
			if (!collection[eventType]) {
				collection[eventType] = [];
			}
			if (Lang.isObject(callback)) {
				collection[eventType].push(callback);
			}
			return myself;
		};
		
		/**
		 * Removes and event listener
		 * @method unbind
		 * @param {String} eventType
		 * @param {Function} callback
		 * @chainable
		 */
		myself.unbind = function (eventType, callback) {
			$.Array.remove(callback, collection[eventType] || []);
			return myself;
		};
		
		/**
		 * Fires an event, executing all its listeners
		 * @method fire
		 * @param {String} eventType
		 * Extra parameters will be passed to all event listeners
		 */
		myself.fire = function (eventType) {
			var handlers = collection[eventType] || [];
			var returnValue = TRUE;
			if (collection["*"]) {
				handlers = handlers.concat(collection["*"]);
			}
			var i, collecLength = handlers.length;
			var stop = FALSE;
			var args = Array.prototype.slice.call(arguments, 1);
			args.unshift({
				stopPropagation: function () {
					stop = TRUE;
				},
				preventDefault: function () {
					returnValue = FALSE;
				},
				type: eventType,
				target: myself
			});
			for (i = 0; i < collecLength; i++) {
				if (Lang.isFunction(handlers[i])) {
					handlers[i].apply(myself, args);
				// if the event handler is an object with a handleEvent method,
				// that method is used but the context is the object itself
				} else if (handlers[i].handleEvent) {
					handlers[i].handleEvent.apply(handlers[i], args);
				}
				if (stop) {
					break;
				}
			}
			return returnValue;
		};
		
		/**
		 * Removes all event listeners of all types
		 * @method unbindAll
		 * @chainable
		 */
		myself.unbindAll = function () {
			collection = {};
			return myself;
		};
	};
	
	/**
	 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
	 * @class Attribute
	 * @uses EventTarget
	 * @constructor
	 */
	var Attribute = function (classConfig) {
		Attribute.superclass.constructor.apply(this);
		classConfig = classConfig || {};
		var myself = this;
		
		var attrConfig = {};
		
		var addAttr = function (attrName, config) {
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
				classConfig[attrName] = config.setter.call(myself, classConfig[attrName]);
			}
			return myself;
		};
		
		var set = function (attrName, attrValue) {
			attrConfig[attrName] = attrConfig[attrName] || {};
			var config = attrConfig[attrName];
			if (!config.readOnly) {
				if (!config.validator || config.validator(attrValue)) {
					attrValue = config.setter ? config.setter.call(myself, attrValue) : attrValue;
					if (!Lang.isValue(classConfig[attrName]) && config.value) {
						classConfig[attrName] = config.value;
					}
					classConfig[attrName] = classConfig[attrName] == attrValue ? attrValue :
											myself.fire(attrName + "Change", attrValue) ? attrValue :
											classConfig[attrName];
				}
				if (config.writeOnce && !config.readOnly) {
					attrConfig[attrName].readOnly = TRUE;
				}
			} else {
				$.error(attrName + " is a " + (config.writeOnce ? "write-once" : "read-only") + " attribute");
			}
		};
		
		/**
		 * Returns a configuration attribute
		 * @method get
		 * @param {String} attrName
		 */	
		myself.get = function (attrName) {
			attrConfig[attrName] = attrConfig[attrName] || {};
			var config = attrConfig[attrName];
			/*
			 * If it is write-once and it wasn't set before, use the default value and mark it as written (readOnly works as written)
			 */
			if (config.writeOnce && !config.readOnly) {
				attrConfig[attrName].readOnly = TRUE;
			}
			if (!Lang.isValue(classConfig[attrName])) {
				classConfig[attrName] = config.value;
			}
			return	config.getter ? config.getter.call(myself, classConfig[attrName], attrName) :
					classConfig[attrName];
		};
		/**
		 * Sets a configuration attribute
		 * @method set
		 * @param {String} attrName
		 * @param {Object} attrValue
		 * @chainable
		 */
		myself.set = function (attrName, attrValue) {
			if (Lang.isHash(attrName)) {
				Hash.each(attrName, function (name, value) {
					set(name, value);
				});
			} else {
				set(attrName, attrValue);
			}
			return myself;
		};
		/**
		 * Unsets a configuration attribute
		 * @method unset
		 * @param {String} attrName
		 * @chainable
		 */
		myself.unset = function (attrName) {
			delete classConfig[attrName];
			return myself;
		};
		/**
		 * Adds a configuration attribute, along with its options
		 * @method addAttr
		 * @param {String} attrName
		 * @param {Hash} config
		 * @chainable
		 */
		myself.addAttr = addAttr;
		/**
		 * Adds several configuration attributes
		 * @method addAttrs
		 * @param {Hash} config - key/value pairs of attribute names and configs
		 * @chainable
		 */
		myself.addAttrs = function (config) {
			Hash.each(config, addAttr);
			return myself;
		};
		/**
		 * Returns a key/value paired object with all attributes
		 * @method getAttrs
		 * @return {Hash}
		 */
		myself.getAttrs = function () {
			var result = {};
			Hash.each(classConfig, function (key) {
				result[key] = myself.get(key);
			});
			return result;
		};
		/**
		 * Returns whether an attribute is set or not
		 * @method isSet
		 * @param {String} attrName
		 * @return {Boolean}
		 */
		myself.isSet = function (attrName) {
			return Lang.isValue(classConfig[attrName]);
		};
	};
	augment(Attribute, EventTarget);
	
	/**
	 * Base class for all widgets and utilities.
	 * @class Base
	 * @extends Attribute
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	/*
	 * Base should hold basic logic shared among a lot of classes, 
	 * to avoid having to extend the Attribute class which is very specific in what it does
	 */
	var Base = function () {
		Base.superclass.constructor.apply(this, arguments);
		
		/**
		 * Allows quick setting of custom events in the constructor
		 * @config on
		 */
		var myself = this.addAttr("on", {
			writeOnce: TRUE,
			value: {}
		});
		
		Hash.each(myself.get("on"), function (type, fn) {
			myself.on(type, fn);
		});
	};
	extend(Base, Attribute);
	
	/**
	 * Basic class for all utilities
	 * @class Utility
	 * @extends Base
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Utility = function () {
		Utility.superclass.constructor.apply(this, arguments);
		var myself = this;
		
		$($.win).on(UNLOAD, function () {
			myself.destroy();
		}); 
	};
	extend(Utility, Base, {
		/**
		 * Calls itself when the window unloads. Allows for easier memory cleanup
		 * @method destroy
		 */
		destroy: function () {
			var myself = this;
			if (myself.fire(DESTROY)) {
				// Helping gargage collection
				Hash.each(myself, function (name) {
					delete myself[name];
				});
			}
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
		var myself = this.addAttrs({
			/**
			 * @config srcNode
			 * @description The node to which the widget will be appended to. May be set as a 
			 * configuration attribute, with a setter or as the first parameter of the render() method
			 * @type DOMNode | NodeList
			 */
			srcNode: {
				setter: $
			},
			/**
			 * @config classPrefix
			 * @description Prefix for all CSS clases. Useful for renaming the project
			 * @default "yui-"
			 */
			classPrefix: {
				value: Widget.CSS_PREFIX + "-"
			},
			/**
			 * @config className
			 * @description The class name applied along with the prefix to the boundingBox
			 * @default "widget"
			 */
			className: {
				value: "widget"
			},
			/**
			 * @config rendered
			 * @description Rendered status. Shouldn't be changed by anything appart from the Widget.render() method
			 * @writeOnce
			 * @default false
			 */
			rendered: {
				writeOnce: TRUE,
				value: FALSE
			}
			/**
			 * The bounding box contains all the parts of the widget
			 * @config boundingBox
			 * @writeOnce
			 * @type NodeList
			 * @default <div/>
			 */
		}).addAttr(BOUNDING_BOX, {
			readOnly: TRUE,
			value: $("<div/>")
		});
		
		/*
		 * Call the destroy method when the window unloads.
		 * This allows for the removal of all event listeners from the widget's nodes,
		 * avoiding memory leaks and helping garbage collection 
		 */ 
		$($.win).on(UNLOAD, function () {
			myself.destroy();
		}); 
	};
	extend(Widget, Base, {
		/**
		 * Hides the widget
		 * @method hide
		 * @chainable
		 */
		hide: function () {
			var myself = this;
			if (myself.fire("hide")) {
				myself.get(BOUNDING_BOX).css(VISIBILITY, "hidden");
			}
			return myself;
		},
		/**
		 * Shows the widget
		 * @method show
		 * @chainable
		 */
		show: function () {
			var myself = this;
			if (myself.fire("show")) {
				myself.get(BOUNDING_BOX).css(VISIBILITY, "visible");
			}
			return myself;
		},
		/**
		 * Starts the rendering process. The rendering process is based on custom events.
		 * The widget class fires a "render" event to which all subclasses must subscribe.
		 * This way all listeners are fired in the order of the inheritance chain. ie:
		 * In the Overlay class, the render process is:
		 * <code>render() method -> Module listener -> Overlay listener -> rest of the render() method (appends the boundingBox to the srcNode)</code>
		 * This helps use an easy pattern of OOP CSS: each subclass adds a CSS class name to the boundingBox,
		 * for example resulting in <div class="jet-module jet-overlay jet-panel"></div>. That way
		 * a panel can inherit css properties from module and overlay.
		 * @method render
		 * @param {NodeList|HTMLElement} target
		 * @chainable
		 */
		render: function (target) {
			var myself = this;
			if (target) {
				myself.set(SRC_NODE, target);
			}
			/**
			 * Render event. Preventing the default behavior will stop the rendering process
			 * @event render
			 * @see Widget.render()
			 */
			if (myself.fire("render")) {
				var node = myself.get(SRC_NODE);
				myself.get(BOUNDING_BOX).addClass(myself.get("classPrefix") + myself.get("className") + "-container").appendTo(node).css(VISIBILITY, "visible");
				myself.set("rendered", TRUE);
				/**
				 * Fires after the render process is finished
				 * @event afterRender
				 */
				myself.fire("afterRender");
			}
			return myself;
		},
		/**
		 * Destroys the widget by removing the elements from the dom and cleaning all event listeners
		 * @method destroy
		 */
		destroy: function () {
			var myself = this;
			/**
			 * Preventing the default behavior will stop the destroy process
			 * @event destroy
			 */
			if (myself.fire(DESTROY)) {
				/*
				 * Avoiding memory leaks, specially in IE
				 */
				myself.get(BOUNDING_BOX).unbindAll(TRUE).remove();
				/*
				 * Helping gargage collection
				 */
				Hash.each(myself, function (name) {
					delete myself[name];
				});
			}
		}
	});
	Widget.CSS_PREFIX = "yui";
	
	/**
	 * A utility for tracking the mouse movement without crashing the browser rendering engine.
	 * Also allows for moving the mouse over iframes and other pesky elements
	 * @namespace utils
	 * @class Mouse
	 * @constructor
	 * @extends Utility
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var Mouse = function () {
		Mouse.superclass.constructor.apply(this, arguments);
		/**
		 * Frequency at which the tracker updates
		 * @config frequency
		 * @default 20 (ms)
		 * @type Number
		 */
		var myself = this.addAttr(FREQUENCY, {
			value: 20
		});
		
		var clientX, clientY;
		var interval;
		var capturing = FALSE;
		
		var shim = new $.NodeList([]);
		var iframes;
		
		/**
		 * Tracking status. Set it to true to start tracking
		 * @config tracking
		 * @type Boolean
		 * @default false
		 */
		myself.addAttr(TRACKING, {
			value: FALSE,
			validator: Lang.isBoolean
			
		}).on(TRACKING + "Change", function (e, value) {
			if (value) {
				if (myself.get("shim")) {
					shim.splice(0, shim.length);
					iframes = $("iframe").each(function (iframe) {
						var offset = iframe.offset();
						shim.push($("<div/>").height(offset.height).width(offset.width).css({
							position: "absolute",
							left: offset.left,
							top: offset.top
						}).hide().appendTo(iframe.parent())[0]);
					});	
				}
				if (!capturing) {
					shim.show();
					interval = setInterval(function () {
						myself.fire(MOUSEMOVE, clientX, clientY);
					}, myself.get(FREQUENCY));
					capturing = TRUE;
				}
			} else {
				shim.hide();
				clearInterval(interval);
				capturing = FALSE;
			}
		});
		
		$($.context).on("selectstart", function (e) {
			if (capturing) {
				e.preventDefault();
			}
		});
		
		/**
		 * Fires not when the mouse moves, but in an interval defined by the frequency attribute
		 * This way you can track the mouse position without breakin the browser's rendering engine
		 * because the native mousemove event fires too quickly
		 * @event move
		 */
		shim.link($($.context), TRUE).on(MOUSEMOVE, function (e) {
			clientX = e.clientX;
			clientY = e.clientY;
			if (myself.get(TRACKING) && myself.get("shim")) {
				iframes.each(function (iframe, i) {
					var offset = iframe.offset();
					shim[i].height(offset.height).width(offset.width).css({
						left: offset.left + "px",
						top: offset.top + "px"
					});
				});
			}
		}).on("mouseup", function () {
			/**
			 * Fires when the mouse button is released
			 * @event up
			 */
			myself.set(TRACKING, FALSE).fire("up", clientX, clientY);
		});
		
		myself.on(DESTROY, function () {
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
			return this.set(TRACKING, TRUE);
		},
		/**
		 * Stop tracking. Equivalent to setting the tracking attribute to false
		 * Simulates the mouseup event
		 * @method up
		 * @chainable
		 */
		up: function () {
			return this.set(TRACKING, FALSE);
		}
	});
	
	$.utils.Mouse = Mouse;
	
	$.add({
		Attribute: Attribute,
		Base: Base,
		Utility: Utility,
		Widget: Widget,
		EventTarget: EventTarget,
		augment: augment,
		extend: extend
	});
});