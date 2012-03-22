
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
	 * @default '<input/>'
	 */
	CONTENT_TEMPLATE: '<input/>',
	
	_ffDisabledChange: function (e) {
		this.get("contentBox").getDOMNode().disabled = e.newVal;
	},
	_ffFocusedChange: function (e) {
		var fieldNode = this.get("contentBox").getDOMNode();
		if (e.newVal) {
			fieldNode.focus();
		} else {
			fieldNode.blur();
		}
	},
	_insertLabel: function () {
		this._labelNode.prependTo(this.get("boundingBox"));
	},
	_syncLabel: function (e) {
		var labelNode = this._labelNode,
			appended = labelNode.parent().size() > 0;
		if (e.newVal) {
			labelNode.html(e.newVal);
			if (!appended) {
				this._insertLabel();
			}
		} else if (appended) {
			labelNode.remove();
		}
	},
	_syncDom2Attr: function(attrName) {
		this.set(attrName, this.get("contentBox").attr(attrName));
	},
	_syncAttr2Dom: function(e) {
		this.get("contentBox").attr(e.attrName, e.newVal);
	},
	
	initializer: function() {
		this._labelNode = $('<label/>');
		
		this.after({
			valueChange: this._syncAttr2Dom,
			labelChange: this._syncLabel,
			disabledChange: this._ffDisabledChange,
			focusedChange: this._ffFocusedChange
		});
	},
	renderUI: function(boundingBox, contentBox) {
		var btnId = this.get('id') + '_input'
		contentBox.attr({
			type: this.get('htmlType'),
			id: btnId,
			value: this.get('value')
		});
		this._labelNode.attr('htmlFor', btnId);
	},
	bindUI: function(boundingBox, contentBox) {
		this._handlers.push(
			contentBox.on('change', $.bind(this._syncDom2Attr, this, 'value'))
		);
	},
	syncUI: function() {
		this._syncLabel({ newVal: this.get('label') });
		this._ffDisabledChange({ newVal: this.get('disabled') });
	}
});
