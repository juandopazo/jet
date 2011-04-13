
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
$.CheckBox = Base.create('checkbox', Button, [], {}, {
	CONTENT_TEMPLATE: '<input/>',
	
	_uiCheckBoxSelect: function (e) {
		this.get(CONTENT_BOX)._nodes[0].checked = !!e.newVal;
	},
	
	renderUI: function () {
		this.get(CONTENT_BOX).attr({
			type: 'checkbox',
			name: this.get(PARENT).get(NAME)
		});
	},
	
	bindUI: function () {
		this.after('selectedChange', this._uiCheckBoxSelect);
	}
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
			value: 'CheckBox'
		}
	}
}, {
	initializer: function () {
		this.set(NAME, this.getClassName(+jet.Button.checkbox));
	}
});