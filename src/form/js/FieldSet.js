
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
		name: {
			getter: function () {
				return this.get('id');
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
	CONTENT_TEMPLATE: null,
	/**
	 * @property LEGEND_TEMPLATE
	 * @type String
	 * @default '<legend/>'
	 */
	LEGEND_TEMPLATE: '<legend/>',
	
	_afterLegendChange: function (e) {
		var legendNode = this._legendNode,
			appended = legendNode.parent().size() > 0;
		if (e.newVal) {
			legendNode.html(e.newVal);
			if (!appended) {
				legendNode.prependTo(this.get('boundingBox'));
			}
		} else if (appended) {
			legendNode.remove();
		}
	},
	
	initializer: function() {
		this._legendNode = $(this.LEGEND_TEMPLATE);
	},
	syncUI: function() {
		this._afterLegendChange({ newVal: this.get('legend') });
	},
	
	toJSON: function () {
		var result = {};
		this.each(function (field) {
			result[field.get("name")] = field.toJSON();
		});
		return result;
	}
});
