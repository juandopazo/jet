/**
 * TreeView module
 * @module treeview
 * @requires base,widget-parentchild
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('treeview', function ($) {

			
var Lang = $.Lang,
	Hash = $.Hash,
	A = $.Array,
	Base = $.Base,
	Widget = $.Widget;

var EXPAND = "expand",
	COLLAPSE = "collapse",
	EXPANDED = EXPAND + "ed",
	SELECTED = 'selected',
	COLLAPSED = COLLAPSE + "d",
	CHILDREN = "children",
	CONTROL = "control",
	CONTENT = 'content',
	LABEL = "label",
	HOVER = "hover",
	DASH = "-",
	CLICK = "click",
	NEW_DIV = "<div/>",
	TITLE = 'title',
	CONTROL_NODE = 'controlNode',
	LABEL_NODE = 'labelNode',
	BOUNDING_BOX = "boundingBox",
	CONTENT_BOX = 'contentBox';

/*
 * @TODO:
 * - Add formatter methods and/or different Node subclasses
 * - Add methods to insert nodes relative to other nodes (add, or append/prepend)
 */
 
/**
 * A node in a TreeView
 * @class TreeNode
 * @extends Widget
 * @uses WidgetParent
 * @uses WidgetChild
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
$.TreeNode = Base.create('treenode', Widget, [$.WidgetParent, $.WidgetChild], {
	
	ATTRS: {
		/**
		 * @attribute type
		 * @description Type of the node. Available types are 'text'
		 * @default "text"
		 */
		type: {
			value: "text"
		},
		/**
		 * @attribute title
		 * @description Title attribute for the node
		 * @type String
		 */
		title: {
			value: ''
		},
		/**
		 * @attribute label
		 * @description This node's label or title
		 * @type String|HTMLElement
		 */
		label: {
			value: ''
		},
		/**
		 * @attribute controlNode
		 * @description Node that expands/collapses this TreeNode
		 * @writeOnce
		 */
		controlNode: {
			setter: $
		},
		/**
		 * @attribute labelNode
		 * @description Node that holds this TreeNode's title/label
		 * @writeOnce
		 */
		labelNode: {
			setter: $
		},
		defaultChildType: {
			value: 'TreeNode'
		}
		
	},
	
	EVENTS: {
		
		labelChange: function (e, newVal) {
			var label = this.get(LABEL_NODE);
			if (Lang.isString(newVal)) {
				label.html(newVal);
			} else {
				label.append(newVal);
			}
		},
		
		titleChange: function (e, newVal) {
			this.get(CONTROL_NODE).attr(TITLE, newVal);
		},
		
		selectedChange: function (e, newVal, oldVal) {
			this._expandedChange.call(this, newVal, oldVal);
		},
		
		click: function (e, domEvent) {
			if (domEvent.target == this.get(LABEL_NODE)) {
				this.set(SELECTED, !this.get(SELECTED));
			}
		},
		
		render: function () {
			this._nodeToggle = $.bind(this.toggle, this);
			var boundingBox = this.get(BOUNDING_BOX);
			var contentBox = this.get(CONTENT_BOX);
			var labelNode = this.get(LABEL_NODE).html(this.get(LABEL)).addClass(this.getClassName(LABEL));
			var controlNode = this.get(CONTROL_NODE).addClass(this.getClassName(CONTROL));
			var expanded = this.get(SELECTED);
			var title = this.get(TITLE);
			labelNode.prependTo(boundingBox);
			controlNode.prependTo(boundingBox);
			if (title) {
				controlNode.attr(TITLE, title);
			}
			if (this.get('children').length > 0) {
				labelNode.addClass(this.getClassName(LABEL, 'selectable'));
			}
			labelNode.link(controlNode).on(CLICK, this._nodeToggle);
			this._expandedChange(expanded, expanded);
		},
		
		destroy: function () {
			this.get(LABEL_NODE).unbind(CLICK, this._nodeToggle);
			this.get(CONTROL_NODE).unbind(CLICK, this._nodeToggle);
		}
		
	},
	
	HTML_PARSER: {
		labelNode: function () {
			
		},
		controlNode: function () {
			
		}
	}
	
}, {
	
	LABEL_TEMPLATE: '<span/>',
	CONTROL_TEMPLATE: '<span/>',
	
	initializer: function () {
		this.set(LABEL_NODE, this.LABEL_TEMPLATE);
		this.set(CONTROL_NODE, this.CONTROL_TEMPLATE);
	},
	
	_expandedChange: function (newVal, oldVal) {
		var boundingBox = this.get(BOUNDING_BOX);
		var eventType = oldVal ? COLLAPSE : EXPAND;
		var controlNode = this.get(CONTROL_NODE);
		var contentBox = this.get(CONTENT_BOX);
		var expandedControlClass = this.getClassName(CONTROL, EXPANDED); 
		var collapsedControlClass = this.getClassName(CONTROL, COLLAPSED); 
		var expandedContentClass = this.getClassName(CONTENT, EXPANDED); 
		var collapsedContentClass = this.getClassName(CONTENT, COLLAPSED); 
		if (this.get(CHILDREN).length > 0 && this.fire(eventType) && this.get('root').fire("node:" + eventType, this)) {
			if (newVal) {
				controlNode.addClass(expandedControlClass).removeClass(collapsedControlClass);
				contentBox.addClass(expandedContentClass).removeClass(collapsedContentClass);
			} else {
				controlNode.addClass(collapsedControlClass).removeClass(expandedControlClass);
				contentBox.addClass(collapsedContentClass).removeClass(expandedContentClass);
			}
		}
	}
	
});
/**
 * A labeled tree
 * @class TreeView
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
$.TreeView = Base.create('treeview', Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'TreeNode'
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
			
});