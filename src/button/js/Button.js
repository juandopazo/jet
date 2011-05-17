
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

/**
 * A button widget
 * @class Button
 * @extends Widget
 * @uses WidgetChild
 * @param {Object} config Object literal specifying widget configuration properties
 */
var Button = $.Button = Base.create('button', Widget, [WidgetChild], {
	
	ATTRS: {
		/**
		 * @attribute enabled
		 * @description Enabled status of the button
		 * @type Boolean
		 * @default true
		 */
		enabled: {
			value: true,
			validator: Lang.isBoolean
		},
		/**
		 * @attribute labelNode
		 * @description Pointer to the <label> node related to this button
		 * @type NodeList
		 * @readOnly
		 */
		labelNode: {
			value: null,
			setter: $
		},
		/**
		 * @attribute labelContent
		 * @description Text of this button's label
		 * @type String
		 * @default null
		 */
		labelContent: {
			value: null,
			validator: Lang.isString
		},
		/**
		 * @attribute text
		 * @description Text inside the button
		 * @default ''
		 */
		text: {
			value: ''
		}
	},
	
	EVENTS: {
		mouseover: function (e) {
			this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
		},
		mouseout: function (e) {
			this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
		}
	}
	
}, {
	CONTENT_TEMPLATE: '<button/>',
	LABEL_TEMPLATE: '<label/>',
	
	_uiFocusedChange: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName(FOCUS), e.newVal);
		this.get(CONTENT_BOX)[e.newVal ? 'focus' : 'blur']();
	},
	
	_uiTextChange: function (e) {
		this.get(CONTENT_BOX).html(e.val);
	},
	
	_uiLabelChange: function (e) {
		var labelNode = this.get(LABEL_NODE);
		var val = e.newVal;
		if (Lang.isString(val)) {
			labelNode.html(val);
			if (!labelNode.parent().getDOMNode()) {
				this.get(BOUNDING_BOX).prepend(labelNode);
			}
		} else {
			labelNode.remove();
		}
	},
	
	_uiEnabledChange: function (e, val) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName('disabled'), !e.newVal);
		this.get(CONTENT_BOX).getDOMNode().disabled = !e.newVal;
	},
	
	initializer: function () {
		this.set(LABEL_NODE, this.get(LABEL_NODE) || this.LABEL_TEMPLATE);
		this._onDomFocus = $.bind(this.focus, this);
		this._onDomBlur = $.bind(this.blur, this);
	},
	
	renderUI: function (boundingBox) {
		var id = this.getClassName('content', this._uid);
		var labelNode = this.get(LABEL_NODE);
		var label = this.get('labelContent');
		this.get(CONTENT_BOX).attr(ID, id).html(this.get('text'));
		labelNode.getDOMNode().setAttribute('for', id);
		if (Lang.isString(label)) {
			boundingBox.prepend(labelNode.html(label));
		}
	},
	
	bindUI: function () {
		var contentBox = this.get('contentBox');
		
		this.after('enabledChange', this._uiEnabledChange);
		this.after('labelContentChange', this._uiLabelChange);
		this.after('textChange', this._uiTextChange);
		this.after('focusedChange', this._uiFocusedChange);

		this._handlers.push(contentBox.on(FOCUS, this._onDomFocus, this), contentBox.on(BLUR, this._onDomBlur, this));
	},
	
	syncUI: function () {
		this.get('contentBox').getDOMNode().disabled = !this.get(ENABLED);
	},
	
	destructor: function () {
		this.get(CONTENT_BOX).unbind(FOCUS, this._onDomFocus).unbind(BLUR, this._onDomBlur);
		this.get(LABEL_NODE).remove();
	}
	
});