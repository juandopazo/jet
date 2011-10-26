/**
 * TreeView module
 * @module treeview
 * @requires base,selector,widget-parentchild
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('treeview', function ($) {

			
var Lang = $.Lang,
	Hash = $.Hash,
	A = $.Array;

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
	CONTENT_BOX = 'contentBox',
	
	controlNodeClass = 'jet-treenode-control',
	collapsedControlClass = controlNodeClass + '-collapsed',
	expandedControlClass = controlNodeClass + '-expanded';

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
$.TreeNode = $.Base.create('treenode', $.Widget, [$.WidgetParent, $.WidgetChild], {
	
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
			valueFn: function() {
				return this.get(LABEL_NODE).attr('innerHTML');
			}
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
		}/*,
		selectable: {
			valueFn: function() {
				return this.size() > 0;
			}
		}*/
		
	},
	
	HTML_PARSER: {
		contentBox: function() {
			if (this.CONTENT_TEMPLATE) {
				var boundingBox = this.get(BOUNDING_BOX),
					id = boundingBox.attr('id');
				if (!id) {
					boundingBox.attr('id', id = $.guid());
				}
				return boundingBox.find(boundingBox.find('#' + id + ' > .' + this.getClassName('content')));
			}
		},
		labelNode: function () {
			return this.get(BOUNDING_BOX).find('.' + this.getClassName(LABEL)).getDOMNode()
		},
		controlNode: function () {
			return this.get(BOUNDING_BOX).find('.' + controlNodeClass).getDOMNode()
		}
	}
	
}, {
	
	LABEL_TEMPLATE: '<span/>',
	CONTROL_TEMPLATE: '<span/>',
	
	_tnToggleSelectable: function(e) {
		if (e.newVal) {
			this.get(LABEL_NODE).addClass(this.getClassName(LABEL, 'selectable'));
		}
	},
	
	_uiTNLabelChange: function (e) {
		var label = this.get(LABEL_NODE);
		if (Lang.isString(e.newVal)) {
			label.html(e.newVal);
		} else {
			label.append(e.newVal);
		}
	},
	
	_uiTNTitleChange: function (e) {
		this.get(CONTROL_NODE).attr(TITLE, e.newVal);
	},
	
	_uiTNClick: function (e) {
		this.set(SELECTED, !this.get(SELECTED));
	},
	
	initializer: function () {
		if (!this.get(LABEL_NODE)) {
			this.set(LABEL_NODE, this.LABEL_TEMPLATE);
		}
		if (!this.get(CONTROL_NODE)) {
			this.set(CONTROL_NODE, this.CONTROL_TEMPLATE);
		}

		this.after('labelChange', this._uiTNLabelChange);
		this.after('titleChange', this._uiTNTitleChange);
		this.after('selectedChange', this._uiTNSelectedChange);
		this.after('selectableChange', this._tnToggleSelectable);
	},
	
	renderUI: function (boundingBox) {
		var contentBox = this.get(CONTENT_BOX);
		var labelNode = this.get(LABEL_NODE).html(this.get(LABEL)).addClass(this.getClassName(LABEL));
		var controlNode = this.get(CONTROL_NODE).addClass(controlNodeClass);
		labelNode.prependTo(boundingBox);
		controlNode.prependTo(boundingBox);
	},
	
	bindUI: function () {
		this._handlers.push(
			this.get(LABEL_NODE).on(CLICK, this._uiTNClick, this),
			this.get(CONTROL_NODE).on(CLICK, this._uiTNClick, this)
		);
	},
	
	syncUI: function () {
		var title = this.get(TITLE);
		var expanded = this.get(SELECTED);
		if (title) {
			this.get(CONTROL_NODE).attr(TITLE, title);
		}
		//this._tnToggleSelectable({ newVal: this.get('selectable') });
		this._uiTNSelectedChange({ newVal: expanded, prevVal: expanded });
	},
	
	_uiTNSelectedChange: function (e) {
		var newVal = e.newVal;
		var boundingBox = this.get(BOUNDING_BOX);
		var eventType = e.prevVal ? COLLAPSE : EXPAND;
		var controlNode = this.get(CONTROL_NODE);
		var contentBox = this.get(CONTENT_BOX);
		var expandedContentClass = this.getClassName(CONTENT, EXPANDED); 
		var collapsedContentClass = this.getClassName(CONTENT, COLLAPSED); 
		if (this.size() > 0 && this.fire(eventType) && this.get('root').fire("node:" + eventType, this)) {
			controlNode.toggleClass(expandedControlClass, newVal).toggleClass(collapsedControlClass, !newVal);
			contentBox.toggleClass(expandedContentClass, newVal).toggleClass(collapsedContentClass, !newVal);
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
$.TreeView = $.Base.create('treeview', $.Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'TreeNode'
		},
		multiple: {
			value: true,
			readOnly: true
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
