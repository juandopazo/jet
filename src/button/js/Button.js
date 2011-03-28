
var A = $.Array,
	Hash = $.Hash,
	Lang = $.Lang,
	Base = $.Base,
	Widget = $.Widget,
	WidgetParent = $.WidgetParent,
	WidgetChild = $.WidgetChild;

var BOUNDING_BOX = "boundingBox",
	CONTENT_BOX = 'contentBox',
	LABEL_NODE = 'labelNode',
	ENABLED = 'enabled',
	HOVER = 'hover',
	FOCUS = 'focus',
	BLUR = 'blur',
	ID = 'id',
	PARENT = 'parent',
	NAME = 'name',
	PILL = 'pill';

if (!jet.Button) {
	jet.Button = {};
}

if (!jet.Button.buttons) {
	jet.Button.buttons = 1;
}

/**
 * A button widget
 * @class Button
 * @extends Widget
 * @uses WidgetChild
 * @param {Object} config Object literal specifying widget configuration properties
 */
var Button = Base.create('button', Widget, [WidgetChild], {
	
	ATTRS: {
		/**
		 * @config enabled
		 * @description Enabled status of the button
		 * @type Boolean
		 * @default true
		 */
		enabled: {
			value: true,
			validator: Lang.isBoolean
		},
		/**
		 * @config labelNode
		 * @description Pointer to the <label> node related to this button
		 * @type NodeList
		 * @readOnly
		 */
		labelNode: {
			value: null,
			setter: $
		},
		/**
		 * @config labelContent
		 * @description Text of this button's label
		 * @type String
		 * @default null
		 */
		labelContent: {
			value: null,
			validator: Lang.isString
		},
		/**
		 * @config text
		 * @description Text inside the button
		 * @default ''
		 */
		text: {
			value: ''
		}
	},
	
	EVENTS: {
		enabledChange: function (e, val) {
			var boundingBox = this.get(BOUNDING_BOX);
			var disabledClass = this.getClassName('disabled');
			if (!val) {
				boundingBox.addClass(disabledClass);
			} else {
				disabledClass.removeClass(disabledClass);
			}
			this.get(CONTENT_BOX)._nodes[0].disabled = !val;
		},
		
		labelContentChange: function (e, val) {
			var labelNode = this.get(LABEL_NODE);
			if (Lang.isString(val)) {
				labelNode.html(val);
				if (!labelNode.parent()._nodes[0]) {
					this.get(BOUNDING_BOX).prepend(labelNode);
				}
			} else {
				labelNode.remove();
			}
		},
		
		textChange: function (e, val) {
			this.get(CONTENT_BOX).html(val);
		},
		
		afterFocus: function (e) {
			this.get(BOUNDING_BOX).addClass(this.getClassName(FOCUS));
			this.get(CONTENT_BOX).focus();
		},
		
		afterBlur: function (e) {
			this.get(BOUNDING_BOX).removeClass(this.getClassName(FOCUS));
			this.get(CONTENT_BOX).blur();
		},
		
		mouseover: function (e, domEvent) {
			this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
		},
		
		mouseout: function (e, domEvent) {
			this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
		},
		
		render: function () {
			var id = this.getClassName('content', this._uid);
			var contentBox = this.get(CONTENT_BOX).attr(ID, id).html(this.get('text'));
			var labelNode = this.get(LABEL_NODE);
			var label = this.get('labelContent');
			labelNode._nodes[0].setAttribute('for', id);
			if (Lang.isString(label)) {
				this.get(BOUNDING_BOX).prepend(labelNode.html(label));
			}
			contentBox._nodes[0].disabled = !this.get(ENABLED);
			this._handlers.push(contentBox.on(FOCUS, this._onDomFocus, this));
			this._handlers.push(contentBox.on(BLUR, this._onDomBlur, this));
		},
		
		destroy: function () {
			this.get(CONTENT_BOX).unbind(FOCUS, this._onDomFocus).unbind(BLUR, this._onDomBlur);
			this.get(LABEL_NODE).remove();
		}
	}
	
}, {
	CONTENT_TEMPLATE: '<button/>',
	LABEL_TEMPLATE: '<label/>',
	/**
	 * Disables the button
	 * @method disable
	 * @chainable
	 */
	disable: function () {
		return this.set(ENABLED, false);
	},
	/**
	 * Enables the button
	 * @method enable
	 * @chainable
	 */
	enable: function () {
		return this.set(ENABLED, true);
	},
	
	initializer: function () {
		this.set(LABEL_NODE, this.get(LABEL_NODE) || this.LABEL_TEMPLATE);
		this._onDomFocus = $.bind(this.focus, this);
		this._onDomBlur = $.bind(this.blur, this);
	}
	
});
$.Button = Button;