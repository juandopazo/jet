/**
 * A Layout is a container of Layout Panels
 * @class Layout
 * @uses LayoutPanelBase
 * @uses WidgetParent
 * @extends Widget
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Layout = $.Base.create('layout', $.Widget, [$.LayoutPanelBase, $.WidgetParent], {}, {
	
	CONTENT_TEMPLATE: null
	
});
