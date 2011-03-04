
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
		 * @config panelContainer
		 * @description Node that contains all tab panels
		 * @writeOnce
		 * @type NodeList
		 */
		panelContainer: {
			setter: $
		},
		childType: {
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
			return $(boundingBox.children('div')[0]);
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