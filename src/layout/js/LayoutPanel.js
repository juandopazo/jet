
/**
 * A Layout Panel is a resizable block which size is constrained by the other blocks in the same container
 * @class LayoutPanel
 * @uses LayoutPanelBase
 * @uses WidgetParent
 * @uses WidgetChild
 * @extends Widget
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.LayoutPanel = $.Base.create('layout-panel', $.Widget, [$.LayoutPanelBase, $.WidgetParent, $.WidgetChild], {}, {
	
	CONTENT_TEMPLATE: null
	
});

