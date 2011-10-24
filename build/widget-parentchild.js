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
 * @uses ArrayList
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function WidgetParent(config) {
	config = config || {};
	var multiple = this.get(MULTIPLE),
		selection = multiple ? [] : null;
		
	$.ArrayList.call(this);
	
	this.on('render', this._renderChildren);
	this.after('selectionChange', this._onSelectionChange);
	
	this.add(config.children || []);

	this.forEach(function (child) {
		if (child.get(SELECTED)) {
			if (multiple) {
				selection.push(child);
			} else {
				selection = child;
			}
		}
	});
	if (selection) {
		this.set(SELECTION, selection);
	} else {
		this.set(SELECTED_INDEX, 0);
	}
}
$.mix(WidgetParent, {
	
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
			value: 'Widget'
		},
		
		/**
		 * @attribute children
		 * @description An array of instances or configuration objects representing the widget's children
		 * @type Array
		 * @default []
		 */
		children: {
			readOnly: true,
			getter: function () {
				return this._items;
			}
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
	
	HTML_PARSER: {
		children: function () {
			var children;
			//@TODO: check the use of childrenContainer
			var childrenContainer = this.get(CONTENT_BOX);
			childrenContainer.children().forEach(function (node) {
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
	
	_onSelectionChange: function (e) {
		if (this.get(MULTIPLE)) {
			this.forEach(function(child) {
				child.set(SELECTED, $.Array.indexOf(e.newVal, child) > -1, { src: '_onSelectionChange' });
			});
		} else if (e.prevVal) {
			e.prevVal.set(SELECTED, false, { src: '_onSelectionChange' });
		}
	},
	
	_renderChildren: function () {
		var container = this.get('childrenContainer');
		
		this.forEach(function (child) {
			child.render(container);
		});
	},
	
	_onChildSelect: function (e) {
		if (e.src !== '_onSelectionChange') {
			var selection = null;
				
			if (this.get(MULTIPLE)) {
				selection = [];
				this.forEach(function (child) {
					if (child.get(SELECTED)) {
						selection.push(child);
					}
				});
			} else if (e.newVal) {
				selection = e.target;
			}
			this.set(SELECTION, selection);
		}
	},
	
	_unHookChild: function (e) {
		var child = e.target.get(INDEX);
		this.splice(child, 1);
		this.forEach(function (item, i) {
			if (i >= child) {
				item.set(INDEX, i);
			}
		});
	},
	
	_add: function (child, index) {
		var ChildType = child.childType || this.get('childType');
		
		if (child && this.fire('addChild', { child: child, index: index })) {
			
			if (!$.instanceOf(child, $.Widget)) {
				child.parent = this;
				child.index = index;
				child = new (ChildType)(child);
			} else {
				child.set(PARENT, this);
			}
			
			this.splice(index, 0, child);
			if (this.get('rendered')) {
				child.render(this.get('childrenContainer'));
			}
			
			child.after('selectedChange', this._onChildSelect, this);
			child.on('destroy', this._unHookChild, this);
			
			this.fire('afterAddChild', { child: child, index: index });
		}
		return child;
	},
	
	/**
	 * @method addChild
	 * @description Adds a Widget as a child. If the specified Widget already has a parent it will be removed from its current parent before being added as a child
	 * @param child <Widget|Object> The Widget instance, or configuration object for the Widget to be added as a child
	 * @param index <Number> (Optional.) Number representing the position at which the child should be inserted
	 * @return {Widget} child
	 */
	addChild: function(child, index) {
		var result, self = this;
		if (!Lang.isNumber(index)) {
			index = this.size();
		}
		if (Lang.isArray(child)) {
			result = $.Array.map(child, function (c, i) {
				return self._add(c, index + i);
			});
		} else {
			result = this._add(child, index);
		}
		return result;
	},
	
	/**
	 * @method add
	 * @description Same as addChild, but chainable
	 * @param child <Widget|Object> The Widget instance, or configuration object for the Widget to be added as a child
	 * @param index <Number> (Optional.) Number representing the position at which the child should be inserted
	 * @chainable
	 */
	add: function (child, index) {
		this.addChild(child, index);
		return this;
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
			child.destroy();
			this.fire('afterRemoveChild', { child: child });
		}
		return this;
	},
	
	/**
	 * @method first
	 */
	first: function() {
		return this.item(0);
	},
	/**
	 * @method last
	 */
	last: function() {
		return this.item(this.size() - 1);
	},
	/**
	 * @method removeAll
	 * @chainable
	 */
	removeAll: function () {
		while (this.size() > 0) {
			this.remove(0);
		}
		return this;
	}
	
};

$.mix(WidgetParent.prototype, $.ArrayList.prototype);

/**
 * An extension that turns a widget into a child widget
 * @class WidgetChild
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function WidgetChild() {
	this.after('selectedChange', this._childSelectedChange);
}
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
		/**
		 * @attribute root
		 * @description Retrieves the root parent of the Widget
		 * @readOnly
		 */
		root: {
			readOnly: true,
			valueFn: function () {
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
			if (this.get(SELECTED)) {
				boundingBox.addClass(this.getClassName(SELECTED));
			}
		}
	},
	
	HTML_PARSER: {
		selected: function (boundingBox) {
			return boundingBox.hasClass(this.getClassName(SELECTED));
		}
	}
	
});
WidgetChild.prototype = {
	_childSelectedChange: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName(SELECTED), e.newVal);
	},
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
