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
