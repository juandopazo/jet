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

		A.each([HEADER, BODY, FOOTER], function (name) {
			var value = this.get(name + 'Content'),
				node = this.get(name);
				
			if (Lang.isValue(value)) {
				if (value.nodeType) {
					value = $(value);
				}
				if (value instanceof $.NodeList) {
					node.append(value);
				} else {
					node.html(value);
				}
			}
		}, this);

		A.each(['Header', 'Body', 'Footer'], function (section) {
			this.after(section.toLowerCase() + 'ContentChange', this['_ui' + section + 'Change']);
		}, this);
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
				node.appendTo(contentBox);
			}
		}, this);
	}
});