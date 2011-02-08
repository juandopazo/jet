/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Different kinds of buttons and form elements
 * @module button
 * @require jet, node, base
 * @namespace
 */
jet().add('button', function ($) {
	
	var A = $.Array,
		Hash = $.Hash,
		Lang = $.Lang,
		jet = jet,
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
		ID = 'id';
	
	if (!jet.Button) {
		jet.Button = {};
	}
	
	if (!jet.Button.buttons) {
		jet.Button.buttons = 1;
	}
	
	/**
	 * Base class for all buttons
	 * @class ButtonBase
	 * @extends Widget
	 * @uses WidgetChild
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Button = Widget.create('button', [WidgetChild], {
		enabled: {
			value: true,
			validator: Lang.isBoolean
		},
		labelNode: {
			value: $('<label/>'),
			readOnly: true
		},
		label: {
			value: null,
			validator: Lang.isString
		},
		id: {
			value: ++jet.Button.buttons,
			readOnly: true
		}
	}, {
		enabledChange: function (e, val) {
			var boundingBox = this.get(BOUNDING_BOX);
			var disabledClass = this.getClassName('disabled');
			if (!val) {
				boundingBox.addClass(disabledClass);
			} else {
				disabledClass.removeClass(disabledClass);
			}
			this.get(CONTENT_BOX)[0].disabled = !val;
		},
		
		labelChange: function (e, val) {
			var labelNode = this.get(LABEL_NODE);
			if (Lang.isString(val)) {
				labelNode.html(val);
				if (!labelNode.parent()[0]) {
					this.get(BOUNDING_BOX).prepend(labelNode);
				}
			} else {
				labelNode.remove();
			}
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
			var id = this.get(ID);
			var contentBox = this.get(CONTENT_BOX).attr(ID, id);
			var labelNode = this.get(LABEL_NODE);
			var label = this.get('label');
			labelNode[0].setAttribute('for', id);
			if (Lang.isString(label)) {
				this.get(BOUNDING_BOX).prepend(labelNode.html(label));
			}
			contentBox[0].disabled = !this.get(ENABLED);
		},
		
		initializer: function () {
			var self = this;
			this._onDomFocus = function (e) {
				self.focus();
			};
			this._onDomBlur = function (e) {
				self.blur();
			};
			this.get(CONTENT_BOX).on(FOCUS, this._onDomFocus).on(BLUR, this._onDomBlur);
		},
		
		destroy: function () {
			this.get(CONTENT_BOX).unbind(FOCUS, this._onDomFocus).unbind(BLUR, this._onDomBlur);
			this.get(LABEL_NODE).remove();
		}
	}, {
		CONTENT_TEMPLATE: '<button/>',
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
		}
	});
	$.Button = Button;

	
	$.ComboOption = Widget.create('combo-option', [WidgetChild], {
		value: {
			getter: function () {
				return this.get(BOUNDING_BOX).value();
			},
			setter: function (val) {
				this.get(BOUNDING_BOX).value(val);
				return val;
			}
		},
		text: {
			getter: function () {
				return this.get(BOUNDING_BOX).attr('text');
			},
			setter: function (val) {
				this.get(BOUNDING_BOX).attr('text', val);
				return val;
			}
		}
	}, {}, {
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
	$.ComboBox = Widget.create('combobox', [WidgetParent], {
		childType: {
			value: $.ComboOption,
			readOnly: true
		},
		multiple: {
			value: false,
			readOnly: true
		}
	}, {
		selectionChange: function (e, val) {
			this.get(CONTENT_BOX)[0].selectedIndex = val.get('index');
		}
	}, {
		CONTENT_TEMPLATE: '<select/>'
	}, Button);
	
	/**
	 * A RadioButton
	 * @class RadioButton
	 * @extends Button
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.RadioButton = Widget.create('radio', [], {}, {
		selectedChange: function (e, val) {
			this.get(CONTENT_BOX)[0].checked = !!val;
		},
		render: function () {
			this.get(CONTENT_BOX).attr('type', 'radio');
		}
	}, {
		CONTENT_TEMPLATE: '<input/>'
	}, Button);
	
	/**
	 * A group of Radio buttons that interact together
	 * @class RadioGroup
	 * @extends Widget
	 * @uses WidgetParent
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.RadioGroup = Widget.create('radio-group', [WidgetParent]);
	
	/**
	 * A Checkbox
	 * @class CheckBox
	 * @extends Button
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.CheckBox = Widget.create('checkbox', [], {}, {
		selectedChange: function (e, val) {
			this.get(CONTENT_BOX)[0].checked = !!val;
		},
		render: function () {
			this.get(CONTENT_BOX).attr('type', 'checkbox');
		}
	}, {
		CONTENT_TEMPLATE: '<input/>'
	}, Button);
	
	/**
	 * A group of checkboxes that interact together
	 * @class CheckBoxGroup
	 * @extends Widget
	 * @uses WidgetParent
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	$.CheckBoxGroup = Widget.create('checkbox-group', [WidgetParent]);
		
});
