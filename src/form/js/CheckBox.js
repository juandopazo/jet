
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
	bindUI: function (boundingBox, contentBox) {
		this._handlers.push(
			contentBox.on('click', $.bind(this._syncDom2Attr, this, 'checked'))
		);
	},
	syncUI: function() {
		this.get("contentBox").attr('checked', this.get('checked'));
	}
});