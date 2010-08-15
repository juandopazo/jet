/**
 * TreeView module
 * @module treeview
 * @requires jet, node, base
 */
jet().add('treeview', function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;
	
	var EXPAND = "expand",
		COLLAPSE = "collapse",
		EXPANDED = EXPAND + "ed",
		COLLAPSED = COLLAPSE + "d";
	
	var BOUNDING_BOX = "boundingBox";
		
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
				value: this.get("treeview").get("className") + "-node"
			}
		});
		var treeview = myself.get("treeview");
		var content = $("<div/>");
		var nodeControl = $("<div/>");
		
		var expandedChange = function (e, newVal, oldVal) {
			var boundingBox = myself.get(BOUNDING_BOX);
			var eventType = oldVal ? COLLAPSE : EXPAND;
			var nodeClass = myself.get("classPrefix") + myself.get("className");
			var controlClass = nodeClass + "-control-";
			var contentClass = nodeClass + "-content-";
			var hasChildren = myself.get("children").length > 0;
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
			var nodeClass = myself.get("classPrefix") + myself.get("className");
			var boundingBox = myself.get(BOUNDING_BOX);
			var expandedClass = nodeClass + "-control-" + EXPANDED + "-hover";
			var collapsedClass = nodeClass + "-control-" + COLLAPSED + "-hover";
			var mouseOver = function () {
				if (myself.get("children").length > 0) {
					if (myself.get(EXPANDED)) {
						nodeControl.addClass(expandedClass).removeClass(collapsedClass);
					} else {
						nodeControl.addClass(collapsedClass).removeClass(expandedClass);
					}
				}
			};
			nodeControl.addClass(nodeClass + "-control").appendTo(boundingBox);
			label.addClass(nodeClass + "-label").html(myself.get("label")).appendTo(boundingBox);
			label.link(nodeControl).on("click", function (e) {
				if (!myself.fire("click")) {
					e.preventDefault();
				}
				myself.toggle();
				mouseOver();
			}).on("mouseover", mouseOver).on("mouseout", function () {
				nodeControl.removeClass(expandedClass).removeClass(collapsedClass);
			});
			content.addClass(nodeClass + "-content").appendTo(boundingBox);
			A.each(myself.get("children"), function (child) {
				child.parent = myself;
				child.treeview = treeview;
				var childNode = new Node(child);
				childNode.render(content);
			});
			var expanded = myself.get(EXPANDED);
			expandedChange(expanded, expanded);
		});
	};
	$.extend(Node, $.Widget, {
		expand: function () {
			return this.set(EXPANDED, true);
		},
		collapse: function () {
			return this.set(EXPANDED, false);
		},
		toggle: function () {
			return this.set(EXPANDED, !this.get(EXPANDED));
		}
	});
		
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
				value: "treeview"
			}
		});
		
		/**
		 * @event node:expand
		 * @event node:collapse
		 * @event node:click
		 * @event label:click
		 */
		
		this.on("render", function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			A.each(myself.get("branches"), function (branch) {
				branch.treeview = myself;
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