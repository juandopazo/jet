
var SELECTED = 'selected';
var Lang = $.Lang;
var ArrayHelper = $.Array,
	Base = $.Base,
	Widget = $.Widget;

var LI = '<li/>',
	DIV = '<div/>',
	BOUNDING_BOX = 'boundingBox',
	CONTENT_BOX = 'contentBox',
	PANEL = 'panel',
	HREF = 'href',
	PANEL_CONTAINER = 'panelContainer',
	PARENT = 'parent';

/**
 * A tab instance has a label and a panel
 * @class Tab
 * @extends Widget
 * @uses WidgetChild
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
$.Tab = Base.create('tab', Widget, [$.WidgetChild], {
	
	ATTRS: {
		/**
		 * @attribute panelNode
		 * @description The element to use as a panel
		 * @writeOnce
		 */
		panelNode: {
			setter: $
		},
		/**
		 * @attribute triggerEvent
		 * @description Event that triggers the selection of this tab
		 * @default 'click'
		 * @type String
		 */
		triggerEvent: {
			value: 'click'
		},
		/**
		 * @attribute labelContent
		 * @description Gets/sets the content of the tab's label
		 */
		labelContent: {
			value: ''
		},
		/**
		 * @attribute panelContent
		 * @description Gets/sets the content of the tab's panel
		 */
		panelContent: {
			value: ''
		},
		/**
		 * @attribute href
		 * @description Href attribute for this tab's label. Useful for progressive enhancement
		 * @default '#'
		 * @writeOnce
		 */
		href: {
			value: '#',
			writeOnce: true
		}
	},
	
	HTML_PARSER: {
		panel: function () {
			return this.get(PARENT).get('panelContainer').children(this.get('index'));
		},
		panelContent: function () {
			var panel = this.get('panelNode');
			if (panel) {
				return panel.html();
			}
		},
		labelContent: function () {
			var label = this.get(CONTENT_BOX);
			if (label) {
				return label.html();
			}
		}
	}
	
}, {
	BOUNDING_TEMPLATE: LI,
	CONTENT_TEMPLATE: '<a/>',
	PANEL_TEMPLATE: DIV,
	
	_uiTriggerEventChange: function (e) {
		this.unbind(e.prevVal, this._selectHandler).on(e.newVal, this._selectHandler);
	},
	
	_uiTabLabelContentChange: function (e) {
		var label = this.get(CONTENT_BOX);
		label.children().remove();
		if (e.newVal instanceof $.NodeList) {
			label.append(e.newVal);
		} else {
			label.html(e.newVal);
		}
	},
	
	_uiTabPanelContentChange: function (e) {
		var panel = this.get('panelNode');
		panel.children().remove();
		if (e.newVal instanceof $.NodeList) {
			panel.append(e.newVal);
		} else {
			panel.html(e.newVal);
		}
	},
	
	_uiTabSelectedChange: function (e) {
		this.get('panelNode').toggleClass(this.getClassName(PANEL, SELECTED), e.newVal);
	},
	
	initializer: function () {
		if (!this.get('panelNode')) {
			this.set('panelNode', this.PANEL_TEMPLATE);
		}
		var parent = this.get(PARENT);
		if (parent) {
			this.set('cssPrefix', parent.get('cssPrefix'));
		}
	},
	
	renderUI: function () {
		this.get(CONTENT_BOX).attr(HREF, this.get(HREF)).html(this.get('labelContent'));
		var panel = this.get('panelNode').html(this.get('panelContent')).addClass(this.getClassName(PANEL));
		var panelContainer = this.get(PARENT).get(PANEL_CONTAINER);
		if (panel.parent()._nodes[0] != panelContainer._nodes[0]) {
			panel.appendTo(panelContainer);					
		}
	},
	
	bindUI: function () {
		this.on(this.get('triggerEvent'), this._selectHandler);
		this.after('triggerEventChange', this._uiTriggerEventChange);
		this.after('labelContentChange', this._uiTabLabelContentChange);
		this.after('panelContentChange', this._uiTabPanelContentChange);
		this.after('selectedChange', this._uiTabSelectedChange);
	},
	
	syncUI: function () {
		this.get('panelNode').toggleClass(this.getClassName(PANEL, SELECTED), this.get(SELECTED));
	},
	
	destructor: function () {
		this.get('panelNode').remove();
	},
	
	_selectHandler: function (e) {
		e.domEvent.preventDefault();
		e.domEvent.stopPropagation();
		this.select();
	}
});