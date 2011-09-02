
/**
 * A Checkbox
 * @class CheckBox
 * @extends FormField
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.CheckBox = $.Base.create('checkbox', $.FormField, [], {
	ATTRS: {
		/**
		 * @attribute checked
		 * @description Maps to the DOM attribute
		 * @default false
		 */
		checked: {
			value: false
		}
	}
}, {
	initializer: function () {
		this.after('checkedChange', this._syncAttr2Dom);
	},
	
	bindUI: function () {
		this._handlers.push(
			this._inputNode.on('click', $.bind(this._syncDom2Attr, this, 'checked'))
		);
	},
	
	initializer: function () {
		this.after('selectedChange', this._uiCheckBoxSelect);
	}
});