
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
		 * @config value
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
		 * @config text
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
		childType: {
			value: $.ComboOption,
			readOnly: true
		},
		multiple: {
			value: false,
			readOnly: true
		}
	},
	EVENTS: {
		selectionChange: function (e, val) {
			this.get(CONTENT_BOX)[0].selectedIndex = val.get('index');
		}
	}
}, {
	CONTENT_TEMPLATE: '<select/>'
});