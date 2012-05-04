
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
			value: 'FormField'
		},
		/**
		 * @attribute action
		 * @description The target URL for the form
		 * @
		 */
		action: {
			value: ''
		}
	},
	ALIASES: {
		checkbox: 'CheckBoxField',
		fieldset: 'FieldSet',
		radio: 'RadioField',
		select: 'SelectField',
		textarea: 'TextareaField',
		text: 'TextField',
		password: 'PasswordField'
	}
}, {
	CONTENT_TEMPLATE: '<form/>',
	
	_relaySubmit: function (e) {
		this.fire('submit', { domEvent: e });
	},
	_registerField: function (e) {
		var field = e.child;
		if (field.get('type') === $.FieldSet) {
			field.each(function (child) {
				this._registerField({ child: child });
			}, this);
		} else {
			this._fields[field.get('name')] = field;
		}
	},
	_setChildType: function (e) {
		if ($.Form.ALIASES[e.child.childType]) {
			e.child.childType = $.Form.ALIASES[e.child.childType];
		}
	},
	
	initializer: function () {
		this.after('actionChange', this.syncUI);
		
		this._fields = {};
		this.on('addChild', this._setChildType);
		this.on('afterAddChild', this._registerField);
	},
	bindUI: function () {
		this._handlers.push(
			this.get('contentBox').on('submit', this._relaySubmit, this)
		);
	},
	syncUI: function () {
		this.get('contentBox').attr('action', this.get('action'));
	},
	
	getField: function (name) {
		return this._fields[name];
	},
	
	toJSON: $.FieldSet.prototype.toJSON
});
