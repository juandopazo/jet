/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * A module declaring extensions for parent/child relationships between nodes
 * @module widget-parentchild
 * @requires jet, node, base
 * @namespace
 */
jet().add('widget-parentchild', function ($) {

	var Lang = $.Lang,
		A = $.Array,
		Hash = $.Hash,
		Base = $.Base,
		Widget = $.Widget;
		
	var SELECTED = 'selected',
		SELECTED_INDEX = 'selectedIndex',
		SELECT = 'select',
		BOUNDING_BOX = 'boundingBox',
		CONTENT_BOX = 'contentBox',
		INDEX = 'index',
		CHANGE = 'Change',
		CHILDREN = 'children',
		CLASS_PREFIX = 'classPrefix',
		CLASS_NAME = 'className',
		MULTIPLE = 'multiple',
		SELECTION = 'selection',
		PARENT = 'parent';
	
	/**
	 * A widget extension that makes the current widget contein child widgets
	 * @class WidgetParent
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var WidgetParent = function () {};
	$.mix(WidgetParent, {
		
		NAME: 'widget-parent',
		
		ATTRS: {
				
			/**
			 * @config childType
			 * @description Constructor reference to the default type of the children managed by this Widget
			 * @default WidgetChild 
			 */
			childType: {
				value: 'WidgetChild',
				getter: function (val) {
					return Lang.isString(val) ? $[val] : val;
				}
			},
			
			/**
			 * @config children
			 * @description An array of instances or configuration objects representing the widget's children
			 * @default []
			 */
			children: {
				value: []
			},
			
			/**
			 * @config selection
			 * @description Returns the currently selected child Widget. If the mulitple attribte is set to true will return an Y.ArrayList instance containing the currently selected children. If no children are selected, will return null
			 * @default null
			 * @type Widget|Array
			 */
			selection: {
				value: null
			},
			
			/**
			 * @config multiple
			 * @description Boolean indicating if multiple children can be selected at once. Whether or not multiple selection is enabled is always delegated to the value of the multiple attribute of the root widget in the object hierarchy
			 * @default false
			 */
			multiple: {
				value: false,
				wriceOnce: true
			},
			/**
			 * @config selectedIndex
			 * @description The index of the currently selected item
			 * @type Number
			 */
			selectedIndex: {
				validator: Lang.isNumber,
				setter: function (val) {
					this.item(val).select();
					return val;
				},
				getter: function () {
					var selection = this.get(SELECTION); 
					return selection ? selection.get(INDEX) : 0;
				}
			},
			/**
			 * @config childrenContainer
			 * @description The node inside which to insert the children
			 * @default the content box
			 */
			childrenContainer: {
				setter: $,
				getter: function (val) {
					return val || this.get(CONTENT_BOX);
				}
			}
		},
		
		EVENTS: {
			render: function () {
				var self = this;
				A.each(this.get(CHILDREN), function (child, index) {
					self.add(child, index);
				});
				Hash.each(Widget.DOM_EVENTS, function (name) {
					self.on(name, self._domEventChildrenProxy);
				});
				this.set(SELECTED_INDEX, this.get(SELECTED_INDEX));
			},
			
			afterSelectionChange: function (e, newVal) {
				if (newVal && !this.get(MULTIPLE)) {
					A.each(this.get(CHILDREN), function (child) {
						if (child != newVal && Lang.isFunction(child.unselect)) {
							child.unselect();
						}
					});
				}
			}
		},
		
		HTML_PARSER: {
			children: function () {
				var children;
				//@TODO: check the use of childrenContainer
				var childrenContainer = this.get(CONTENT_BOX);
				childrenContainer.children().each(function () {
					children = children || [];
					children.push({
						srcNode: childrenContainer,
						boundingBox: this
					});
				});
				return children;
			}
		}
		
	});
	WidgetParent.prototype = {
		
		_onChildSelect: function (e, newVal) {
			var selection = null;
			var multiple = this.get(MULTIPLE);
			if (multiple) {
				selection = [];
				this.each(function (child) {
					if (child.get(SELECTED)) {
						selection.push(child);
					}
				});
			} else {
				if (newVal) {
					selection = e.target;
					this.each(function (child) {
						if (child != e.target && child.get(SELECTED)) {
							child.unselect();
						}
					});
				}
			}
			this.set(SELECTION, selection);
		},
		
		_unHookChild: function (child) {
			child = child.get(INDEX);
			var children = this.get(CHILDREN);
			children.splice(child, 1);
			A.each(children, function (item, i) {
				if (i >= child) {
					item.set(INDEX, i);
				}
			});
		},
		
		_domEventChildrenProxy: function (e, domEvent) {
			var targetWidget = Widget.getByNode(domEvent.target);
			if (targetWidget && A.indexOf(targetWidget, this.get(CHILDREN)) > -1) {
				targetWidget.fire(e.type, domEvent);
			}
		},
		
		/**
		 * @method add
		 * @description Adds a Widget as a child. If the specified Widget already has a parent it will be removed from its current parent before being added as a child
		 * @param child <Widget|Object> The Widget instance, or configuration object for the Widget to be added as a child
		 * @param index <Number> (Optional.) Number representing the position at which the child should be inserted
		 * @chainable
		 */
		add: function (child, index) {
			if (this.fire('addChild', child, index)) {
				var ChildType = this.get('childType');
				var children = this.get(CHILDREN);
				var childrenLength = children.length;
				var self = this;
				if (!(child instanceof ChildType)) {
					child.parent = this;
					child.index = index;
					child = new ChildType(child);
				} else {
					child.set(PARENT, this);
				}
				children[index] = child;
				child.render(this.get('childrenContainer'));
				
				child.on('afterSelectedChange', $.bind(this._onChildSelect, this));
				child.on('destroy', function (e) {
					self._unHookChild(e.target);
				});
				
				children[Lang.isNumber(index) ? index : children.length] = child;
				this.fire('afterAddChild', child, index);
			}
			return this;
		},
		
		/**
		 * @method item
		 * @description Returns a child based on an index
		 * @param index [Number] Index of the child to be returned
		 * @return WidgetChild
		 */
		item: function (index) {
			return this.get(CHILDREN)[index || 0];
		},
		
		/**
		 * @method remove
		 * @description Removes a child
		 * @param {WidgetChild|Number} child The child widget or its index
		 * @chainable
		 */
		remove: function (child) {
			if (this.fire('removeChild', child)) {
				var children = this.get(CHILDREN);
				if (Lang.isNumber(child)) {
					child = children[child];
				}
				this._unHookChild(child);
				child.destroy();
				this.fire('afterRemoveChild', child);
			}
			return this;
		},
		
		/**
		 * @method each
		 * @description Iterates through all this widget children
		 * @param {Function} fn Callback
		 * @chainable
		 */
		each: function (fn) {
			A.each(this.get(CHILDREN), fn);
			return this;
		}
		
	};
	
	/**
	 * An extension that turns a widget into a child widget
	 * @class WidgetChild
	 * @constructor
	 * @extends Widget
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var WidgetChild = function () {};
	$.mix(WidgetChild, {
		
		NAME: 'widget-child',
		
		ATTRS: {
			/**
			 * @config selected
			 * @description Boolean indicating if the Widget is selected
			 * @type Boolean
			 * @default false
			 */
			selected: {
				value: false
			},
			
			/**
			 * @config index
			 * @description Number representing the Widget's ordinal position in its parent Widget
			 * @default 0
			 * @type Number
			 */
			index: {
				value: 0
			},
			
			/**
			 * @config parent
			 * @description Retrieves the parent of the Widget in the object hierarchy
			 * @default null
			 */
			parent: {
				value: null
			},
			root: {
				readOnly: true,
				getter: function () {
					var parent = this.get(PARENT);
					while (parent.get(PARENT)) {
						parent = parent.get(PARENT);
					}
					return parent;
				}
			}
		},
		
		EVENTS: {
			
			render: function () {
				var self = this;
				var boundingBox = this.get(BOUNDING_BOX);
				Hash.each(Widget.DOM_EVENTS, function (name) {
					boundingBox.unbind(name, self._domEventProxy);
				});
				if (this.get(SELECTED)) {
					boundingBox.addClass(this.getClassName(SELECTED));
				}
			},
			
			afterSelectedChange: function (e, newVal) {
				var selectedClass = this.getClassName(SELECTED);
				var boundingBox = this.get(BOUNDING_BOX);
				if (newVal) {
					boundingBox.addClass(selectedClass);
					this.fire(SELECT);
				} else {
					boundingBox.removeClass(selectedClass);
				}
			}
		}
		
	});
	WidgetChild.prototype = {
		/**
		 * @method select
		 * @description Selects this widget
		 * @chainable
		 */
		select: function () {
			return this.set(SELECTED, true);
		},
		
		/**
		 * @method select
		 * @description Unselects this widget
		 * @chainable
		 */
		unselect: function () {
			return this.set(SELECTED, false);
		},
		
		/**
		 * @method toggle
		 * @description Selects/unselects this widget
		 * @chainable
		 */
		toggle: function () {
			return this.set(SELECTED, !this.get(SELECTED));
		},
		
		/**
		 * @method next
		 * @description Returns the Widget's next sibling
		 * @returns Widget Widget instance
		 */
		next: function () {
			return this.get(PARENT).get(CHILDREN)[this.get(INDEX) + 1] || null;
		},
		
		/**
		 * @method previous
		 * @description Returns the Widget's previous sibling
		 * @returns Widget Widget instance
		 */
		previous: function () {
			return this.get(PARENT).get(CHILDREN)[this.get(INDEX) - 1] || null;
		}
	};
	
	$.add({
		WidgetParent: WidgetParent,
		WidgetChild: WidgetChild
	});

});
