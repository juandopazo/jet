/**
 * A module declaring extensions for parent/child relationships between nodes
 * @module widget-parentchild
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('widget-parentchild', function ($) {

			
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
function WidgetParent() {}
$.mix(WidgetParent, {
	
	NAME: 'widget-parent',
	
	ATTRS: {
			
		/**
		 * @attribute childType
		 * @description Constructor reference to the default type of the children managed by this Widget. The default value is taken from defaultChildType
		 */
		childType: {
			getter: function (val) {
				if (!val) {
					val = this.get('defaultChildType');
				}
				return Lang.isString(val) ? $[val] : val;
			}
		},
		/**
		 * @attribute defaultChildType
		 * @description default value used when a childType is not provided. This attribute is used mostly by classes using WidgetParent.
		 * @default WidgetChild
		 */
		defaultChildType: {
			value: 'WidgetChild'
		},
		
		/**
		 * @attribute children
		 * @description An array of instances or configuration objects representing the widget's children
		 * @default []
		 */
		children: {
			value: []
		},
		
		/**
		 * @attribute selection
		 * @description Returns the currently selected child Widget. If the mulitple attribte is set to true will return an Y.ArrayList instance containing the currently selected children. If no children are selected, will return null
		 * @default null
		 * @type Widget|Array
		 */
		selection: {
			value: null
		},
		
		/**
		 * @attribute multiple
		 * @description Boolean indicating if multiple children can be selected at once. Whether or not multiple selection is enabled is always delegated to the value of the multiple attribute of the root widget in the object hierarchy
		 * @default false
		 */
		multiple: {
			value: false,
			wriceOnce: true
		},
		
		atLeastOne: {
			value: false
		},
		/**
		 * @attribute selectedIndex
		 * @description The index of the currently selected item
		 * @type Number
		 */
		selectedIndex: {
			validator: function (val) {
				return Lang.isNumber(val) && !!this.item(val);
			},
			setter: function (val) {
				var child = this.item(val);
				if (child && child.select) {
					child.select();
				}
				return val;
			},
			getter: function () {
				var selection = this.get(SELECTION); 
				return selection ? selection.get(INDEX) : -1;
			}
		},
		/**
		 * @attribute childrenContainer
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
			var multiple = this.get(MULTIPLE);
			var selection = multiple ? [] : null;
			this.each(this.add);
			Hash.each(Widget.DOM_EVENTS, function (name) {
				self.on(name, self._domEventChildrenProxy);
			});
			this.each(function (child) {
				if (child.get(SELECTED)) {
					if (multiple) {
						selection.push(child);
					} else {
						selection = child;
					}
				}
			});
			this.set(SELECTION, selection);
			if (!selection) {
				this.set(SELECTED_INDEX, 0);
			}
		},
		
		afterSelectionChange: function (e, newVal) {
			if (newVal && !this.get(MULTIPLE)) {
				this.each(function (child) {
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
			childrenContainer.children().each(function (node) {
				children = children || [];
				children.push({
					srcNode: childrenContainer,
					boundingBox: node
				});
			});
			return children;
		}
	}
	
});
WidgetParent.prototype = {
	
	_onChildSelect: function (e) {
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
			if (e.newVal) {
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
	
	_domEventChildrenProxy: function (e) {
		var targetWidget = Widget.getByNode(e.domEvent.target);
		if (targetWidget && A.indexOf(targetWidget, this.get(CHILDREN)) > -1) {
			targetWidget.fire(e.type, { domEvent: e.domEvent });
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
		var ChildType = this.get('childType');
		var self = this;
		var children = this.get(CHILDREN);
		if (!Lang.isNumber(index)) {
			index = children.length;
		}
		if (child && this.fire('addChild', { child: child, index: index })) {
			if (!(child instanceof ChildType)) {
				child.parent = this;
				child.index = index;
				child = new (ChildType)(child);
			} else {
				child.set(PARENT, this);
			}
			children[index] = child;
			child.render(this.get('childrenContainer'));
			
			child.on('afterSelectedChange', $.bind(this._onChildSelect, this));
			child.on('destroy', function (e) {
				self._unHookChild(e.target);
			});
			
			this.fire('afterAddChild', { child: child, index: index });
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
		if (Lang.isNumber(child)) {
			child = this.item(child);
		}
		if (child && this.fire('removeChild', { child: child })) {
			var children = this.get(CHILDREN);
			if (Lang.isNumber(child)) {
				child = children[child];
			}
			this._unHookChild(child);
			child.destroy();
			this.fire('afterRemoveChild', { child: child });
		}
		return this;
	},
	
	/**
	 * @method each
	 * @description Iterates through all this widget children
	 * @param {Function} fn Callback
	 * @chainable
	 */
	each: function (fn, thisp) {
		A.each(this.get(CHILDREN), fn, thisp || this);
		return this;
	},
	
	/**
	 * @method size
	 * @description Returns the ammount of children of this parent widget
	 * @return Number
	 */
	 size: function () {
	 	return (this.get(CHILDREN) || []).length;
	 }
	
};
/**
 * An extension that turns a widget into a child widget
 * @class WidgetChild
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function WidgetChild() {}
$.mix(WidgetChild, {
	
	NAME: 'widget-child',
	
	ATTRS: {
		/**
		 * @attribute selected
		 * @description Boolean indicating if the Widget is selected
		 * @type Boolean
		 * @default false
		 */
		selected: {
			value: false
		},
		
		/**
		 * @attribute index
		 * @description Number representing the Widget's ordinal position in its parent Widget
		 * @default 0
		 * @type Number
		 */
		index: {
			value: 0
		},
		
		/**
		 * @attribute parent
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
		
		selectedChange: function (e) {
			var parent = this.get(PARENT);
			if (!e.newVal && parent && parent.size() > 1 && parent.get('selection') == this && !parent.get('multiple') && parent.get('atLeastOne')) {
				e.preventDefault();
			}
		},
		
		afterSelectedChange: function (e) {
			this.get(BOUNDING_BOX).toggleClass(this.getClassName(SELECTED), e.newVal);
		}
	},
	
	HTML_PARSER: {
		selected: function (boundingBox) {
			return boundingBox.hasClass(this.getClassName(SELECTED));
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