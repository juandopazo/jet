
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
		 * @config panel
		 * @description The element or text to use as a panel
		 * @writeOnce
		 */
		panel: {
			setter: $
		},
		/**
		 * @config triggerEvent
		 * @description Event that triggers the selection of this tab
		 * @default 'click'
		 * @type String
		 */
		triggerEvent: {
			value: 'click'
		},
		/**
		 * @config labelContent
		 * @description Gets/sets the content of the tab's label
		 */
		labelContent: {
			value: ''
		},
		/**
		 * @config panelContent
		 * @description Gets/sets the content of the tab's panel
		 */
		panelContent: {
			value: ''
		},
		/**
		 * @config href
		 * @description Href attribute for this tab's label. Useful for progressive enhancement
		 * @default '#'
		 * @writeOnce
		 */
		href: {
			value: '#',
			writeOnce: true
		}
	},
	
	EVENTS: {
		
		triggerEventChange: function (e, oldVal, newVal) {
			this.unbind(oldVal, this._selectHandler).on(newVal, this._selectHandler);
		},
		
		labelContentChange: function (e, newVal) {
			var label = this.get(CONTENT_BOX);
			label.children().remove();
			if (newVal instanceof $.NodeList) {
				label.append(newVal);
			} else {
				label.html(newVal);
			}
		},
		
		panelContentChange: function (e, newVal) {
			var panel = this.get(PANEL);
			panel.children().remove();
			if (newVal instanceof $.NodeList) {
				panel.append(newVal);
			} else {
				panel.html(newVal);
			}
		},
		
		selectedChange: function (e, newVal) {
			var selectedClass = this.getClassName(PANEL, SELECTED);
			var panel = this.get(PANEL);
			if (newVal) {
				panel.addClass(selectedClass);
			} else {
				panel.removeClass(selectedClass);
			}
		},
		
		render: function () {
			this.get(CONTENT_BOX).attr(HREF, this.get(HREF)).html(this.get('labelContent'));
			this.on(this.get('triggerEvent'), this._selectHandler);
			var panel = this.get(PANEL).html(this.get('panelContent')).addClass(this.getClassName(PANEL));
			var panelContainer = this.get(PARENT).get(PANEL_CONTAINER);
			if (panel.parent()[0] != panelContainer[0]) {
				panel.appendTo(this.get(PARENT).get(PANEL_CONTAINER));					
			}
			if (this.get(SELECTED)) {
				panel.addClass(this.getClassName(PANEL, SELECTED));
			}
		},
		
		destroy: function () {
			this.get(PANEL).remove();
		}
		
	},
	
	HTML_PARSER: {
		panel: function () {
			return this.get(PARENT).get('panelContainer').children(this.get('index'));
		},
		panelContent: function () {
			var panel = this.get(PANEL);
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
	
	initializer: function () {
		if (!this.get(PANEL)) {
			this.set(PANEL, this.PANEL_TEMPLATE);
		}
		var parent = this.get(PARENT);
		if (parent) {
			this.set('cssPrefix', parent.get('cssPrefix'));
		}
	},
	
	_selectHandler: function (e, domEvent) {
		domEvent.preventDefault();
		domEvent.stopPropagation();
		this.select();
	}
});