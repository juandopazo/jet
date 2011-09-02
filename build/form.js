/**
 * A Form widget
 * @module form
 * @requires widget
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('form', function ($) {

			
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

/**
 * A Checkbox
 * @class CheckBox
 * @extends FormField
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.CheckBox = $.Base.create('checkbox', $.FormField, [], {
	ATTRS: {
		/**
		 * @attribute checked
		 * @description Maps to the DOM attribute
		 * @default false
		 */
		checked: {
			value: false
		},
		htmlType: {
			value: 'checkbox'
		}
	}
}, {
	initializer: function () {
		this.after('checkedChange', this._syncAttr2Dom);
	},
	
	bindUI: function () {
		this._handlers.push(
			this._inputNode.on('click', $.bind(this._syncDom2Attr, this, 'checked'))
		);
	},
	
	syncUI: function() {
		this._inputNode.attr('checked', this.get('checked'));
	},
	
	initializer: function () {
		this.after('selectedChange', this._uiCheckBoxSelect);
	}
});
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

			
});
