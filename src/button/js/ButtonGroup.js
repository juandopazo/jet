
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
		 * @config pill
		 * @description Whether this button group should be styled as a pill
		 * @type Boolean
		 * @default false
		 */
		pill: {
			value: false,
			validator: Lang.isBoolean
		}
	},
	
	EVENTS: {
		pillChange: function (e, pill) {
			var boundingBox = this.get(BOUNDING_BOX);
			var pillClass = this.getClassName(PILL);
			if (pill) {
				boundingBox.addClass(pillClass);
			} else {
				boundingBox.removeClass(pillClass);
			}
		},
		
		render: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			var pillClass = this.getClassName(PILL);
			if (this.get(PILL)) {
				boundingBox.addClass(pillClass);
			} else {
				boundingBox.removeClass(pillClass);
			}
		}
	}
});