
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
		 * @config childType
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
		 * @config defaultChildType
		 * @description default value used when a childType is not provided. This attribute is used mostly by classes using WidgetParent.
		 * @default WidgetChild
		 */
		defaultChildType: {
			value: 'WidgetChild'
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
	each: function (fn, thisp) {
		A.each(this.get(CHILDREN), fn, thisp || this);
		return this;
	}
	
};