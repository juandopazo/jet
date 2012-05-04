
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
	
	this._childrenContainer = this.get('contentBox');
	
	this.on('render', this._renderChildren);
	this.after('selectionChange', this._onSelectionChange);
	
	this.after('initializedChange', function() {
		this._addChildrenFromMarkup();
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
	});
}
$.mix(WidgetParent, {
	
	ATTRS: {
			
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
		}
	}
	
});
WidgetParent.prototype = {
	
	_addChildrenFromMarkup: function () {
		var children = [];
		this._childrenContainer.children().forEach(function (node) {
			children.push({
				boundingBox: node
			});
		});
		this.add(children);
	},
	
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
		var container = this._childrenContainer;
		
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
		var ChildType;
		
		if (child && this.fire('addChild', { child: child, index: index })) {
	 		ChildType = child.childType || this.get('defaultChildType');
			if (Lang.isString(ChildType)) {
				ChildType = $[ChildType];
			}
			
			if (!$.instanceOf(child, $.Widget)) {
				child.parent = this;
				child.index = index;
				child = new (ChildType)(child);
			} else {
				child.set(PARENT, this);
			}
			
			this.splice(index, 0, child);
			if (this.get('rendered')) {
				child.render(this._childrenContainer);
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
