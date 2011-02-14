/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/Global-js/wiki/Licence
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
		DOM = $.DOM,
		Widget = $.Widget;
		
	var Global = jet;
	
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
	var UA_SUPPORTS_FIXED = $.UA.support.fixed;
	
	/**
	 * @class Module
	 * @description A module is a basic container with header, body and footer
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.Module = Widget.create('module', [], {
		ATTRS: {
			/**
			 * @config header
			 * @description The header of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * @type DOM Node | String | NodeList
			 */
			header: {
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
				validator: Lang.isValue
			},
			/**
			 * @config footer
			 * @description The footer of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * @type DOM Node | String | NodeList
			 */
			footer: {
				validator: Lang.isValue
			}
		},
		
		EVENTS: {
		
			render: function () {
				var self = this;
				var boundingBox = this.get(BOUNDING_BOX);
				// append the header, body and footer to the bounding box if present
				A.each(['header', 'body', 'footer'], function (name) {
					var value = self.get(name);
					if (Lang.isValue(value)) {
						if (value.nodeName && value.nodeName == 1) {
							value = $(value);
						} else if (value instanceof $.NodeList) {
							value = $(value[0]);
						} else {
							value = $('<div/>').html(value);
						}
						value.addClass(name).appendTo(boundingBox);
						self.set(name, value);
					}
				});
			}
			
		}
	}, {
		CONTENT_TEMPLATE: null
	});
	
	
	if (!Global.overlays) {
		Global.overlays = [];
	}
	if (!Lang.isNumber(Global.ovZindex)) {
		Global.ovZindex = 10;
	}
	/**
	 * @class Overlay
	 * @description An Overlay is a Module that floats in the page (doesn't have position static)
	 * @extends Module
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.Overlay = Widget.create('overlay', [], {
		
		ATTRS: {
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
			 * @config top
			 * @description The top position in pixels
			 * @type Number
			 */
			top: {
				validator: Lang.isNumber,
				setter: function (value) {
					this.unset(BOTTOM);
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
					this.unset(RIGHT);
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
					this.unset(TOP);
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
					this.unset(LEFT);
					return value;
				}
			},
			/**
			 * @config draggable
			 * @description If true, the overlay can be dragged. Requires $.Drag
			 * @default false
			 * @type Boolean
			 */
			draggable: {
				validator: function () {
					return !!$.Drag;
				},
				value: false
			},
			/**
			 * @config modal
			 * @description Whether this overlay should stop the user from interacting with the rest of the page
			 * @default faulse
			 * @type Boolean
			 */
			modal: {
				value: false
			},
			
			startZIndex: {
				value: Global.overlays.length - 1,
				readOnly: true
			},
			/**
			 * @config modalBox
			 * @config Node that prevents the user from interacting with the page if 'modal' is set to true
			 * @type NodeList
			 * @readOnly
			 */
			modalBox: {
				value: $('<div/>'),
				readOnly: true
			}
		},
		
		EVENTS: {
			
			render: function (e) {
				var win = $(this.get('win'));
				var self = this;
				var boundingBox = this.get(BOUNDING_BOX);
				var fixed = this.get(FIXED);
				var pos = fixed && UA_SUPPORTS_FIXED ? FIXED : "absolute";
				var height = this.get(HEIGHT);
				var screenSize = DOM.screenSize();
				var modal = this.get('modalBox').css({
					position: pos,
					top: "0px",
					left: "0px",
					background: "#000",
					visibility: !self.get("modal") ? "hidden" : "",
					zIndex: Global.ovZindex + this.get('startZindex') - 1,
					opacity: 0.4
				}).width(screenSize.width).height(screenSize.height).appendTo(this.get('doc').body);
				win.on(RESIZE, this._resizeModal);
				self.on("hide", modal.hide, modal).on("show", function () {
					if (self.get("modal")) {
						modal.show();
					}
				});
				boundingBox.css({
					position: pos,
					zIndex: Global.ovZindex + this.get('startZindex')
				}).width(self.get(WIDTH)).on("mousedown", self.focus, self);
				this._repositionUI.call(this);
			},
			
			afterRender: function () {
				var self = this;
				var boundingBox = this.get(BOUNDING_BOX);
				var win = $(this.get('win'));
				var head = this.get(HEADER);
				var fixed = this.get(FIXED);
				var centerUI = this._centerUI;
				if (this.get("draggable")) {
					this.dd = new $.Drag({
						node: boundingBox,
						handlers: head
					});
				}
				if (this.get(CENTER)) {
					centerUI.call(this);
					win.on(RESIZE, centerUI, this);
					if (fixed || !UA_SUPPORTS_FIXED) {
						win.on(SCROLL, centerUI, this);
					}
					this.on("afterShow", centerUI, this);
				} else if (fixed && !UA_SUPPORTS_FIXED) {
					win.on(SCROLL, this._repositionUI, this).on(RESIZE, this._repositionUI, this);
				}
	
			},
			
			focus: function () {
				A.remove(this, Global.overlays);
				Global.overlays.push(this);
				var olays = Global.overlays, i, length = olays.length;
				for (i = 0; i < length; i++) {
					olays[i].get(BOUNDING_BOX).css("zIndex", Global.ovZindex + i);
				}
			},
			
			destroy: function () {
				var win = $(this.get('win')).unbind(RESIZE, this._centerUI).unbind(SCROLL, this._centerUI);
				win.unbind(RESIZE, this._repositionUI).unbind(SCROLL, this._repositionUI);
				win.unbind(RESIZE, this._resizeModal);
				if (this.dd) {
					this.dd.destroy();
				}
				this.get(BOUNDING_BOX).unbind("mousedown", this.focus);
			}
		}
		
	}, {
	
		// centers the overlay in the screen
		_centerUI: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			var screenSize = DOM.screenSize();
			var rendered = this.get("rendered");
			boundingBox.css({
				left: (screenSize.width - (rendered ? boundingBox.width() : this.get(WIDTH))) / 2 + PX,
				top: (screenSize.height - (rendered ? boundingBox.height() : this.get(HEIGHT))) / 2 + PX
			});
		},
		
		_repositionUI: function () {
			var self = this;
			var boundingBox = this.get(BOUNDING_BOX);
			var bodyStyle = $(this.get('doc').body).currentStyle();
			A.each([LEFT, TOP, BOTTOM, RIGHT], function (position) {
				var orientation = position.substr(0, 1).toUpperCase() + position.substr(1);
				var bodyMargin = $.pxToFloat(bodyStyle["padding" + orientation]) + $.pxToFloat(bodyStyle["margin" + orientation]);
				if (UA_SUPPORTS_FIXED) {
					boundingBox.css(position, self.isSet(position) ? ((self.get(position) - bodyMargin + PX)) : AUTO);
				} else {
					var screenSize = DOM.screenSize();
					switch (position) {
						case BOTTOM:
							boundingBox.css(self.isSet(position) ? TOP : BOTTOM, self.isSet(position) ? ((screenSize.height - self.get(HEIGHT) - bodyMargin + boundingBox.scrollTop()) + PX) : AUTO);
							break;
						case RIGHT:
							boundingBox.css(self.isSet(position) ? LEFT : RIGHT, self.isSet(position) ? ((screenSize.width - self.get(WIDTH) - bodyMargin + boundingBox.scrollLeft()) + PX) : AUTO);
							break;
						case LEFT:
							boundingBox.css(position, self.isSet(position) ? ((self.get(position) + DOM.scrollLeft() - bodyMargin + PX)) : AUTO);
							break;
						case TOP:
							boundingBox.css(position, self.isSet(position) ? ((self.get(position) + DOM.scrollTop() - bodyMargin + PX)) : AUTO);
							break;
					}
				}
			});
		},
		
		_resizeModal: function () {
			var screenSize = DOM.screenSize();
			this.get('modalBox').width(screenSize.width).height(screenSize.height);
		},

		initializer: function () {
			var self = this;
			Global.overlays.push(this);

			A.each([HEIGHT, WIDTH], function (size) {
				self.on(size + "Change", function (e, value) {
					self.get(BOUNDING_BOX)[size](value);
					if (self.get(CENTER)) {
						self._centerUI();
					}
				});
			});
		}
	}, $.Module);
	
	/**
	 * A simple tooltip implementation
	 * @class Tooltip
	 * @extends Overlay
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.Tooltip = Widget.create('tooltip', [], {
		ATTRS: {
			position: {
				value: "r"
			},
			/**
			 * @config fadeIn
			 * @description Whether to use a fade animation when appearing. Requires Anim module
			 * @default false
			 */
			fadeIn: {
				value: false,
				validator: function () {
					return !!$.Tween;
				}
			}
		},
		
		EVENTS: {
			render: function () {
				this.hide().set("body", this.get("body") || this.get("srcNode").attr("title"));
				this.get("srcNode").on("mouseover", this.show).on("mouseout", this.hide);
			},
			show: function () {
				var offset = this.get("srcNode").offset();
				this.set("left", offset.left).set("top", offset.top + offset.height);
				if (this.get("fadeIn")) {
					this.get(BOUNDING_BOX).css("opacity", 0).fadeIn(this.get("fadeIn"));
				}
			}
		}
	}, {}, $.Overlay);
	
	/**
	 * A panel is an overlay that resembles an OS window without actually being one,
	 * to the problems they have (stop javascript execution, etc)
	 * @class Panel
	 * @extends Overlay
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var panelAttrs = {
		/**
		 * @config close
		 * @description If true, a close button is added to the panel that hides it when clicked
		 * @type Boolean
		 * @default true
		 */
		close: {
			value: true,
			validator: Lang.isBoolean,
			setter: function (value) {
				var closeButton = this.get('closeButton');
				if (value) {
					closeButton.show();
				} else {
					closeButton.hide();
				}
				return value;
			}
		},
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
		},
		
		closeButton: {
			value: $("<a/>"),
			writeOnce: true
		}
		
	};
	var panelEvents = {
		
		render: function (e) {
			var height = this.get(HEIGHT);
			var contentBox = this.get(CONTENT_BOX);
			var closeButton = this.get('closeButton').attr("href", "#").addClass("container-close").on(CLICK, this._onCloseButton);
			var boundingBox = this.get(BOUNDING_BOX);
			closeButton.appendTo(contentBox);
			boundingBox.append(this.get(UNDERLAY));
			if (this.get(SHADOW)) {
				boundingBox.addClass(SHADOW);
			}
		},
		
		destroy: function () {
			this.get('closeButton').unbind(CLICK, this._onCloseButton);
			this.get('doc').unbind('keyup', this._onContextKeyUp);
		}
		
	};
	var panelMethods = {
		
		CONTENT_TEMPLATE: '<div/>',
		
		_onCloseButton: function (e) {
			e.preventDefault();
			if (this.fire(CLOSE)) {
				this.hide();
			}
		},
		
		_onContextKeyUp: function (e) {
			if (e.keyCode == 27 && this.get("focused")) {
				this._onCloseButton.call(this, e);
			}
		},
		
		initializer: function () {
			var self = this;
			this.on(HEIGHT + "Change", function (e, height) {
				self.get(CONTENT_BOX).height(height);
			});
		}
		
	};
	$.Panel = Widget.create('panel', [], {
		ATTRS: panelAttrs,
		EVENTS: panelEvents
	}, panelMethods, $.Overlay);
	
	/**
	 * An panel with static position and a close button
	 * @class StaticPanel
	 * @extends Module
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
		/**
		 * @config close
		 * @description If true, a close button is added to the panel that hides it when clicked
		 * @type Boolean
		 * @default true
		 */
		/**
		 * @config contentBox
		 * @description A panel uses another container inside the boundingBox 
		 * in order to have a more complex design (ie: shadow)
		 * @readOnly
		 */
		/**
		 * @config underlay
		 * @description The underlay is inserted after the contentBox to allow for a more complex design
		 * @readOnly
		 */
		/**
		 * @config shadow
		 * @description If true, the panel shows a shadow
		 * @default true
		 */
	$.StaticPanel = Widget.create('panel', [] ,{
		ATTRS: panelAttrs,
		EVENTS: panelEvents
	}, panelMethods, $.Module);
	
	/**
	 * A SimpleDialog is a Panel with simple form options and a button row instead of the footer
	 * @class SimpleDialog
	 * @extends Panel
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.SimpleDialog = Widget.create('dialog', [], {
		ATTRS: {
			
			/**
			 * @config buttons
			 * @description An array of button configuration objects
			 * @default []
			 * @type Array
			 */
			buttons: {
				value: []
			}
			
		},
		EVENTS: {
			render: function (e) {
				var buttonGroup = new $.ButtonGroup({
					children: this.get('buttons')
				});
				buttonGroup.render(this.get(FOOTER));
			}
		}
	}, {}, $.Panel);
	
});