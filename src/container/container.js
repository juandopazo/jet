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
		MODAL_BOX = 'modalBox',
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
			 * @description A pointer to the header node
			 * @writeOnce
			 */
			header: {
				setter: $,
				wriceOnce: true
			},
			/**
			 * @config body
			 * @description A pointer to the body node
			 * @writeOnce
			 */
			body: {
				setter: $,
				writeOnce: true
			},
			/**
			 * @config footer
			 * @description A pointer to the footer node
			 * @writeOnce
			 */
			footer: {
				setter: $,
				writeOnce: true
			},
			/**
			 * @config header
			 * @description The header of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * @type DOM Node | String | NodeList
			 */
			headerContent: {
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
			bodyContent: {
				value: "",
				validator: Lang.isValue
			},
			/**
			 * @config footer
			 * @description The footer of the module.
			 * If set to a string a node is creating and the string is set to its innerHTML
			 * @type DOM Node | String | NodeList
			 */
			footerContent: {
				validator: Lang.isValue
			}
		},
		
		EVENTS: {
		
			render: function () {
				var self = this;
				var contentBox = this.get(CONTENT_BOX);
				// append the header, body and footer to the bounding box if present
				A.each([HEADER, BODY, FOOTER], function (name) {
					var value = self.get(name + 'Content');
					var node = self.get(name).addClass(name);
					if (Lang.isValue(value)) {
						node.appendTo(contentBox);
					}
				});
			}
			
		}
	}, {
		CONTENT_TEMPLATE: null,
		HEADER_TEMPLATE: '<div/>',
		BODY_TEMPLATE: '<div/>',
		FOOTER_TEMPLATE: '<div/>',
		
		initializer: function () {
			var self = this;
			A.each([HEADER, BODY, FOOTER], function (name) {
				self.set(name, self[name.toUpperCase() + '_TEMPLATE']);
				var node = self.get(name);
				var val = self.get(name + 'Content');
				if (Lang.isValue(val)) {
					if (val.nodeType) {
						val = $(val);
					}
					if (val instanceof $.NodeList) {
						node.append(val);
					} else {
						node.html(val);
					}
				}
				self.on(name + 'ContentChange', function (e, newVal) {
					node.children().remove();
					node.html(newVal);
				});
			});
		}
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
	 * @uses WidgetAlignment
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.Overlay = Widget.create('overlay', [$.WidgetAlignment], {
		
		ATTRS: {
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
				setter: $
			}
		},
		
		EVENTS: {
			
			render: function (e) {
				var win = $(this.get('win'));
				var self = this;
				var boundingBox = this.get(BOUNDING_BOX);
				var screenSize = DOM.screenSize();
				var modal = this.get(MODAL_BOX).css({
					position: 'absolute',
					top: "0px",
					left: "0px",
					background: "#000",
					visibility: !self.get("modal") ? "hidden" : "",
					zIndex: Global.ovZindex + this.get('startZindex') - 1,
					opacity: 0.4
				}).width(screenSize.width).height(screenSize.height).appendTo(this.get('doc').body);
				win.on(RESIZE, this._resizeModal);
				boundingBox.css({
					zIndex: Global.ovZindex + this.get('startZindex')
				});
				this.on("mousedown", this.focus, this);
			},
			
			afterRender: function () {
				var boundingBox = this.get(BOUNDING_BOX);
				var head = this.get(HEADER);
				if (this.get("draggable")) {
					this.dd = new $.Drag({
						node: boundingBox,
						handlers: head
					});
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
			
			hide: function () {
				this.get(MODAL_BOX).hide();
			},
			
			show: function () {
				if (this.get("modal")) {
					this.get(MODAL_BOX).show();
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
		
		MODAL_TEMPLATE: '<div/>',
	
		_resizeModal: function () {
			var screenSize = DOM.screenSize();
			this.get(MODAL_BOX).width(screenSize.width).height(screenSize.height);
		},

		initializer: function () {
			var self = this;
			Global.overlays.push(this);
			this.set(MODAL_BOX, this.MODAL_TEMPLATE);
		}
	}, $.Module);
	
	/**
	 * A simple tooltip implementation
	 * @class Tooltip
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.Tooltip = Widget.create('tooltip', [$.WidgetAlignment], {
		ATTRS: {
			align: {
				points: ['tl', 'bl']
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
				var srcNode = this.get('srcNode');
				var points = this.get('align').points;
				this.set('align', {
					node: srcNode,
					points: points
				});
				this.hide().set("bodyContent", this.get("bodyContent") || srcNode.attr("title"));
				srcNode.on("mouseover", this.show).on("mouseout", this.hide);
			},
			show: function () {
				var offset = this.get("srcNode").offset();
				var fadeIn = this.get("fadeIn");
				this.set("left", offset.left).set("top", offset.top + offset.height);
				if (fadeIn) {
					this.get(BOUNDING_BOX).css("opacity", 0).fadeIn(fadeIn);
				}
			}
		}
	});
	
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
		 * @config underlay
		 * @description The underlay is inserted after the contentBox to allow for a more complex design
		 * @readOnly
		 */
		underlay: {
			setter: $
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
			setter: $
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
			$(this.get('doc')).on('keyup', this._onContextKeyUp);
		},
		
		destroy: function () {
			$(this.get('doc')).unbind('keyup', this._onContextKeyUp);
		},
		
		click: function (e, domEvent) {
			if (domEvent.target == this.get('closeButton')[0]) {
				this._onCloseButton(domEvent);
			}
		}
		
	};
	var panelMethods = {
		
		CONTENT_TEMPLATE: '<div/>',
		CLOSE_TEMPLATE: '<a/>',
		
		_onCloseButton: function (e) {
			e.preventDefault();
			if (this.fire(CLOSE)) {
				this.hide();
			}
		},
		
		_onContextKeyUp: function (e) {
			if (e.keyCode == 27 && this.get("focused")) {
				this._onCloseButton(e);
			}
		},
		
		initializer: function () {
			var self = this;
			this.on(HEIGHT + "Change", function (e, height) {
				self.get(CONTENT_BOX).height(height);
			});
			this.set(UNDERLAY, $(NEW_DIV).addClass(UNDERLAY));
			this.set('closeButton', this.CLOSE_TEMPLATE);
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
			},
			footerContent: {
				value: ' ',
				readOnly: true
			}
			
		},
		EVENTS: {
			render: function (e) {
				var buttonGroup = this.bg = new $.ButtonGroup({
					children: this.get('buttons')
				});
				buttonGroup.render(this.get(FOOTER));
				buttonGroup.get(BOUNDING_BOX).css(VISIBILITY, 'inherit');
			},
			afterHide: function () {
				this.bg.hide();
				this.bg.each(function (button) {
					button.hide();
				});
			},
			afterShow: function () {
				this.bg.show();
				this.bg.each(function (button) {
					button.show();
				});
			}
		}
	}, {}, $.Panel);
	
});