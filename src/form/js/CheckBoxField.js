
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
		}
	}
}, {
	_insertLabel: function () {
		this._labelNode.appendTo(this.get("boundingBox"));
	},
	initializer: function () {
		this.after('checkedChange', this._syncAttr2Dom);
		this.after('selectedChange', this._uiCheckBoxSelect);

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