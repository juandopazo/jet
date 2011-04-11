
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
	
	_uiTriggerEventChange: function (e, oldVal, newVal) {
		this.unbind(oldVal, this._selectHandler).on(newVal, this._selectHandler);
	},
	
	_uiTabLabelContentChange: function (e, newVal) {
		var label = this.get(CONTENT_BOX);
		label.children().remove();
		if (newVal instanceof $.NodeList) {
			label.append(newVal);
		} else {
			label.html(newVal);
		}
	},
	
	_uiTabPanelContentChange: function (e, newVal) {
		var panel = this.get('panelNode');
		panel.children().remove();
		if (newVal instanceof $.NodeList) {
			panel.append(newVal);
		} else {
			panel.html(newVal);
		}
	},
	
	_uiTabSelectedChange: function (e, newVal) {
		var selectedClass = this.getClassName(PANEL, SELECTED);
		var panel = this.get('panelNode');
		if (newVal) {
			panel.addClass(selectedClass);
		} else {
			panel.removeClass(selectedClass);
		}
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
	
	_selectHandler: function (e, domEvent) {
		domEvent.preventDefault();
		domEvent.stopPropagation();
		this.select();
	}
});