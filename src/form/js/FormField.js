
/**
 * @class FormField
 * @extends Widget
 * @uses WidgetChild
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.FormField = $.Base.create('formfield', $.Widget, [$.WidgetChild], {
	ATTRS: {
		/**
		 * @attribute value
		 * @description value of the input node
		 * @default ''
		 */
		value: {
			value: ''
		},
		/**
		 * @attribute label
		 * @description Label for the input node
		 * @default ''
		 */
		label: {
			value: ''
		},
		htmlType: {
			value: 'text'
		}
	}
}, {
	/**
	 * @property CONTENT_TEMPLATE
	 * @type String
	 * @default '<label/>'
	 */
	CONTENT_TEMPLATE: '<label/>',
	
	_syncDom2Attr: function(attrName) {
		this.set(attrName, this._inputNode.attr(attrName));
	},
	_syncAttr2Dom: function(e) {
		this._inputNode.attr(e.attrName, e.newVal);
	},
	
	initializer: function() {
		this._inputNode = $('<input/>').attr({
			id: this.get('id') + '_input'
		});
		
		this.after('valueChange', this._syncAttr2Dom);
		this.after('legendChange', this.syncUI);
	},
	renderUI: function(boundingBox, contentBox) {
		this._inputNode.attr('type', this.get('htmlType')).value(this.get('value')).prependTo(boundingBox);
		contentBox.attr('htmlFor', this._inputNode.attr('id'));
	},
	bindUI: function() {
		this._handlers.push(
			this._inputNode.on('change', $.bind(this._syncDom2Attr, this, 'value'))
		);
	},
	syncUI: function() {
		this.get('contentBox').html(this.get('label'));
	}
});
