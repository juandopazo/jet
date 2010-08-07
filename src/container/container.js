/**
 * Contains widgets that act as containers, windows, dialogs 
 * @module container
 * @requires jet, lang, node, base, form
 */
jet().add("container", function ($) {
	
	var TRUE = true,
		FALSE = false,
		Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;
	
	// definitions for better minification
	var BOUNDING_BOX = "boundingBox",
		CONTENT_BOX = "contentBox",
		UNDERLAY = "underlay",
		CLASS_PREFIX = "classPrefix",
		HEADER = "header",
		BODY = "body",
		FOOTER = "footer",
		CLASS_NAME = "className",
		ACCEPT = "accept",
		CANCEL = "cancel",
		AFTER = "after",
		CLICK = "click",
		CLOSE = "close",
		RENDER = "render",
		CENTER = "center",
		BUTTON = "button",
		HEIGHT = "height",
		WIDTH = "width",
		PX = "px",
		LEFT = "left",
		RIGHT = "right",
		TOP = "top",
		BOTTOM = "bottom",
		AUTO = "auto",
		DIV = "div",
		NEW_DIV = "<div/>",
		FIXED = "fixed",
		SHADOW = "shadow",
		VISIBILITY = "visibility",
		RESIZE = "resize",
		SCROLL = "scroll",
		NEW_SPAN = "<span/>",
		TYPE = "type",
		PRESSED = "pressed",
		OPTION = "option",
		OPTIONS = "options",
		COMBO = "combo";
	
	// true if the UA supports the value 'fixed' for the css 'position' attribute
	var UA_SUPPORTS_FIXED = (!$.UA.ie || $.UA.ie < 8);
	
	/**
	 * A button may be a push button, a radio button or other form elements that behave as buttons
	 * @class Button
	 * @constructor
	 * @extends Widget
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Button = function () {
		Button.superclass.constructor.apply(this, arguments);
		var myself = this.set(CLASS_NAME, BUTTON).addAttrs({
			/**
			 * @attribute type
			 * @type String
			 * @writeOnce
			 * @default "push"
			 */
			type: {
				writeOnce: TRUE,
				value: "push"
			},
			// overwrite standard boundingBox (a div) with a span
			// maybe all widgets should use a span with display: inline-block as a boundingBox?
			boundingBox: {
				readOnly: TRUE,
				value: $(NEW_SPAN)
			},
			//overwrite standard contentBox (a div) with a span
			contentBox: {
				readOnly: TRUE,
				value: $(NEW_SPAN)
			}
		});
		var type = myself.get(TYPE);
		var tag =	type == "push" ? "button" :
					type == "link" ? "a" : "a";
		
		/**
		 * The button node
		 * @attribute buttoNode
		 * @readOnly
		 * 
		 */
		myself.addAttr("buttonNode", {
			readOnly: TRUE,
			value: $("<" + tag + "/>")
		});
		
		myself.on(RENDER, function () {
			var node = myself.get("buttonNode").html(myself.get("text"));
			var prefix = myself.get(CLASS_PREFIX);
			var boundingBox = myself.get(BOUNDING_BOX).addClass(prefix + Button.NAME, prefix + type + "-" + Button.NAME);
			var contentBox = myself.get(CONTENT_BOX).addClass("first-child");
			node.on("mouseover", function () {
				boundingBox.addClass(prefix + Button.NAME + "-hover", prefix + type + Button.NAME + "-hover");
			}).on("mouseout", function () {
				boundingBox.removeClass(prefix + Button.NAME + "-hover", prefix + type + Button.NAME + "-hover");
			}).on("focus", function () {
				boundingBox.addClass(prefix + Button.NAME + "-focus", prefix + type + Button.NAME + "-focus");
			}).on("blur", function () {
				boundingBox.removeClass(prefix + Button.NAME + "-focus", prefix + type + Button.NAME + "-focus");
			}).on(CLICK, function (e) {
				node[0].blur();
				if (myself.fire(PRESSED)) {
					e.preventDefault();
				}
			});
			node.appendTo(contentBox.appendTo(boundingBox));
		});
		myself.on("afterRender", function () {
			// since the order of the nodes was changed, use visibility inherit to avoid breaking the hide() method
			myself.get(BOUNDING_BOX).css(VISIBILITY, "inherit");
		});
	};
	Button.NAME = "button";
	$.extend(Button, $.Widget, {
		/**
		 * Disables the button
		 * @method disable
		 * @chainable
		 */
		disable: function () {
			
		},
		/**
		 * Enables the button
		 * @method enable
		 * @chainable
		 */
		enable: function () {
			
		},
		/**
		 * Fires the blur event
		 * @method blur
		 * @chainable
		 */
		blur: function () {
			
		},
		/**
		 * Fires the focus event and sets the button as active
		 * @method focus
		 * @chainable
		 */
		focus: function () {
			
		}
	});
	
	var addOption = function (combo, text, value) {
		/* Note by jdopazo:
		 Lazy initialization for the function _add()
		 I create a <select> element that I never attach to the dom
		 and try to attach an <OPTION> element to it with try...catch
		 This way I avoid using try...catch every time this function is called */
		var doc = $.context,
			testSelect = doc.createElement("select"),
			testOption = doc.createElement(OPTION),
			standards = FALSE;
		try {
			testSelect.add(testOption, null); //standards compliant
			standards = TRUE;
		} catch (ex) {
			testSelect.add(testOption); // IE only
		}
		if (standards) {
			addOption = function (combo, text, value) {
				var newOption = doc.createElement(OPTION);
				newOption.text = text;
				if (value) {
					newOption.value = value;
				}
				combo.add(newOption, null);
			};
		} else {
			addOption = function (combo, text, value) {
				var newOption = doc.createElement(OPTION);
				newOption.text = text;
				if (value) {
					newOption.value = value;
				}
				combo.add(newOption);
			};
		}
		addOption(combo, text, value);
	};
	
	var ComboBox = function () {
		ComboBox.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			options: {
				value: []
			},
			combo: {
				readOnly: TRUE,
				value: $("<select/>")
			}
		});
		
		var setOptions = function (combo, opts) {
			A.each(opts, function (value) {
				if (Lang.isHash(value)) {
					Hash.each(value, function (text, val) {
						addOption(combo, text, val);
					});
				} else {
					addOption(combo, value);
				}
			});
		};
		
		myself.on("optionsChange", function (e, newOptions) {
			var combo = myself.get(COMBO)[0];
			combo.options.length = 0;
			setOptions(combo, newOptions);
		});
		setOptions(myself.get(COMBO)[0], myself.get(OPTIONS));
		
		myself.on("render", function () {
			myself.get(COMBO).appendTo(myself.get(BOUNDING_BOX));
		});
	};
	$.extend(ComboBox, $.Widget, {
		add: function (text, value) {
			var myself = this;
			var opt;
			if (value) {
				opt = {};
				opt[text] = value;
			} else {
				opt = text;
			}
			myself.get("options").push(opt);
			addOption(myself.get(COMBO)[0], text, value);
			return myself;
		},
		fill: function (values) {
			var myself = this;
			if (Lang.isArray(values)) {
				A.each(values, function (t) {
					myself.add(t);
				});
			} else {
				Hash.each(values, myself.add);
			}
			return myself;
		},
		clear: function () {
			return this.set("options", []);
		}
	});
	
	/**
	 * @class Module
	 * @description A module is a basic container with header, body and footer
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Module = function () {
		Module.superclass.constructor.apply(this, arguments);
		var myself = this;
		
		var containers = {};
		var containerSetter = function (type) {
			return function (value) {
				var container = containers[type];
				if (!container) {
					container = $(NEW_DIV);
				}
				container.children().remove();
				if (Lang.isString(value)) {
					container.html(value);
				} else {
					container.append(value);
				}
				containers[type] = container;
				return container;
			};
		};
		myself.addAttrs({
			/**
			 * @attribute header
			 * @description The header of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * @type DOM Node | String | NodeList
			 */
			header: {
				setter: containerSetter(HEADER),
				validator: Lang.isValue
			},
			/**
			 * @attribute body
			 * @description The body of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * A body is always present in a Module
			 * @type DOM Node | String | NodeList
			 * @default ""
			 */
			body: {
				value: "",
				setter: containerSetter(BODY),
				validator: Lang.isValue
			},
			/**
			 * @attribute footer
			 * @description The footer of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * @type DOM Node | String | NodeList
			 */
			footer: {
				setter: containerSetter(FOOTER),
				validator: Lang.isValue
			}
		});
		myself.set(CLASS_NAME, Module.NAME);
					
		// rendering process	
		myself.on(RENDER, function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			// append the header, body and footer to the bounding box if present
			Hash.each(containers, function (name, container) {
				container.addClass(name).appendTo(boundingBox);
			});
		});
	};
	Module.NAME = "module";
	$.extend(Module, $.Widget);
	
	/**
	 * @class Overlay
	 * @description An Overlay is a Module that floats in the page (doesn't have position static)
	 * @extends Module
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Overlay = function () {
		Overlay.superclass.constructor.apply(this, arguments);
		var myself = this.addAttrs({
			/**
			 * @attribute center
			 * @description If true, the overlay is positioned in the center of the page
			 * @type Boolean
			 * @default true
			 */
			center: {
				value: TRUE
			},
			/**
			 * @attribute fixed
			 * @description If true, the overlay is position is set to fixed
			 * @type Boolean
			 * @default false
			 */
			fixed: {
				value: FALSE
			},
			/**
			 * @attribute width
			 * @description The width of the overlay
			 * @type Number
			 * @default 300
			 */
			width: {
				value: 300,
				validator: Lang.isNumber
			},
			/**
			 * @attribute height
			 * @description The height of the overlay.
			 * If set to 0 (zero) the height changes with the content
			 * @type Number
			 * @default 0
			 */
			height: {
				value: 0,
				validator: Lang.isNumber
			},
			/**
			 * @attribute top
			 * @description The top position in pixels
			 * @type Number
			 */
			top: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(BOTTOM);
					return value;
				}
			},
			/**
			 * @attribute left
			 * @description The left position in pixels
			 * @type Number
			 */
			left: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(RIGHT);
					return value;
				}
			},
			/**
			 * @attribute bottom
			 * @description The bottom position in pixels
			 * @type Number
			 */
			bottom: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(TOP);
					return value;
				}
			},
			/**
			 * @attribute right
			 * @description The right position in pixels
			 * @type Number
			 */
			right: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(LEFT);
					return value;
				}
			},
			/**
			 * @attribute draggable
			 * @description If true, the overlay can be dragged
			 * @default false
			 */
			draggable: {
				validator: function () {
					return !!$.Drag;
				},
				value: FALSE
			}
		});
		myself.set(CLASS_NAME, Overlay.NAME);
		
		var rendered = FALSE;
		myself.on("rendered", function () {
			rendered = TRUE;
		});
		
		// centers the overlay in the screen
		var center = function (boundingBox) {
			var screenSize = $.screenSize();
			boundingBox.css({
				left: (screenSize.width - (rendered ? boundingBox.width() : myself.get(WIDTH))) / 2 + PX,
				top: (screenSize.height - (rendered ? boundingBox.height() : myself.get(HEIGHT))) / 2 + PX
			});
		};
		
		A.each([HEIGHT, WIDTH], function (size) {
			myself.on(size + "Change", function (e, value) {
				var boundingBox = myself.get(BOUNDING_BOX)[size](value);
				if (myself.get(CENTER)) {
					center(boundingBox);
				}
			});
		});
		
		var setPosition = function (boundingBox) {
			var bodyStyle = $($.context.body).currentStyle();
			A.each([LEFT, TOP, BOTTOM, RIGHT], function (position) {
				var orientation = position.substr(0, 1).toUpperCase() + position.substr(1);
				var bodyMargin = $.pxToFloat(bodyStyle["padding" + orientation]) + $.pxToFloat(bodyStyle["margin" + orientation]);
				if (UA_SUPPORTS_FIXED) {
					boundingBox.css(position, myself.isSet(position) ? ((myself.get(position) - bodyMargin + PX)) : AUTO);
				} else {
					var screenSize = $.screenSize();
					if (position == BOTTOM) {
						boundingBox.css(TOP, myself.isSet(position) ? ((screenSize.height - myself.get(HEIGHT) - bodyMargin + boundingBox.scrollTop()) + PX) : AUTO);
					} else if (position == RIGHT) {
						boundingBox.css(LEFT, myself.isSet(position) ? ((screenSize.width - myself.get(WIDTH) - bodyMargin + boundingBox.scrollLeft()) + PX) : AUTO);
					} else {
						boundingBox.css(position, myself.isSet(position) ? ((myself.get(position) - bodyMargin + PX)) : AUTO);
					}
				}
			});
		};
		
		// rendering process
		myself.on(RENDER, function (e) {
			var win = $($.win);
			var boundingBox = myself.get(BOUNDING_BOX);
			var header = myself.get(HEADER);
			if (header) {
				boundingBox.append(header);
			}
			var body = myself.get(BODY);
			if (body) {
				boundingBox.append(body);
			}
			var footer = myself.get(FOOTER);
			if (footer) {
				boundingBox.append(footer);
			}
			var fixed = myself.get(FIXED);
			var pos = fixed && UA_SUPPORTS_FIXED ? FIXED : "absolute";
			var height = myself.get(HEIGHT);
			boundingBox.css("position", pos).width(myself.get(WIDTH));
			if (height) {
				boundingBox.height(height);
			}
			setPosition(boundingBox);
			if (myself.get(CENTER)) {
				center(boundingBox);
				win.on(RESIZE, function () {
					center(myself.get(BOUNDING_BOX));
				});
				if (fixed || !UA_SUPPORTS_FIXED) {
					$($.win).on(SCROLL, function () {
						center(myself.get(BOUNDING_BOX));
					});
				}
			} else if (fixed && !UA_SUPPORTS_FIXED) {
				win.on(SCROLL, function () {
					setPosition(myself.get(BOUNDING_BOX));
				});
				win.on(RESIZE, function () {
					setPosition(myself.get(BOUNDING_BOX));
				});
			}
		});
		myself.on("afterRender", function () {
			if (myself.get("draggable")) {
				var head = myself.get(HEADER);
				myself.dd = new $.Drag({
					node: myself.get(BOUNDING_BOX)
				});
				if (head) {
					myself.dd.addHandler(head);
				}
			}
		});
	};
	Overlay.NAME = "overlay";
	$.extend(Overlay, Module);
	
	/**
	 * A panel is an overlay that resembles an OS window without actually being one,
	 * to the problems they have (stop javascript execution, etc)
	 * @class Panel
	 * @extends Overlay
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Panel = function () {
		Panel.superclass.constructor.apply(this, arguments);
		var myself = this.set(CLASS_NAME, Panel.NAME).addAttrs({
			/**
			 * @attribute contentBox
			 * @description A panel uses another container inside the boundingBox 
			 * in order to have a more complex design (ie: shadow)
			 * @readOnly
			 */
			contentBox: {
				readOnly: TRUE,
				value: $(NEW_DIV)
			},
			/**
			 * @attribute underlay
			 * @description The underlay is inserted after the contentBox to allow for a more complex design
			 * @readOnly
			 */
			underlay: {
				readOnly: TRUE,
				value: $(NEW_DIV).addClass(UNDERLAY)
			},
			/**
			 * @attribute shadow
			 * @description If true, the panel shows a shadow
			 * @default true
			 */
			shadow: {
				value: TRUE
			}
		}).on(HEIGHT + "Change", function (e, height) {
			myself.get(CONTENT_BOX).height(height);
		});
		
		/*
		 * Close button logic
		 */
		var closeButton = $("<a/>").attr("href", "#").addClass("container-close").on(CLICK, function (e) {
			if (myself.fire(CLOSE)) {
				myself.hide();
			}
			e.preventDefault();
		});
		/**
		 * @attribute close
		 * @description If true, a close button is added to the panel that hides it when clicked
		 * @type Boolean
		 * @default true
		 */
		myself.addAttr(CLOSE, {
			value: TRUE,
			validator: Lang.isBoolean,
			setter: function (value) {
				if (value) {
					closeButton.show();
				} else {
					closeButton.hide();
				}
				return value;
			}
			
		// rendering process
		}).on(RENDER, function (e) {
			var height = myself.get(HEIGHT);
			var contentBox = myself.get(CONTENT_BOX);
			if (height) {
				contentBox.height(height);
			}
			var prefix = myself.get(CLASS_PREFIX);
			var boundingBox = myself.get(BOUNDING_BOX).addClass(prefix + Panel.NAME + "-container");
			var head = myself.get(HEADER);
			var body = myself.get(BODY);
			var footer = myself.get(FOOTER);
			var sp = Panel;
			while (sp.NAME) {
				contentBox.addClass(prefix + sp.NAME);
				sp = sp.superclass.constructor;
			}
			if (head) {
				contentBox.append(head.remove(TRUE));
			}
			if (body) {
				contentBox.append(body.remove(TRUE));
			}
			if (footer) {
				contentBox.append(footer.remove(TRUE));
			}
			if (myself.get(CLOSE)) {
				closeButton.appendTo(contentBox);
			}
			contentBox.appendTo(boundingBox).css(VISIBILITY, "inherit");
			boundingBox.append(myself.get(UNDERLAY));
			if (myself.get(SHADOW)) {
				boundingBox.addClass(SHADOW);
			}
		});
	};
	Panel.NAME = "panel";
	$.extend(Panel, Overlay);
	
	/**
	 * A SimpleDialog is a Panel with simple form options and a button row instead of the footer
	 * @class SimpleDialog
	 * @extends Panel
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var SimpleDialog = function () {
		SimpleDialog.superclass.constructor.apply(this, arguments);
		var myself = this;
		myself.addAttrs({
			footer: {
				readOnly: TRUE,
				value: $(NEW_DIV).addClass(FOOTER)
			},
			/**
			 * @attribute buttons
			 * @description An array of configuration objects for the Button class
			 * @type Array
			 */
			buttons: {
				validator: Lang.isArray,
				value: []
			}
		}).set(CLASS_NAME, SimpleDialog.NAME);
		
		// rendering process
		myself.on(RENDER, function (e) {
			myself.get(BOUNDING_BOX).addClass(myself.get(CLASS_PREFIX) + SimpleDialog.NAME);
			var buttonArea = $(NEW_DIV).addClass("button-group");
			A.each(myself.get("buttons"), function (config, i) {
				var button = new Button(config);
				if (i === 0) {
					button.get(BOUNDING_BOX).addClass("default");
				}
				button.on(PRESSED, function () {
					myself.hide();
				}).render(buttonArea);
			});
			myself.get(FOOTER).append(buttonArea);
		});
	};
	SimpleDialog.NAME = "dialog";
	$.extend(SimpleDialog, Panel);
	
	$.add({
		Module: Module,
		Overlay: Overlay,
		Panel: Panel,
		SimpleDialog: SimpleDialog,
		Button: Button,
		ComboBox: ComboBox
	});
	
});
