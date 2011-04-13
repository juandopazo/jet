
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
		
	}
}, {
	
	_bgVisibleChange: function (e) {
		var action = e.newVal ? 'show' : 'hide';
		this.bg[action]();
		this.bg.each(function (button) {
			button[action]();
		});
	},
	
	renderUI: function () {
		var buttonGroup = this.bg = new $.ButtonGroup({
			children: this.get('buttons')
		});
		buttonGroup.render(this.get(FOOTER));
		buttonGroup.get(BOUNDING_BOX).css(VISIBILITY, 'inherit');
	},
	
	bindUI: function () {
		this.after('visibleChange', this._bgVisibleChange);
	}
	
});