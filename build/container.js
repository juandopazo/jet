/**
 * Contains widgets that act as containers, windows, dialogs
 * @module container
 * @requires base,widget-alignment,widget-stack
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('container', function ($) {

			var Lang = $.Lang,
	Hash = $.Hash,
	A = $.Array,
	DOM = $.DOM,
	Base = $.Base,
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
$.Module = Base.create('module', Widget, [], {
	ATTRS: {
		/**
		 * @attribute header
		 * @description A pointer to the header node
		 * @writeOnce
		 */
		header: {
			value: '<div/>',
			setter: $
		},
		/**
		 * @attribute body
		 * @description A pointer to the body node
		 * @writeOnce
		 */
		body: {
			value: '<div/>',
			setter: $
		},
		/**
		 * @attribute footer
		 * @description A pointer to the footer node
		 * @writeOnce
		 */
		footer: {
			value: '<div/>',
			setter: $
		},
		/**
		 * @attribute headerContent
		 * @description The header of the module.
		 * If set to a string a node is creating and the string is set to its innerHTML
		 * @type DOM Node | String | NodeList
		 */
		headerContent: {
			validator: Lang.isValue
		},
		/**
		 * @attribute bodyContent
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
		 * @attribute footerContent
		 * @description The footer of the module.
		 * If set to a string a node is creating and the string is set to its innerHTML
		 * @type DOM Node | String | NodeList
		 */
		footerContent: {
			validator: Lang.isValue
		}
	}
	
}, {
	CONTENT_TEMPLATE: null,
	
	initializer: function () {
		this.set(HEADER, this.get(HEADER));
		this.set(BODY, this.get(BODY));
		this.set(FOOTER, this.get(FOOTER));
	},
	
	_uiHeaderChange: function (e) {
		this.get(HEADER).setContent(e.newVal);
	},
	_uiBodyChange: function (e) {
		this.get(BODY).setContent(e.newVal);
	},
	_uiFooterChange: function (e) {
		this.get(FOOTER).setContent(e.newVal);
	},
	
	renderUI: function () {
		var contentBox = this.get(CONTENT_BOX);
		// append the header, body and footer to the bounding box if present
		A.each([HEADER, BODY, FOOTER], function (name) {
			var value = this.get(name + 'Content'),
				node = this.get(name).addClass(name);
				
			if (Lang.isValue(value)) {
				if (value.nodeType) {
					value = $(value);
				}
				if (value instanceof $.NodeList) {
					node.append(value);
				} else {
					node.html(value);
				}
				node.appendTo(contentBox);
			}
		}, this);
	},
	
	bindUI: function () {
		A.each(['Header', 'Body', 'Footer'], function (section) {
			this.after(section.toLowerCase() + 'ContentChange', this['_ui' + section + 'Change']);
		}, this);
	}
});
if (!Global.overlays) {
	Global.overlays = [];
}
if (!Lang.isNumber(Global.ovZindex)) {
	Global.ovZindex = 10;
}
/**
 * An Overlay is a Module that floats in the page (doesn't have position static)
 * @class Overlay
 * @constructor
 * @extends Module
 * @uses WidgetStack
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Overlay = Base.create('overlay', $.Module, [$.WidgetAlignment, $.WidgetStack], {
	
	ATTRS: {
		/**
		 * @attribute draggable
		 * @description If true, the overlay can be dragged. Requires $.Drag
		 * @default false
		 * @type Boolean
		 * @writeOnce
		 */
		draggable: {
			validator: function () {
				return !!$.Drag;
			},
			value: false,
			writeOnce: true
		},
		/**
		 * @attribute modal
		 * @description Whether this overlay should stop the user from interacting with the rest of the page
		 * @default false
		 * @type Boolean
		 * @writeOnce
		 */
		modal: {
			value: false,
			writeOnce: true
		},
		
		startZIndex: {
			getter: function () {
				return Global.overlays.length - 1;
			},
			readOnly: true
		},
		/**
		 * @attribute modalBox
		 * @attribute Node that prevents the user from interacting with the page if 'modal' is set to true
		 * @type NodeList
		 * @readOnly
		 */
		modalBox: {
			setter: $
		}
	}
	
}, {
	
	MODAL_TEMPLATE: '<div/>',

	_resizeModal: function () {
		var screenSize = DOM.screenSize();
		this.get(MODAL_BOX).width(screenSize.width).height(screenSize.height);
	},
	_showModal: function () {
		if (this.get('modal')) {
			this.get(MODAL_BOX).show();
		}
	},
	_hideModal: function () {
		this.get(MODAL_BOX).hide();
	},
	
	initializer: function () {
		if (!this.get(MODAL_BOX)) {
			this.set(MODAL_BOX, this.MODAL_TEMPLATE);
		}
	},
	
	renderUI: function (boundingBox) {
		var screenSize = DOM.screenSize();
		var startZIndex = this.get('startZIndex');
		var modal = this.get(MODAL_BOX).css({
			position: 'absolute',
			top: "0px",
			left: "0px",
			background: "#000",
			visibility: !this.get("modal") ? "hidden" : "",
			zIndex: this.get('zIndex') - 1,
			opacity: 0.4
		}).width(screenSize.width).height(screenSize.height).appendTo($.config.doc.body);
	},
	
	bindUI: function () {
		this.after('show', this._showModal);
		this.after('hide', this._hideModal);
		this.on('mousedown', this.focus);
		this._handlers.push($($.config.win).on(RESIZE, this._resizeModal, this));
	},
	
	syncUI: function (boundingBox) {
		var head = this.get(HEADER);
		if (this.get('draggable')) {
			this.dd = new $.Drag({
				node: boundingBox,
				handlers: head
			});
		}
	},
	
	destructor: function () {
		if (this.dd) {
			this.dd.destroy();
		}
	}
});
/**
 * A simple tooltip implementation
 * @class Tooltip
 * @extends Widget
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Tooltip = Base.create('tooltip', Widget, [$.WidgetAlignment], {
	ATTRS: {
		align: {
			value: {
				points: ['tl', 'bl']
			}
		},
		/**
		 * @attribute fadeIn
		 * @description Whether to use a fade animation when appearing. Requires Anim module
		 * @default false
		 */
		fadeIn: {
			value: false,
			validator: function () {
				return !!$.Tween;
			}
		}
	}
}, {
	
	_uiShowTooltip: function () {
		var offset = this.get("srcNode").offset();
		var fadeIn = this.get("fadeIn");
		this.set("left", offset.left).set("top", offset.top + offset.height);
		if (fadeIn) {
			this.get(BOUNDING_BOX).css("opacity", 0).fadeIn(fadeIn);
		}
	},
	
	renderUI: function () {
		this.set('align', {
			node: this.get('srcNode'),
			points: this.get('align').points
		});
	},
	
	bindUI: function () {
		var srcNode = this.get('srcNode');
		this.after('show', this._uiShowTooltip);
		this._handlers.push(srcNode.on('mouseover', this.show, this), srcNode.on('mouseout', this.hide, this));
	},
	
	syncUI: function () {
		this.hide().set('bodyContent', this.get('bodyContent') || this.get('srcNode').attr('title'));
	}
	
});
/**
 * A panel is an overlay that resembles an OS window without actually being one,
 * to the problems they have (stop javascript execution, etc)
 * @class PanelBase
 * @constructor
 */
function PanelBase() {
	this.set('closeButton', this.get('closeButton'));
	this.set(UNDERLAY, this.get(UNDERLAY));
	
	this.after('closeChange', this._uiCloseChange);
}
PanelBase.ATTRS = {
	/**
	 * @attribute close
	 * @description If true, a close button is added to the panel that hides it when clicked
	 * @type Boolean
	 * @default true
	 */
	close: {
		value: true,
		validator: Lang.isBoolean
	},
	/**
	 * @attribute underlay
	 * @description The underlay is inserted after the contentBox to allow for a more complex design
	 * @readOnly
	 */
	underlay: {
		value: '<div/>',
		setter: $
	},
	/**
	 * @attribute shadow
	 * @description If true, the panel shows a shadow
	 * @default true
	 */
	shadow: {
		value: true
	},
	
	closeButton: {
		value: '<a/>',
		setter: $
	}
	
};
PanelBase.prototype = {
	
	CONTENT_TEMPLATE: '<div/>',
	CLOSE_TEMPLATE: '<a/>',
	
	_uiCloseChange: function (e) {
		this.get('closeButton').toggle(e.newVal);
	},
	
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
	
	renderUI: function (boundingBox, contentBox) {
		this.get('closeButton').addClass("container-close").appendTo(contentBox);
		boundingBox.append(this.get(UNDERLAY).addClass(UNDERLAY));
		if (this.get(SHADOW)) {
			boundingBox.addClass(SHADOW);
		}
	},
	
	bindUI: function () {
		this._handlers.push(
			$($.config.doc).on('keyup', this._onContextKeyUp, this),
			this.get('closeButton').on(CLICK, this._onCloseButton, this)
		);
	}
};

/**
 * A panel is an overlay that resembles an OS window without actually being one,
 * to the problems they have (stop javascript execution, etc)
 * @class Panel
 * @extends Overlay
 * @uses PanelBase
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Panel = Base.create('panel', $.Overlay, [PanelBase]);

/**
 * An panel with static position and a close button
 * @class StaticPanel
 * @extends Module
 * @uses PanelBase
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.StaticPanel = Base.create('panel', $.Module, [PanelBase]);
/**
 * A SimpleDialog is a Panel with simple form options and a button row instead of the footer
 * @class SimpleDialog
 * @extends Panel
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.SimpleDialog = Base.create('dialog', $.Panel, [], {
	ATTRS: {
		
		/**
		 * @attribute buttons
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
		
	}
}, {
	
	_bgVisibleChange: function (e) {
		var action = e.newVal ? 'show' : 'hide';
		this.bg[action]();
		this.bg.each(function (button) {
			button[action]();
		});
	},
	
	renderUI: function () {
		var buttonGroup = this.bg = new $.ButtonGroup({
			children: this.get('buttons')
		});
		buttonGroup.render(this.get(FOOTER));
		buttonGroup.get(BOUNDING_BOX).css(VISIBILITY, 'inherit');
	},
	
	bindUI: function () {
		this.after('visibleChange', this._bgVisibleChange);
	}
	
});
			
});
