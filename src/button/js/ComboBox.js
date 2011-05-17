
/**
 * An option of a <select> element
 * @class ComboOption
 * @extends Widget
 * @uses WidgetChild
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ComboOption = Base.create('combo-option', Widget, [WidgetChild], {
	ATTRS: {
		/**
		 * @attribute value
		 * @description Sets/returns the value of the option
		 */
		value: {
			getter: function (val) {
				return val || this.get('text');
			}
		},
		/**
		 * @attribute text
		 * @description Sets/returns the text of the option
		 */
		text: {
			value: ''
		}
	}
}, {
	BOUNDING_TEMPLATE: '<li/>',
	CONTENT_TEMPLATE: '<span/>',
	
	_uiTextChange: function (e) {
		this.get('contentBox').html(e.newVal);
	},
	
	_uiOptHover: function (e) {
		this.get('boundingBox').addClass(this.getClassName('hover'));
	},
	_uiOptOut: function (e) {
		this.get('boundingBox').removeClass(this.getClassName('hover'));
	},
	
	bindUI: function (boundingBox, contentBox) {
		this.after('textChange', this._uiTextChange);
		boundingBox.on('click', this.select, this);
		
		this.on('mouseover', this._uiOptHover);
		this.on('mouseout', this._uiOptOut);
	},
	
	syncUI: function (bb, contentBox) {
		contentBox.html(this.get('text'));
	}
});

/**
 * A ComboBox is a select html element
 * @class ComboBox
 * @extends Button
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ComboBox = Base.create('combobox', Widget, [WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'ComboOption'
		},
		multiple: {
			value: false,
			readOnly: true
		},
		atLeastOne: {
			value: true,
			readOnly: true
		},
		displayNode: {
			value: '<span/>',
			setter: $
		},
		inputNode: {
			value: '<input/>',
			setter: $
		},
		arrowContainer: {
			value: '<span/>',
			setter: $
		},
		arrow: {
			value: '<b/>',
			setter: $
		}
	}
}, {
	BOUNDING_TEMPLATE: '<span/>',
	CONTENT_TEMPLATE: '<ul/>',
	
	_uiComboSelectionChange: function (e) {
		if (e.newVal) {
			this.get('displayNode').html(e.newVal.get('text'));
			this.get('inputNode').attr('value', e.newVal.get('value'));
			setTimeout($.bind(this._setMinWidth, this), 0);
		}
	},
	
	_setMinWidth: function () {
		var contentBox = this.get('contentBox');
		var boundingWidth = this.get('boundingBox').width();
		if (contentBox.width() < boundingWidth) {
			contentBox.width(boundingWidth);
		}
	},
	
	_toggleContent: function (e) {
		var contentBox = this.get('contentBox').getDOMNode();
		if ($(e.domEvent.target).ancestor(function (node) {
			return node == contentBox;
		}).size() === 0) {
			this.get('boundingBox').toggleClass(this.getClassName('expanded'));
		}
	},
	
	_uiComboHide: function (e) {
		var boundingBox = this.get('boundingBox');
		var ancestor = $(e.target).ancestor(function (node) {
			return node == boundingBox.getDOMNode();
		});
		if (ancestor.size() === 0) {
			boundingBox.removeClass(this.getClassName('expanded'));
		}
	},
	
	_uiContentHide: function () {
		this.get('boundingBox').removeClass(this.getClassName('expanded'));
	},
	
	initializer: function () {
		this.set('displayNode', this.get('displayNode'));
		this.set('inputNode', this.get('inputNode'));
		this.set('arrowContainer', this.get('arrowContainer'));
		this.set('arrow', this.get('arrow'));
		
		this.after('addChild', this._setMinWidth);
		this.on('afterRender', this._setMinWidth);
	},
	
	renderUI: function (boundingBox, contentBox) {
		this.get('displayNode').addClass(this.getClassName('display')).prependTo(boundingBox);
		var arrowContainer = this.get('arrowContainer').addClass(this.getClassName('arrow', 'container')).prependTo(boundingBox);
		this.get('arrow').addClass(this.getClassName('arrow')).appendTo(arrowContainer);
		this.get('inputNode').attr({
			type: 'hidden',
			id: this.getClassName('input', this._uid)
		}).appendTo(boundingBox);
		contentBox.addClass(this.getClassName('collapsed')).on('click', this._uiContentHide, this);
	},
	
	bindUI: function () {
		this.after('selectionChange', this._uiComboSelectionChange);
		this.on('click', this._toggleContent);
		
		this._handlers.push($($.config.doc).on('click', this._uiComboHide, this));
	},
	
	syncUI: function (boundingBox, contentBox) {
		this.get('displayNode').html(this.get('selection').get('text'));
		this.get('inputNode').attr('value', this.get('selection').get('value'));
		this._setMinWidth();
	}
});