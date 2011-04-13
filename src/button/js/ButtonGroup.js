
/**
 * A group of buttons that can be styled as a pill
 * @class ButtonGroup
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ButtonGroup = Base.create('button-group', Widget, [WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: $.Button
		},
		/**
		 * @attribute pill
		 * @description Whether this button group should be styled as a pill
		 * @type Boolean
		 * @default false
		 */
		pill: {
			value: false,
			validator: Lang.isBoolean
		}
	}
}, {
	
	_uiPillChange: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName(PILL), e.newVal);
	},
	
	renderUI: function (boundingBox) {
		boundingBox.toggleClass(this.getClassName(PILL), this.get(PILL));
	}
});