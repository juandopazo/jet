/**
 * Different kinds of buttons and form elements
 * @module button
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('button', function ($) {

			
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

if (!jet.Button) {
	jet.Button = {};
}

if (!jet.Button.buttons) {
	jet.Button.buttons = 1;
}

/**
 * A button widget
 * @class Button
 * @extends Widget
 * @uses WidgetChild
 * @param {Object} config Object literal specifying widget configuration properties
 */
var Button = Base.create('button', Widget, [WidgetChild], {
	
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
		enabledChange: function (e, val) {
			var boundingBox = this.get(BOUNDING_BOX);
			var disabledClass = this.getClassName('disabled');
			if (!val) {
				boundingBox.addClass(disabledClass);
			} else {
				disabledClass.removeClass(disabledClass);
			}
			this.get(CONTENT_BOX)._nodes[0].disabled = !val;
		},
		
		labelContentChange: function (e, val) {
			var labelNode = this.get(LABEL_NODE);
			if (Lang.isString(val)) {
				labelNode.html(val);
				if (!labelNode.parent()._nodes[0]) {
					this.get(BOUNDING_BOX).prepend(labelNode);
				}
			} else {
				labelNode.remove();
			}
		},
		
		textChange: function (e, val) {
			this.get(CONTENT_BOX).html(val);
		},
		
		afterFocus: function (e) {
			this.get(BOUNDING_BOX).addClass(this.getClassName(FOCUS));
			this.get(CONTENT_BOX).focus();
		},
		
		afterBlur: function (e) {
			this.get(BOUNDING_BOX).removeClass(this.getClassName(FOCUS));
			this.get(CONTENT_BOX).blur();
		},
		
		mouseover: function (e, domEvent) {
			this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
		},
		
		mouseout: function (e, domEvent) {
			this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
		},
		
		render: function () {
			var id = this.getClassName('content', this._uid);
			var contentBox = this.get(CONTENT_BOX).attr(ID, id).html(this.get('text'));
			var labelNode = this.get(LABEL_NODE);
			var label = this.get('labelContent');
			labelNode._nodes[0].setAttribute('for', id);
			if (Lang.isString(label)) {
				this.get(BOUNDING_BOX).prepend(labelNode.html(label));
			}
			contentBox._nodes[0].disabled = !this.get(ENABLED);
			this._handlers.push(contentBox.on(FOCUS, this._onDomFocus, this));
			this._handlers.push(contentBox.on(BLUR, this._onDomBlur, this));
		},
		
		destroy: function () {
			this.get(CONTENT_BOX).unbind(FOCUS, this._onDomFocus).unbind(BLUR, this._onDomBlur);
			this.get(LABEL_NODE).remove();
		}
	}
	
}, {
	CONTENT_TEMPLATE: '<button/>',
	LABEL_TEMPLATE: '<label/>',
	/**
	 * Disables the button
	 * @method disable
	 * @chainable
	 */
	disable: function () {
		return this.set(ENABLED, false);
	},
	/**
	 * Enables the button
	 * @method enable
	 * @chainable
	 */
	enable: function () {
		return this.set(ENABLED, true);
	},
	
	initializer: function () {
		this.set(LABEL_NODE, this.get(LABEL_NODE) || this.LABEL_TEMPLATE);
		this._onDomFocus = $.bind(this.focus, this);
		this._onDomBlur = $.bind(this.blur, this);
	}
	
});
$.Button = Button;
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
	},
	
	EVENTS: {
		pillChange: function (e, pill) {
			var boundingBox = this.get(BOUNDING_BOX);
			var pillClass = this.getClassName(PILL);
			if (pill) {
				boundingBox.addClass(pillClass);
			} else {
				boundingBox.removeClass(pillClass);
			}
		},
		
		render: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			var pillClass = this.getClassName(PILL);
			if (this.get(PILL)) {
				boundingBox.addClass(pillClass);
			} else {
				boundingBox.removeClass(pillClass);
			}
		}
	}
});
/**
 * An option of a <select> element
 * @class ComboOption
 * @extends Widget
 * @uses WidgetChild
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ComboOption = Base.create('combo-option', Widget, [WidgetChild], {
	ATTRS: {
		/**
		 * @attribute value
		 * @description Sets/returns the value of the option
		 */
		value: {
			getter: function () {
				return this.get(BOUNDING_BOX).value();
			},
			setter: function (val) {
				this.get(BOUNDING_BOX).value(val);
				return val;
			}
		},
		/**
		 * @attribute text
		 * @description Sets/returns the text of the option
		 */
		text: {
			getter: function () {
				return this.get(BOUNDING_BOX).attr('text');
			},
			setter: function (val) {
				this.get(BOUNDING_BOX).attr('text', val);
				return val;
			}
		}
	}
}, {
	BOUNDING_TEMPLATE: '<option/>',
	CONTENT_TEMPLATE: null
});

/**
 * A ComboBox is a select html element
 * @class ComboBox
 * @extends Button
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ComboBox = Base.create('combobox', Button, [WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: $.ComboOption
		},
		multiple: {
			value: false,
			readOnly: true
		}
	},
	EVENTS: {
		selectionChange: function (e, val) {
			this.get(CONTENT_BOX)._nodes[0].selectedIndex = val.get('index');
		}
	}
}, {
	CONTENT_TEMPLATE: '<select/>'
});
if (!Lang.isNumber(jet.Button.radio)) {
	jet.Button.radio = 0;
}

/**
 * A radio button
 * @class RadioButton
 * @extends Button
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.RadioButton = Base.create('radio', Button, [], {
	EVENTS: {
		selectedChange: function (e, val) {
			this.get(CONTENT_BOX)._nodes[0].checked = !!val;
		},
		render: function () {
			this.get(CONTENT_BOX).attr({
				type: 'radio',
				name: this.get(PARENT).get(NAME)
			});
		}
	}
}, {
	CONTENT_TEMPLATE: '<input/>'
});

/**
 * A group of radio buttons that interact together
 * @class RadioGroup
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.RadioGroup = Base.create('radio-group', Widget, [WidgetParent], {
	ATTRS: {
		/**
		 * @attribute multiple
		 * @description Boolean indicating if multiple children can be selected at once. Whether or not multiple selection is enabled is always delegated to the value of the multiple attribute of the root widget in the object hierarchy
		 * @default false
		 * @readOnly
		 */
		multiple: {
			value: false,
			readOnly: true
		},
		/**
		 * @attribute name
		 * @description Name attribute of all radio buttons in the group
		 * @readOnly
		 */
		name: {
			writeOnce: true
		},
		defaultChildType: {
			value: $.RadioButton
		}
	}
}, {
	initializer: function () {
		this.set(NAME, this.getClassName(++jet.Button.radio));
	}
});
if (!Lang.isNumber(jet.Button.checkbox)) {
	jet.Button.checkbox = 0;
}

/**
 * A Checkbox
 * @class CheckBox
 * @extends Button
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.CheckBox = Base.create('checkbox', Button, [], {
	EVENTS: {
		selectedChange: function (e, val) {
			this.get(CONTENT_BOX)._nodes[0].checked = !!val;
		},
		render: function () {
			this.get(CONTENT_BOX).attr({
				type: 'checkbox',
				name: this.get(PARENT).get(NAME)
			});
		}
	}
}, {
	CONTENT_TEMPLATE: '<input/>'
});

/**
 * A group of checkboxes that interact together
 * @class CheckBoxGroup
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.CheckBoxGroup = Base.create('checkbox-group', Widget, [WidgetParent], {
	ATTRS: {
		/**
		 * @attribute name
		 * @description Name attribute of all checkboxes in the group
		 * @readOnly
		 */
		name: {
			writeOnce: true
		},
		defaultChildType: {
			value: $.CheckBox
		}
	}
}, {
	initializer: function () {
		this.set(NAME, this.getClassName(+jet.Button.checkbox));
	}
});
			
});