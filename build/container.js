/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Contains widgets that act as containers, windows, dialogs 
 * @module container
 * @requires jet, node, base
 * @namespace
 */
jet().add("container", function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array,
		DOM = $.DOM;
	
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
			 * @config header
			 * @description The header of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * @type DOM Node | String | NodeList
			 */
			header: {
				setter: containerSetter(HEADER),
				validator: Lang.isValue
			},
			/**
			 * @config body
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
			 * @config footer
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
			 * @config center
			 * @description If true, the overlay is positioned in the center of the page
			 * @type Boolean
			 * @default true
			 */
			center: {
				value: true
			},
			/**
			 * @config fixed
			 * @description If true, the overlay is position is set to fixed
			 * @type Boolean
			 * @default false
			 */
			fixed: {
				value: false
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
			},
			/**
			 * @config top
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
			 * @config left
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
			 * @config bottom
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
			 * @config right
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
			 * @config draggable
			 * @description If true, the overlay can be dragged
			 * @default false
			 */
			draggable: {
				validator: function () {
					return !!$.Drag;
				},
				value: false
			},
			/**
			 * @config zIndex
			 * @description zIndex to apply to the boundingBox
			 * @default 100
			 */
			zIndex: {
				value: 100
			},
			modal: {
				value: false
			}
		});
		myself.set(CLASS_NAME, Overlay.NAME);
		
		// centers the overlay in the screen
		var center = function (boundingBox) {
			var screenSize = DOM.screenSize();
			var rendered = myself.get("rendered");
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
					var screenSize = DOM.screenSize();
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
			var body = myself.get(BODY);
			var footer = myself.get(FOOTER);
			var fixed = myself.get(FIXED);
			var pos = fixed && UA_SUPPORTS_FIXED ? FIXED : "absolute";
			var height = myself.get(HEIGHT);
			var screenSize = DOM.screenSize();
			var modal = $("<div/>").css({
				position: "fixed",
				top: "0px",
				left: "0px",
				background: "#000",
				visibility: !myself.get("modal") ? "hidden" : "",
				zIndex: myself.get("zIndex") - 1,
				opacity: 0.4
			}).width(screenSize.width).height(screenSize.height).appendTo($.context.body);
			win.on("resize", function () {
				var screenSize = DOM.screenSize();
				modal.width(screenSize.width).height(screenSize.height);
			});
			myself.on("hide", function () {
				modal.hide();
			}).on("show", function () {
				if (myself.get("modal")) {
					modal.show();
				}
			});
			if (header) {
				boundingBox.append(header);
			}
			if (body) {
				boundingBox.append(body);
			}
			if (footer) {
				boundingBox.append(footer);
			}
			boundingBox.css("position", pos).css("zIndex", myself.get("zIndex")).width(myself.get(WIDTH));
			if (height) {
				boundingBox.height(height);
			}
			setPosition(boundingBox);
		});
		myself.on("afterRender", function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			var win = $($.win);
			var head = myself.get(HEADER);
			var fixed = myself.get(FIXED);
			if (myself.get("draggable")) {
				myself.dd = new $.Drag({
					node: boundingBox,
					handlers: head
				});
			}
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
				myself.on("afterShow", function () {
					center(boundingBox);
				});
			} else if (fixed && !UA_SUPPORTS_FIXED) {
				win.on(SCROLL, function () {
					setPosition(myself.get(BOUNDING_BOX));
				});
				win.on(RESIZE, function () {
					setPosition(myself.get(BOUNDING_BOX));
				});
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
			 * @config contentBox
			 * @description A panel uses another container inside the boundingBox 
			 * in order to have a more complex design (ie: shadow)
			 * @readOnly
			 */
			contentBox: {
				readOnly: true,
				value: $(NEW_DIV)
			},
			/**
			 * @config underlay
			 * @description The underlay is inserted after the contentBox to allow for a more complex design
			 * @readOnly
			 */
			underlay: {
				readOnly: true,
				value: $(NEW_DIV).addClass(UNDERLAY)
			},
			/**
			 * @config shadow
			 * @description If true, the panel shows a shadow
			 * @default true
			 */
			shadow: {
				value: true
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
		 * @config close
		 * @description If true, a close button is added to the panel that hides it when clicked
		 * @type Boolean
		 * @default true
		 */
		myself.addAttr(CLOSE, {
			value: true,
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
				contentBox.append(head.remove(true));
			}
			if (body) {
				contentBox.append(body.remove(true));
			}
			if (footer) {
				contentBox.append(footer.remove(true));
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
				readOnly: true,
				value: $(NEW_DIV).addClass(FOOTER)
			},
			/**
			 * @config buttons
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
				var button = new $.Button(config);
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
		SimpleDialog: SimpleDialog
	});
	
});