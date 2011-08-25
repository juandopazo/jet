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

			
var SELECTED = 'selected',
	Lang = $.Lang,
	Base = $.Base,
	Widget = $.Widget,
	
	LI = '<li/>',
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
		 * @attribute label
		 * @description Gets/sets the content of the tab's label
		 */
		label: {
			value: ''
		},
		/**
		 * @attribute content
		 * @description Gets/sets the content of the tab's panel
		 */
		content: {
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
		content: function () {
			var panel = this.get('panelNode');
			if (panel) {
				return panel.html();
			}
		},
		label: function () {
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
		this.get(CONTENT_BOX).attr(HREF, this.get(HREF)).html(this.get('label'));
		var panel = this.get('panelNode').html(this.get('content')).addClass(this.getClassName(PANEL));
		var panelContainer = this.get(PARENT).get(PANEL_CONTAINER);
		if (panel.parent().getDOMNode() != panelContainer.getDOMNode()) {
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
	
	HTML_PARSER: {
		panelContainer: function (boundingBox) {
			return $(boundingBox.children('div').getDOMNode());
		}
	}
}, {
	
	CONTENT_TEMPLATE: '<ul/>',
	CONTAINER_TEMPLATE: DIV,
	
	renderUI: function () {
		this.get(PANEL_CONTAINER).addClass(this.getClassName(PANEL, 'container')).appendTo(this.get(BOUNDING_BOX));
	},
	
	initializer: function () {
		if (!this.get(PANEL_CONTAINER)) {
			this.set(PANEL_CONTAINER, this.CONTAINER_TEMPLATE);
		}
	}
	
});
			
});
