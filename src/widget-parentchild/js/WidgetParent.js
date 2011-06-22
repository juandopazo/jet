
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
	this.after('selectionChange', this._handleMultipleChildren);
	
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
			value: 'WidgetChild'
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
	
	constructor: WidgetParent,
	
	_handleMultipleChildren: function (e) {
		if (!this.get(MULTIPLE)) {
			this.forEach(function (child) {
				if (child !== e.newVal) {
					child.set(SELECTED, false);
				}
			});
		}
	},
	
	_renderChildren: function () {
		var self = this,
			container = this.get('childrenContainer');
			
		$.Object.each(Widget.DOM_EVENTS, function (name) {
			self.on(name, self._domEventChildrenProxy);
		});
		
		this.forEach(function (child) {
			child.render(container);
		});
		
		if (!this.get('selection')) {
			this.set(SELECTED_INDEX, 0);
		}
	},
	
	_onChildSelect: function (e) {
		var selection = null,
			multiple = this.get(MULTIPLE);
			
		if (multiple) {
			selection = [];
			this.forEach(function (child) {
				if (child.get(SELECTED)) {
					selection.push(child);
				}
			});
		} else if (e.newVal) {
			selection = e.target;
		} else if (!e.prevVal && this.get('atLastOne')) {
			e.preventDefault();
			return;
		}
		this.set(SELECTION, selection);
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
	
	_domEventChildrenProxy: function (e) {
		var targetWidget = Widget.getByNode(e.domEvent.target);
		if (this.indexOf(targetWidget) > -1) {
			targetWidget.fire(e.type, { domEvent: e.domEvent });
		}
	},
	
	_add: function (child, index) {
		var ChildType = this.get('childType');
		
		if (child && this.fire('addChild', { child: child, index: index })) {
			
			if (!(child instanceof ChildType)) {
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
			
			child.on('selectedChange', this._onChildSelect, this);
			child.on('destroy', this._unHookChild, this);
			
			this.fire('afterAddChild', { child: child, index: index });
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
		if (!Lang.isNumber(index)) {
			index = this.size();
		}
		if (Lang.isArray(child)) {
			$.Array.forEach(child, function (c, i) {
				this._add(c, index + i);
			}, this);
		} else {
			this._add(child, index);
		}
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
	
	removeAll: function () {
		while (this.size() > 0) {
			this.remove(0);
		}
		return this;
	}
	
};

$.mix(WidgetParent.prototype, $.ArrayList.prototype);
