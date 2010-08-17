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
		A = $.Array;
	
	var EXPAND = "expand",
		COLLAPSE = "collapse",
		EXPANDED = EXPAND + "ed",
		COLLAPSED = COLLAPSE + "d",
		CHILDREN = "children",
		TREEVIEW = "treeview",
		CONTROL = "control",
		LABEL = "label",
		HOVER = "hover",
		DASH = "-",
		CLICK = "click",
		NEW_DIV = "<div/>";
	
	var BOUNDING_BOX = "boundingBox";
	
	/*
	 * @TODO:
	 * - Take the recursion logic out of the Node class
	 * - Add formatter methods and/or different Node subclasses
	 * - Add helper methods to navigate the tree (first, last, next, previous, children)
	 * - Add methods to insert nodes relative to other nodes (add, or append/prepend)
	 */
		
	/**
	 * A node in a TreeView
	 * @class Node
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var Node = function () {
		Node.superclass.constructor.apply(this, arguments);
		
		var label = $("<span/>");
		var myself = this.addAttrs({
			/**
			 * @config children
			 * @description This node's children
			 * @type Array
			 */
			children: {
				value: []
			},
			/**
			 * @config parent
			 * @description A pointer to this node's parent
			 * @type Node
			 */
			parent: {},
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
			/**
			 * @config editable
			 * @description Makes the node editable
			 * @type Boolean
			 * @default false
			 */
			/**
			 * @config label
			 * @description 
			 */
			label: {
				required: true,
				setter: function (value) {
					label.html(value);
					return value;
				}
			},
			/**
			 * @config expanded
			 * @description The expanded status of this node
			 * @type Boolean
			 * @default false
			 */
			expanded: {
				value: true
			},
			/**
			 * @config treeview
			 * @description A reference to this node's owner treeview
			 * @type TreeView
			 * @required
			 * @writeOnce
			 */
			treeview: {
				writeOnce: true,
				required: true
			},
			className: {
				value: this.get(TREEVIEW).get("className") + "-node"
			}
		});
		var treeview = myself.get(TREEVIEW);
		var content = $(NEW_DIV);
		var nodeControl = $(NEW_DIV);
		
		var expandedChange = function (e, newVal, oldVal) {
			var boundingBox = myself.get(BOUNDING_BOX);
			var eventType = oldVal ? COLLAPSE : EXPAND;
			var nodeClass = myself.get("classPrefix") + myself.get("className");
			var controlClass = nodeClass + DASH + CONTROL + DASH;
			var contentClass = nodeClass + "-content-";
			var hasChildren = myself.get(CHILDREN).length > 0;
			if (hasChildren) {
				if (myself.fire(eventType) && treeview.fire("node:" + eventType, myself)) {
					if (newVal) {
						nodeControl.addClass(controlClass + EXPANDED).removeClass(controlClass + COLLAPSED);
						content.addClass(contentClass + EXPANDED).removeClass(contentClass + COLLAPSED);
					} else {
						nodeControl.addClass(controlClass + COLLAPSED).removeClass(controlClass + EXPANDED);
						content.addClass(contentClass + COLLAPSED).removeClass(contentClass + EXPANDED);
					}
				}
			}
		};
		
		this.on(EXPANDED + "Change", expandedChange).on("render", function () {
			var prefix = myself.get("classPrefix");
			var className = myself.get("className");
			var nodeClass = prefix + className;
			var boundingBox = myself.get(BOUNDING_BOX);
			var expandedClass = [nodeClass, CONTROL, EXPANDED, HOVER].join(DASH);
			var collapsedClass = [nodeClass, CONTROL, COLLAPSED, HOVER].join(DASH);
			var mouseOver = function () {
				if (myself.get(CHILDREN).length > 0) {
					if (myself.get(EXPANDED)) {
						nodeControl.addClass(expandedClass).removeClass(collapsedClass);
					} else {
						nodeControl.addClass(collapsedClass).removeClass(expandedClass);
					}
				}
			};
			nodeControl.addClass(nodeClass + DASH + CONTROL).appendTo(boundingBox);
			label.addClass(nodeClass + DASH + LABEL).html(myself.get(LABEL)).appendTo(boundingBox);
			label.link(nodeControl).on(CLICK, function (e) {
				/**
				 * @event click
				 * @description Fires when a label or node control is clicked
				 */
				if (!myself.fire(CLICK)) {
					e.preventDefault();
				}
				myself.toggle();
				mouseOver();
			}).on("mouseover", mouseOver).on("mouseout", function () {
				nodeControl.removeClass(expandedClass).removeClass(collapsedClass);
			});
			content.addClass(nodeClass + "-content").appendTo(boundingBox);
			A.each(myself.get(CHILDREN), function (child) {
				$.mix(child, {
					parent: myself,
					treeview: treeview,
					classPrefix: prefix,
					className: className
				});
				var childNode = new Node(child);
				childNode.render(content);
			});
			var expanded = myself.get(EXPANDED);
			expandedChange(expanded, expanded);
		});
	};
	$.extend(Node, $.Widget, {
		/**
		 * @method expand
		 * @description Expand this node
		 * @chainable
		 */
		expand: function () {
			return this.set(EXPANDED, true);
		},
		/**
		 * @method collapse
		 * @description Collapse this node
		 * @chainable
		 */
		collapse: function () {
			return this.set(EXPANDED, false);
		},
		/**
		 * @method toggle
		 * @description Toggle this node
		 * @chainable
		 */
		toggle: function () {
			return this.set(EXPANDED, !this.get(EXPANDED));
		}
	});
		
	/**
	 * A labeled tree
	 * @class TreeView
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var TreeView = function () {
		TreeView.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			/**
			 * @config branches
			 * @description An array containing the data to populate the tree
			 * @type Array
			 * @required
			 */
			branches: {
				required: true
			},
			className: {
				value: TREEVIEW
			},
			classPrefix: {
				value: "jet-"
			}
		});
		
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
		
		this.on("render", function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			A.each(myself.get("branches"), function (branch) {
				$.mix(branch, {
					treeview: myself,
					classPrefix: myself.get("classPrefix")
				});
				var branchNode = new Node(branch);
				branchNode.render(boundingBox);
			});
		});
	};
	$.extend(TreeView, $.Widget);
	
	$.add({
		TreeView: TreeView
	});
});