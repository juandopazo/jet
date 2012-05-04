/**
 * A Form widget
 * @module form
 * @requires widget
 * 
 * Copyright (c) 2012, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('form', function ($) {
"use strict";

			
/**
 * @class FormField
 * @extends Widget
 * @uses WidgetChild
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.FormField = $.Base.create('formfield', $.Widget, [$.WidgetChild], {
	ATTRS: {
		/**
		 * @attribute value
		 * @description value of the input node
		 * @default ''
		 */
		value: {
			value: ''
		},
		/**
		 * @attribute label
		 * @description Label for the input node
		 * @default ''
		 */
		label: {
			value: ''
		},
		/**
		 * @attribute title
		 * @description Title to apply to the bounding box
		 * @default ''
		 */
		title: {
			value: ''
		}
	}
}, {
	BOUNDING_TEMPLATE: '<span/>',
	/**
	 * @property CONTENT_TEMPLATE
	 * @type String
	 * @default '<input/>'
	 */
	CONTENT_TEMPLATE: '<input/>',
	
	_ffDisabledChange: function (e) {
		this.get('contentBox').getDOMNode().disabled = e.newVal;
	},
	_ffFocusedChange: function (e) {
		var fieldNode = this.get('contentBox').getDOMNode();
		if (e.newVal) {
			fieldNode.focus();
		} else {
			fieldNode.blur();
		}
	},
	_insertLabel: function () {
		this._labelNode.prependTo(this.get('boundingBox'));
	},
	_syncLabel: function (e) {
		var labelNode = this._labelNode,
			appended = labelNode.parent().size() > 0;
		if (e.newVal) {
			labelNode.html(e.newVal);
			if (!appended) {
				this._insertLabel();
			}
		} else if (appended) {
			labelNode.remove();
		}
	},
	_syncDom2Attr: function (attrName) {
		this.set(attrName, this.get('contentBox').attr(attrName));
	},
	_syncAttr2Dom: function (e) {
		this.get('contentBox').attr(e.attrName, e.newVal);
	},
	_setFieldValue: function (value) {
		this.get('contentBox').attr('value', value);
	},
	
	initializer: function () {
		this._labelNode = $('<label/>');
		
		this.after({
			valueChange: this._syncAttr2Dom,
			labelChange: this._syncLabel,
			disabledChange: this._ffDisabledChange,
			focusedChange: this._ffFocusedChange
		});
	},
	renderUI: function () {
		var fieldId = this.get('id') + '_field';
		this.get('contentBox').attr('id', fieldId);
		this._setFieldValue(this.get('value'));
		this._labelNode.attr('htmlFor', fieldId);
	},
	bindUI: function () {
		this._handlers.push(
			this.get('contentBox').on('change', $.bind(this._syncDom2Attr, this, 'value'))
		);
	},
	syncUI: function () {
		this._syncLabel({ newVal: this.get('label') });
		this.get('boundingBox').attr('title', this.get('title'));
		this._ffDisabledChange({ newVal: this.get('disabled') });
	},
	
	toJSON: function () {
		return this.getAttrs(['id', 'name', 'value']);
	}
});

$.TextField = $.Base.create('textfield', $.FormField, [], {}, {
	renderUI: function () {
		this.get('contentBox').attr('type', 'text');
	}
});

$.PasswordField = $.Base.create('password', $.FormField, [], {}, {
	renderUI: function () {
		this.get('contentBox').attr('type', 'password');
	}
});

/**
 * A Checkbox
 * @class CheckBox
 * @extends FormField
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.CheckBoxField = $.Base.create('checkbox', $.FormField, [], {
	ATTRS: {
		/**
		 * @attribute checked
		 * @description Maps to the DOM attribute
		 * @default false
		 */
		checked: {
			value: false
		},
		htmlType: {
			value: 'checkbox'
		}
	}
}, {
	_insertLabel: function () {
		this._labelNode.appendTo(this.get("boundingBox"));
	},
	initializer: function () {
		this.after('checkedChange', this._syncAttr2Dom);
		this.after('selectedChange', this._uiCheckBoxSelect);
	},
	renderUI: function () {
		this.get('contentBox').attr('type', 'checkbox');
	},
	bindUI: function () {
		this._handlers.push(
			this.get('contentBox').on('click', $.bind(this._syncDom2Attr, this, 'checked'))
		);
	},
	syncUI: function () {
		this.get("contentBox").attr('checked', this.get('checked'));
	}
});
/**
 * @class FieldSet
 * @extends Widget
 * @uses WidgetParent
 * @uses WidgetChild
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.FieldSet = $.Base.create('fieldset', $.Widget, [$.WidgetChild, $.WidgetParent], {
	ATTRS: {
		/**
		 * @attribute defaultChildType
		 * @default FormField
		 */
		defaultChildType: {
			value: 'FormField'
		},
		/**
		 * @attribute legend
		 * @description A title for a fieldset, using a <legend> tag
		 * @default ''
		 */
		legend: {
			value: ''
		},
		name: {
			getter: function () {
				return this.get('id');
			}
		}
	}
}, {
	/**
	 * @property BOUNDING_TEMPLATE
	 * @type String
	 * @default '<fieldset/>'
	 */
	BOUNDING_TEMPLATE: '<fieldset/>',
	CONTENT_TEMPLATE: null,
	/**
	 * @property LEGEND_TEMPLATE
	 * @type String
	 * @default '<legend/>'
	 */
	LEGEND_TEMPLATE: '<legend/>',
	
	_afterLegendChange: function (e) {
		var legendNode = this._legendNode,
			appended = legendNode.parent().size() > 0;
		if (e.newVal) {
			legendNode.html(e.newVal);
			if (!appended) {
				legendNode.prependTo(this.get('boundingBox'));
			}
		} else if (appended) {
			legendNode.remove();
		}
	},
	
	initializer: function () {
		this._legendNode = $(this.LEGEND_TEMPLATE);
		this.on('addChild', $.Form.prototype._setChildType);
	},
	syncUI: function () {
		this._afterLegendChange({ newVal: this.get('legend') });
	},
	
	toJSON: function () {
		var result = {};
		this.each(function (field) {
			result[field.get("name")] = field.toJSON();
		});
		return result;
	}
});
var createTag = function (tag) {
	return $.config.doc.createElement(tag);
};

var addOption = function (combo, text, value) {
	/* Note by jdopazo:
	 Lazy initialization for the function _add()
	 I create a <select> element that I never attach to the dom
	 and try to attach an <'option'> element to it with try...catch
	 This way I avoid using try...catch every time this function is called */
	var testSelect = createTag('select'),
		testOption = createTag('option'),
		standards = false;
	try {
		testSelect.add(testOption, null); //standards compliant
		standards = true;
	} catch (ex) {
		testSelect.add(testOption); // IE only
	}
	if (standards) {
		addOption = function (combo, text, value) {
			var newOption = createTag('option');
			newOption.text = text;
			if (value) {
				newOption.value = value;
			}
			combo.add(newOption, null);
		};
	} else {
		addOption = function (combo, text, value) {
			var newOption = createTag('option');
			newOption.text = text;
			if (value) {
				newOption.value = value;
			}
			combo.add(newOption);
		};
	}
	addOption(combo, text, value);
};

/**
 * A SelectField is a select html element
 * @class SelectField
 * @extends Button
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.SelectField = $.Base.create('select-field', $.FormField, [], {
	ATTRS: {
		options: {
			value: []
		},
		selected: {
			validator: $.Lang.isNumber,
			getter: function () {
				var combo = this.get('contentBox').getDOMNode(); 
				return combo.options[combo.selectedIndex];
			},
			setter: function (val) {
				var combo = this.get('contentBox').getDOMNode();
				if (val >= 0 && this.fire('change', combo.options[val])) {
					combo.selectedIndex = val;
				}
				return val;
			}
		},
		count: {
			readOnly: true,
			getter: function () {
				return this.get('contentBox').getDOMNode().options.length;
			}
		},
		value: {
			readOnly: true,
			getter: function () {
				var selected = this.get('selected');
				return selected && (selected.value ? selected.value : selected.text);
			}
		}
	}
}, {
	CONTENT_TEMPLATE: '<select/>',
	
	_setOptions: function (combo, opts) {
		$.Array.forEach(opts, function (value) {
			if ($.Lang.isObject(value)) {
				$.Object.each(value, function (text, val) {
					addOption(combo, text, val);
				});
			} else {
				addOption(combo, value);
			}
		});
	},
	_afterOptionsChange: function (e) {
		var combo = this.get('contentBox').getDOMNode();
		combo.options.length = 0;
		this._setOptions(combo, e.newVal);
	},
	_setFieldValue: function () {
		
	},
	
	initializer: function () {
		this.after('optionsChange', this._afterOptionsChange);
	},
	renderUI: function () {
		this._setOptions(this.get('contentBox').getDOMNode(), this.get('options'));
	},
	bindUI: function () {
		var self = this;
		this._handlers.push(
			this.get('contentBox').on('change', function (e) {
				self.fire('change', {
					newVal: this.options[this.selectedIndex]
				});
			})
		);
	},
	/**
	 * @method add
	 * @description Adds options to the combo box
	 * @param {String | Object} The text value of the option, or alternatively 
	 * a hash which key is the text and the value is the option's value
	 * @param {String} value optional - The value of the option
	 * @chainable
	 */
	add: function (text, value) {
		var opt;
		if (value) {
			opt = {};
			opt[text] = value;
		} else {
			opt = text;
		}
		this.get('options').push(opt);
		addOption(this.get('contentBox').getDOMNode(), text, value);
		return this;
	},
	/**
	 * @method fill
	 * @description Adds several options to the select
	 * @param {Array} values An array of text values that behave like the 'text' parameter of the add() method
	 * @chainable
	 */
	fill: function (values) {
		if ($.Lang.isArray(values)) {
			$.Array.forEach(values, function (t) {
				this.add(t);
			}, this);
		} else {
			$.Object.each(values, this.add, this);
		}
		return this;
	},
	/**
	 * @method clear
	 * @description Removes all options from the combo box
	 * @chainable
	 */
	clear: function () {
		return this.set('options', []);
	},
	/**
	 * @method select
	 * @description Selects a certain option based on an index
	 * @param {Number} index
	 * @chainable
	 */
	select: function (index) {
		return this.set('selected', index);
	},
	
	toJSON: function () {
		var selected = this.get('selected'),
			result = {
				id: this.get('id'),
				text: selected.text
			};
		if (selected.value) {
			result.value = selected.value;
		}
		return result;
	}
});

/**
 * A radio button
 * @class RadioButton
 * @extends Button
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.RadioButton = $.Base.create('radio', $.FormField, [], {}, {
	CONTENT_TEMPLATE: '<input/>',
	
	_rbSelectedChange: function (e) {
		if (e.newVal && e.src != 'dom') {
			this.get('contentBox').getDOMNode().checked = true;
		}
	},
	_rbCheckedChange: function () {
		this.set('selected', this.get('contentBox').getDOMNode().checked, { src: 'dom' });
	},
	_insertLabel: function () {
		this._labelNode.appendTo(this.get('boundingBox'));
	},
	initializer: function () {
		this.after('selectedChange', this._rbSelectedChange);
	},
	renderUI: function () {
		this.get('contentBox').attr({
			childType: 'radio',
			name: this.get('parent').get('name')
		});
	},
	bindUI: function () {
		this._handlers.push(
			this.get('contentBox').on('change', this._rbCheckedChange, this)
		);
	}
});

/**
 * A group of radio buttons that interact together
 * @class RadioGroup
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.RadioField = $.Base.create('radio-group', $.Widget, [$.WidgetParent], {
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
			writeOnce: true,
			valueFn: function () {
				return this.get('id');
			}
		},
		defaultChildType: {
			value: $.RadioButton
		},
		value: {
			getter: function () {
				return this.get('selection').get('value');
			}
		}
	}
});
$.TextareaField = $.Base.create('textarea', $.FormField, [], {}, {
	CONTENT_TEMPLATE: '<textarea/>'
});

/**
 * @class Form
 * @extends Widget
 * @uses WidgetParent
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Form = $.Base.create('form', $.Widget, [$.WidgetParent], {
	ATTRS: {
		/**
		 * @attribute defaultChildType
		 * @default 'FieldSet'
		 */
		defaultChildType: {
			value: 'FormField'
		},
		/**
		 * @attribute action
		 * @description The target URL for the form
		 * @
		 */
		action: {
			value: ''
		}
	},
	ALIASES: {
		checkbox: 'CheckBoxField',
		fieldset: 'FieldSet',
		radio: 'RadioField',
		select: 'SelectField',
		textarea: 'TextareaField',
		text: 'TextField',
		password: 'PasswordField'
	}
}, {
	CONTENT_TEMPLATE: '<form/>',
	
	_relaySubmit: function (e) {
		this.fire('submit', { domEvent: e });
	},
	_registerField: function (e) {
		var field = e.child;
		if (field.get('type') === $.FieldSet) {
			field.each(function (child) {
				this._registerField({ child: child });
			}, this);
		} else {
			this._fields[field.get('name')] = field;
		}
	},
	_setChildType: function (e) {
		if ($.Form.ALIASES[e.child.childType]) {
			e.child.childType = $.Form.ALIASES[e.child.childType];
		}
	},
	
	initializer: function () {
		this.after('actionChange', this.syncUI);
		
		this._fields = {};
		this.on('addChild', this._setChildType);
		this.on('afterAddChild', this._registerField);
	},
	bindUI: function () {
		this._handlers.push(
			this.get('contentBox').on('submit', this._relaySubmit, this)
		);
	},
	syncUI: function () {
		this.get('contentBox').attr('action', this.get('action'));
	},
	
	getField: function (name) {
		return this._fields[name];
	},
	
	toJSON: $.FieldSet.prototype.toJSON
});

			
});
