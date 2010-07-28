jet().add('base', function ($) {
	
	var TRUE = true,
		FALSE = false,
		OP = Object.prototype;

	var Hash = $.Hash,
		Lang = $.Lang,
		ArrayHelper = $.Array;
	
	/**
	 * A more traditional random number function.
	 * Returns an integer between 0 and "num"
	 *  
	 * @param {Number} integer
	 */
	$.random = function (num) {
		num = Math.random() * num;
		return num === 0 ? 0 : Math.ceil(num) - 1;
	};
		
	/**
	 * Copies every property from b into a's prototype, except for the "constructor" property
	 * 
	 * @param {Function} a
	 * @param {Object} b
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
	
	var BOUNDING_BOX = 'boundingBox',
		SRC_NODE = "srcNode",
		UNLOAD = "unload",
		VISIBILITY = "visibility",
		DESTROY = "destroy",
		TRACKING = "tracking",
		MOUSEMOVE = "mousemove",
		FREQUENCY = "frequency";
	
	/**
	 * Object function by Douglas Crockford
	 * https://docs.google.com/viewer?url=http://javascript.crockford.com/hackday.ppt&pli=1
	 * 
	 * @param {Object} o
	 */
	$.Object = function (o) {
		var F = function () {};
		F.prototype = o;
		return new F();
	};
	
	/**
	 * From the guys at YUI (Thanks! This function is GENIUS!)
     * 
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     *
     * @method extend
     * @param {Function} r   the object to modify
     * @param {Function} s the object to inherit
     * @param {Object} px prototype properties to add/override
     * @param {Object} sx static properties to add/override
     */
    var extend = function (r, s, px) {
        if (!s || !r) {
            // @TODO error symbols
            $.error("extend failed, verify dependencies");
        }

        var sp = s.prototype, rp = $.Object(sp);
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

    };
	
	/**
	 * A class designed to be inherited or augmented into other classes and provide custom events
	 * 
	 */
	var EventTarget = function () {
		var collection = {};
		
		var myself = this;
		
		myself.on = function (eventType, callback) {
			if (!collection[eventType]) {
				collection[eventType] = [];
			}
			collection[eventType].push(callback);
			return myself;
		};
		
		myself.unbind = function (eventType, callback) {
			$.Array.remove(callback, collection[eventType] || []);
			return myself;
		};
		
		myself.fire = function (eventType) {
			var handlers = collection[eventType] || [];
			var prevent = TRUE;
			if (collection["*"]) {
				handlers = handlers.concat(collection["*"]);
			}
			var i, collecLength = handlers.length, args = Array.prototype.slice.call(arguments, 1);
			var stop = FALSE;
			args.unshift({
				stopPropagation: function () {
					stop = TRUE;
				},
				preventDefault: function () {
					prevent = FALSE;
				},
				type: eventType
			});
			for (i = 0; i < collecLength; i++) {
				handlers[i].apply(this, args);
				if (stop) {
					break;
				}
			}
			return prevent;
		};
		myself.unbindAll = function () {
			collection = {};
			return myself;
		};
	};
	
	/**
	 * ATTRIBUTE PROVIDER
	 * 
	 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
	 * 
	 * @class Attribute
	 * @param {Object} classConfig
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
		 * 
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
		 * 
		 * @param {String} attrName
		 * @param {Object} attrValue
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
		 * 
		 * @param {String} attrName
		 */
		myself.unset = function (attrName) {
			delete classConfig[attrName];
		};
		/**
		 * @param {String} attrName
		 * @param {Hash} config
		 */
		myself.addAttr = addAttr;
		/**
		 * 
		 * @param {Hash} config - key/value pairs of attribute names and configs
		 */
		myself.addAttrs = function (config) {
			Hash.each(config, addAttr);
			return myself;
		};
		/**
		 * Returns a key/value paired object with all attributes
		 * 
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
		 * 
		 * @param {String} attrName
		 * @return {Boolean}
		 */
		myself.isSet = function (attrName) {
			return Lang.isValue(classConfig[attrName]);
		};
	};
	extend(Attribute, EventTarget);
	
	var Base = function () {
		Base.superclass.constructor.apply(this, arguments);
		
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
	 * Base class for all utilities
	 */
	var Utility = function () {
		Utility.superclass.constructor.apply(this, arguments);
		var myself = this;
		
		$($.win).on(UNLOAD, function () {
			myself.destructor();
		}); 
	};
	extend(Utility, Base, {
		destructor: function () {
			var myself = this;
			if (myself.fire(DESTROY)) {
				/*
				 * Helping gargage collection
				 */
				Hash.each(myself, function (name) {
					delete myself[name];
				});
			}
		}
	});
	
	/**
	 * Base class for all widgets
	 */
	var Widget = function () {
		Widget.superclass.constructor.apply(this, arguments);
		var myself = this.addAttrs({
			srcNode: {
				setter: $
			},
			classPrefix: {
				value: "yui-"
			},
			className: {
				value: "widget"
			},
			rendered: {
				writeOnce: TRUE,
				value: FALSE
			}
		}).addAttr("boundingBox", {
			readOnly: TRUE,
			value: $("<div/>")
		});
		
		$($.win).on(UNLOAD, function () {
			myself.destroy();
		}); 
	};
	extend(Widget, Base, {
		hide: function () {
			var myself = this;
			if (myself.fire("hide")) {
				myself.get(BOUNDING_BOX).css(VISIBILITY, "hidden");
			}
			return myself;
		},
		show: function () {
			var myself = this;
			if (myself.fire("show")) {
				myself.get(BOUNDING_BOX).css(VISIBILITY, "visible");
			}
			return myself;
		},
		render: function (target) {
			var myself = this;
			if (target) {
				myself.set(SRC_NODE, target);
			}
			if (myself.fire("render")) {
				var node = myself.get(SRC_NODE);
				myself.get(BOUNDING_BOX).addClass(myself.get("classPrefix") + myself.get("className") + "-container").appendTo(node).css(VISIBILITY, "visible");
				myself.set("rendered", TRUE);
				myself.fire("afterRender");
			}
			return myself;
		},
		destroy: function () {
			var myself = this;
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
	
	var MouseTracker = function () {
		MouseTracker.superclass.constructor.apply(this, arguments);
		var myself = this.addAttr(FREQUENCY, {
			value: 20
		});
		
		var clientX, clientY;
		var interval;
		var capturing = FALSE;
		
		var shim = $("<div/>").css({
			position: "absolute",
			top: "0px",
			left: "0px",
			zIndex: 2147483647
		});
		
		myself.addAttr("shim", {
			readOnly: TRUE,
			value: shim
		}).addAttr(TRACKING, {
			value: FALSE,
			validator: Lang.isBoolean
			
		}).on(TRACKING + "Change", function (e, value) {
			if (value) {
				if (!capturing) {
					var screenSize = $.screenSize();
					shim.height(screenSize.height).width(screenSize.width).appendTo($.context.body);
					interval = setInterval(function () {
						myself.fire(MOUSEMOVE, clientX, clientY);
					}, myself.get(FREQUENCY));
					capturing = TRUE;
				}
			} else {
				shim.remove(TRUE);
				clearInterval(interval);
				capturing = FALSE;
			}
		});
		
		$($.context).on("selectstart", function (e) {
			if (capturing) {
				e.preventDefault();
			}
		});
		shim.on(MOUSEMOVE, function (e) {
			clientX = e.clientX;
			clientY = e.clientY;
		}).on("mouseup", function () {
			myself.set(TRACKING, FALSE).fire("mouseup", clientX, clientY);
		});
		
		myself.on(DESTROY, function () {
			shim.unbindAll();
		});
	};
	extend(MouseTracker, Utility);
	
	if (!$.utils) {
		$.utils = {};
	}
	$.utils.MouseTracker = MouseTracker;
	
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