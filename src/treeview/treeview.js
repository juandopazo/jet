/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * TreeView module
 * @module treeview
 * @requires jet, node, base
 * @namespace
 */
jet().add('treeview', function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array,
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
	 * - Take the recursion logic out of the Node class
	 * - Add formatter methods and/or different Node subclasses
	 * - Add helper methods to navigate the tree (first, last, next, previous, children)
	 * - Add methods to insert nodes relative to other nodes (add, or append/prepend)
	 */
	 
	/**
	 * A node in a TreeView
	 * @class TreeNode
	 * @extends Widget
	 * @uses WidgetParent, WidgetChild
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.TreeNode = Widget.create('treenode', [$.WidgetParent, $.WidgetChild], {
		/**
		 * @config type
		 * @description Type of the node. Available types are 'text'
		 * @default "text"
		 */
		type: {
			value: "text"
		},
		/**
		 * @config title
		 * @description Title attribute for the node
		 * @type String
		 */
		title: {
			value: ''
		},
		/**
		 * @config label
		 * @description This node's label or title
		 * @type String|HTMLElement
		 */
		label: {
			value: ''
		},
		/**
		 * @config controlNode
		 * @description Node that expands/collapses this TreeNode
		 * @writeOnce
		 */
		controlNode: {
			value: $('<span/>'),
			setter: $,
			writeOnce: true
		},
		/**
		 * @config labelNode
		 * @description Node that holds this TreeNode's title/label
		 * @writeOnce
		 */
		labelNode: {
			value: $('<span/>'),
			setter: $,
			writeOnce: true
		},
		childType: {
			value: 'TreeNode',
			readOnly: true
		}
		
	}, {
		
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
			this.get(LABEL_NODE).attr(TITLE, newVal);
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
			var boundingBox = this.get(BOUNDING_BOX);
			var contentBox = this.get(CONTENT_BOX);
			var labelNode = this.get(LABEL_NODE).html(this.get(LABEL)).addClass(this.getClassName(LABEL));
			var controlNode = this.get(CONTROL_NODE).addClass(this.getClassName(CONTROL));
			var expanded = this.get(EXPANDED);
			labelNode.appendTo(contentBox);
			controlNode.attr(TITLE, this.get(TITLE)).prependTo(boundingBox);
			labelNode.link(controlNode).on(CLICK, this.toggle);
			this._expandedChange(expanded, expanded);
		},
		
		destroy: function () {
			this.get(LABEL_NODE).unbind(CLICK, this.toggle);
			this.get(CONTROL_NODE).unbind(CLICK, this.toggle);
		}
		
	}, {
		
		_expandedChange: function (newVal, oldVal) {
			var boundingBox = this.get(BOUNDING_BOX);
			var eventType = oldVal ? COLLAPSE : EXPAND;
			var controlNode = this.get(CONTROL_NODE);
			var contentBox = this.get(CONTENT_BOX);
			var expandedControlClass = this.getClassName(CONTROL, EXPANDED); 
			var collapsedControlClass = this.getClassName(CONTROL, COLLAPSED); 
			var expandedContentlClass = this.getClassName(CONTENT, EXPANDED); 
			var collapsedContentClass = this.getClassName(CONTENT, COLLAPSED); 
			if (this.get(CHILDREN).length > 0 && this.fire(eventType) && this.get('root').fire("node:" + eventType, this)) {
				if (newVal) {
					controlNode.addClass(expandedControlClass).removeClass(collapsedControlClass);
					contentBox.addClass(expandedContentlClass).removeClass(collapsedContentClass);
				} else {
					controlNode.addClass(collapsedControlClass).removeClass(expandedControlClass);
					contentBox.addClass(collapsedContentClass).removeClass(expandedContentlClass);
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
	$.TreeView = Widget.create('treeview', [$.WidgetParent], {
		classPrefix: {
			value: 'jet'
		},
		childType: {
			value: $.TreeNode,
			readOnly: true
		}
	}, {
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
		CONTENT_TEMPLATE: null
	});
	
});