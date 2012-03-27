/**
 * Different kinds of buttons and form elements
 * @module button
 * @requires base
 * 
 * Copyright (c) 2012, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('button', function ($) {
"use strict";

			
var A = $.Array,
	Hash = $.Hash,
	Lang = $.Lang,
	Base = $.Base,
	Widget = $.Widget,
	WidgetParent = $.WidgetParent,
	WidgetChild = $.WidgetChild;

var BOUNDING_BOX = "boundingBox",
	CONTENT_BOX = 'contentBox',
	LABEL_NODE = 'labelNode',
	ENABLED = 'enabled',
	HOVER = 'hover',
	FOCUS = 'focus',
	BLUR = 'blur',
	ID = 'id',
	PARENT = 'parent',
	NAME = 'name',
	PILL = 'pill';

var ButtonNS = jet.namespace('Button');

/**
 * A button widget
 * @class Button
 * @extends Widget
 * @uses WidgetChild
 * @param {Object} config Object literal specifying widget configuration properties
 */
var Button = $.Button = Base.create('button', Widget, [WidgetChild], {
	
	ATTRS: {
		/**
		 * @attribute enabled
		 * @description Enabled status of the button
		 * @type Boolean
		 * @default true
		 */
		enabled: {
			value: true,
			validator: Lang.isBoolean
		},
		/**
		 * @attribute labelNode
		 * @description Pointer to the <label> node related to this button
		 * @type NodeList
		 * @readOnly
		 */
		labelNode: {
			value: null,
			setter: $
		},
		/**
		 * @attribute labelContent
		 * @description Text of this button's label
		 * @type String
		 * @default null
		 */
		labelContent: {
			value: null,
			validator: Lang.isString
		},
		/**
		 * @attribute text
		 * @description Text inside the button
		 * @default ''
		 */
		text: {
			value: ''
		}
	},
	
	EVENTS: {
		mouseover: function (e) {
			this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
		},
		mouseout: function (e) {
			this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
		}
	}
	
}, {
	CONTENT_TEMPLATE: '<button/>',
	LABEL_TEMPLATE: '<label/>',
	
	_reportPressed: function (e) {
		this.fire("pressed", { domEvent: e });
	},
	
	_uiFocusedChange: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName(FOCUS), e.newVal);
		this.get(CONTENT_BOX)[e.newVal ? 'focus' : 'blur']();
	},
	
	_uiTextChange: function (e) {
		this.get(CONTENT_BOX).html(e.val);
	},
	
	_uiLabelChange: function (e) {
		var labelNode = this.get(LABEL_NODE);
		var val = e.newVal;
		if (Lang.isString(val)) {
			labelNode.html(val);
			if (!labelNode.parent().getDOMNode()) {
				this.get(BOUNDING_BOX).prepend(labelNode);
			}
		} else {
			labelNode.remove();
		}
	},
	
	_uiEnabledChange: function (e, val) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName('disabled'), !e.newVal);
		this.get(CONTENT_BOX).getDOMNode().disabled = !e.newVal;
	},
	
	initializer: function () {
		this.set(LABEL_NODE, this.get(LABEL_NODE) || this.LABEL_TEMPLATE);

		this.after('enabledChange', this._uiEnabledChange);
		this.after('labelContentChange', this._uiLabelChange);
		this.after('textChange', this._uiTextChange);
		this.after('focusedChange', this._uiFocusedChange);
	},
	
	renderUI: function (boundingBox, contentBox) {
		var id = this.getClassName('content', this._uid),
			labelNode = this.get(LABEL_NODE),
			label = this.get('labelContent');
		
		contentBox.attr(ID, id).html(this.get('text'));
		
		labelNode.getDOMNode().setAttribute('for', id);
		if (Lang.isString(label)) {
			boundingBox.prepend(labelNode.html(label));
		}
	},
	
	bindUI: function (bb, contentBox) {
		this._handlers.push(
			contentBox.on(FOCUS, this.focus, this),
			contentBox.on(BLUR, this.blur, this),
			contentBox.on("click", this._reportPressed, this)
		);
	},
	
	syncUI: function (bb, contentBox) {
		contentBox.getDOMNode().disabled = !this.get(ENABLED);
	},
	
	destructor: function () {
		this.get(LABEL_NODE).remove();
	}
	
});
/**
 * A button widget that selects/unselects itself when clicked
 * @class ToggleButton
 * @extends Button
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ToggleButton = Base.create('button-toggle', Button, [], {
	EVENTS: {
		click: function () {
			this.toggle();
		}
	}
});
/**
 * A group of buttons that can be styled as a pill
 * @class ButtonGroup
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ButtonGroup = Base.create('button-group', Widget, [WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: $.Button
		},
		/**
		 * @attribute pill
		 * @description Whether this button group should be styled as a pill
		 * @type Boolean
		 * @default false
		 */
		pill: {
			value: false,
			validator: Lang.isBoolean
		}
	}
}, {
	
	_uiPillChange: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName(PILL), e.newVal);
	},
	
	initializer: function () {
		this.after('pillChange', this._uiPillChange);
	},
	
	renderUI: function (boundingBox) {
		boundingBox.toggleClass(this.getClassName(PILL), this.get(PILL));
	}
});
			
});
