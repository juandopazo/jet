
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
			this.get(CONTENT_BOX)[0].checked = !!val;
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
		 * @config multiple
		 * @description Boolean indicating if multiple children can be selected at once. Whether or not multiple selection is enabled is always delegated to the value of the multiple attribute of the root widget in the object hierarchy
		 * @default false
		 * @readOnly
		 */
		multiple: {
			value: false,
			readOnly: true
		},
		/**
		 * @config name
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