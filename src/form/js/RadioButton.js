
/**
 * A radio button
 * @class RadioButton
 * @extends Button
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.RadioButton = $.Base.create('radio', $.FormField, [], {}, {
	CONTENT_TEMPLATE: '<input/>',
	
	_rbSelectionChange: function (e) {
		this.get(CONTENT_BOX).getDOMNode().checked = !!e.newVal;
	},
	_insertLabel: function () {
		this._labelNode.appendTo(this.get("boundingBox"));
	},
	initializer: function () {
		this.after("selectionChange", this._rbSelectionChange);
	},
	renderUI: function (boundingBox, contentBox) {
		contentBox.attr({
			type: 'radio',
			name: this.get("parent").get("name")
		});
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
$.RadioGroup = $.Base.create('radio-group', $.Widget, [$.WidgetParent], {
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
				return this.get("id");
			}
		},
		defaultChildType: {
			value: $.RadioButton
		},
		value: {
			getter: function () {
				return this.get("selection").get("value");
			}
		}
	}
}, {
	_syncRadioSelection: function (e) {
		if (e.newVal) {
			e.newVal.get("contentBox").getDOMNode().checked = true;
		}
	},
	initializer: function () {
		this.after("selectionChange", this._syncRadioSelection);
	},
	syncUI: function () {
		this._syncRadioSelection({
			newVal: this.get("selection")
		});
	}
});