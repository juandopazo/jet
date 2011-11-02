
/**
 * A labeled tree
 * @class TreeView
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
$.TreeView = $.Base.create('treeview', $.Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'TreeNode'
		},
		multiple: {
			value: true
		}
	}
	/**
	 * @event node:expand
	 * @description Fires when a node is expanded. Preventing the default behavior will
	 * stop the node from expanding
	 * @param {Node} The node that initiated the action
	 */
	/**
	 * @event node:collapse
	 * @description Fires when a node is collapsed. Preventing the default behavior will
	 * stop the node from collapsing
	 * @param {Node} The node that initiated the action
	 */
}, {
});