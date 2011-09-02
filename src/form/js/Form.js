
/**
 * @class Form
 * @extends Widget
 * @uses WidgetParent
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Form = $.Base.create('form', $.Widget, [$.WidgetParent], {
	ATTRS: {
		/**
		 * @attribute defaultChildType
		 * @default 'FieldSet'
		 */
		defaultChildType: {
			value: 'FieldSet'
		},
		/**
		 * @attribute action
		 * @description The target URL for the form
		 * @
		 */
		action: {
			value: ''
		}
	}
}, {
	CONTENT_TEMPLATE: '<form/>',
	
	_relaySubmit: function(e) {
		this.fire('submit', { domEvent: e });
	},
	
	initializer: function() {
		this.after('actionChange', this.syncUI)
	},
	bindUI: function(boundingBox, contentBox) {
		this._handlers.push(
			contentBox.on('submit', this._relaySubmit, this)
		);
	},
	syncUI: function() {
		this.get('contentBox').attr('action', this.get('action'));
	}
});
