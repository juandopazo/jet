
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
			type: 'radio',
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