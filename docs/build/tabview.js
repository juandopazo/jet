/**
 * A TabView
 * @module tabview
 * @requires base,widget-parentchild
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('tabview', function ($) {

			
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
			var panel = this.get('panelNode');
			panel.children().remove();
			if (newVal instanceof $.NodeList) {
				panel.append(newVal);
			} else {
				panel.html(newVal);
			}
		},
		
		selectedChange: function (e, newVal) {
			var selectedClass = this.getClassName(PANEL, SELECTED);
			var panel = this.get('panelNode');
			if (newVal) {
				panel.addClass(selectedClass);
			} else {
				panel.removeClass(selectedClass);
			}
		},
		
		render: function () {
			this.get(CONTENT_BOX).attr(HREF, this.get(HREF)).html(this.get('labelContent'));
			this.on(this.get('triggerEvent'), this._selectHandler);
			var panel = this.get('panelNode').html(this.get('panelContent')).addClass(this.getClassName(PANEL));
			var panelContainer = this.get(PARENT).get(PANEL_CONTAINER);
			if (panel.parent()._nodes[0] != panelContainer._nodes[0]) {
				panel.appendTo(this.get(PARENT).get(PANEL_CONTAINER));					
			}
			if (this.get(SELECTED)) {
				panel.addClass(this.getClassName(PANEL, SELECTED));
			}
		},
		
		destroy: function () {
			this.get('panelNode').remove();
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
	
	initializer: function () {
		if (!this.get('panelNode')) {
			this.set('panelNode', this.PANEL_TEMPLATE);
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
/**
 * A view of tabs
 * @class TabView
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
$.TabView = Base.create('tabview', Widget, [$.WidgetParent], {
	ATTRS: {
		/**
		 * @attribute panelContainer
		 * @description Node that contains all tab panels
		 * @writeOnce
		 * @type NodeList
		 */
		panelContainer: {
			setter: $
		},
		defaultChildType: {
			value: $.Tab
		},
		multiple: {
			value: false,
			readOnly: true
		}
	},
	
	EVENTS: {
		render: function () {
			this.get(PANEL_CONTAINER).addClass(this.getClassName(PANEL, 'container')).appendTo(this.get(BOUNDING_BOX));
		}
	},
	
	HTML_PARSER: {
		panelContainer: function (boundingBox) {
			return $(boundingBox.children('div')._nodes[0]);
		}
	}
}, {
	
	CONTENT_TEMPLATE: '<ul/>',
	CONTAINER_TEMPLATE: DIV,
	
	initializer: function () {
		if (!this.get(PANEL_CONTAINER)) {
			this.set(PANEL_CONTAINER, this.CONTAINER_TEMPLATE);
		}
	}
	
});
			
});