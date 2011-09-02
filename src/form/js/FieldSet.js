
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
		/**
		 * @config buttons
		 * @description A list of buttons for a ButtonGroup inside the FieldSet
		 * @default []
		 */
		buttons: {
			valueFn: function() {
				return [];
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
	/**
	 * @property CONTENT_TEMPLATE
	 * @type String
	 * @default '<legend/>'
	 */
	CONTENT_TEMPLATE: '<legend/>',
	
	initializer: function() {
		this._buttons = new $.ButtonGroup({
			children: this.get('buttons')
		});
	},
	renderUI: function(boundingBox, contentBox) {
		this._buttons.render(contentBox);
	},
	syncUI: function() {
		this.get('contentBox').html(this.get('legend'));
	}
});
