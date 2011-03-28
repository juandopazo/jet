
/**
 * A SimpleDialog is a Panel with simple form options and a button row instead of the footer
 * @class SimpleDialog
 * @extends Panel
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.SimpleDialog = Base.create('dialog', $.Panel, [], {
	ATTRS: {
		
		/**
		 * @attribute buttons
		 * @description An array of button configuration objects
		 * @default []
		 * @type Array
		 */
		buttons: {
			value: []
		},
		footerContent: {
			value: ' ',
			readOnly: true
		}
		
	},
	EVENTS: {
		render: function (e) {
			var buttonGroup = this.bg = new $.ButtonGroup({
				children: this.get('buttons')
			});
			buttonGroup.render(this.get(FOOTER));
			buttonGroup.get(BOUNDING_BOX).css(VISIBILITY, 'inherit');
		},
		afterHide: function () {
			this.bg.hide();
			this.bg.each(function (button) {
				button.hide();
			});
		},
		afterShow: function () {
			this.bg.show();
			this.bg.each(function (button) {
				button.show();
			});
		}
	}
});