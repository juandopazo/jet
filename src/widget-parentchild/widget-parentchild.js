jet().add('widget-parentchild', function ($) {

	var Lang = $.Lang,
		A = $.Array,
		Hash = $.Hash,
		Base = $.Base;
		
	var SELECTED = 'selected',
		SELECT = 'select',
		BOUNDING_BOX = 'boundingBox',
		CONTENT_BOX = 'contentBox',
		INDEX = 'index',
		CHANGE = 'Change',
		CHILDREN = 'children',
		CLASS_PREFIX = 'classPrefix',
		CLASS_NAME = 'className';
	
	/**
	 * A widget conteins child widgets
	 * @class WidgetParent
	 * @constructor
	 * @extends Widget
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var WidgetParent = function () {};
	WidgetParent.prototype = {
		_onIndexChange: function () {
			
		},
		
		_onSelect: function (e) {
			if (!this.get('multiple')) {
				A.each(this.get(CHILDREN), function (child) {
					if (child != e.target) {
						child.unselect();
					}
				});
			}
		},
		
		_unHook: function (child) {
			child = child.get(INDEX);
			var children = this.get('children');
			children.splice(child, 1);
			A.each(children, function (item, i) {
				if (i >= child) {
					item.set(INDEX, i);
				}
			});
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
					child = new ChildType(child);
				}
				child.render(this.get(CONTENT_BOX));
				
				child.on(INDEX + CHANGE, this._onIndexChange);
				child.on(SELECT, this._onSelect);
				child.on('destroy', function (e) {
					self._unHook.call(self, e.target);
				});
				
				index = Lang.isNumber(index) ? index : children.length;
				children.splice(index, 0, child);
				if (index != childrenLength) {
					A.each(children, function (child, i) {
						if (i > children) {
							child.set(INDEX, i);
						}
					});
				}
				this.fire('afterAddChild', child, index);
			}
			return this;
		},
		
		/**
		 * @method remove
		 * @description Removes a child
		 * @param child <WidgetChild|Number> The child widget or its index
		 * @chainable
		 */
		remove: function (child) {
			if (this.fire('removeChild', child)) {
				var children = this.get(CHILDREN);
				if (Lang.isNumber(child)) {
					child = children[child];
				}
				this._unHook.call(this, child);
				child.destroy();
				this.fire('afterRemoveChild', child);
			}
			return this;
		},
		
		_domEventChildrenProxy: function (e, target) {
			A.each(this.get(CHILDREN), function (child) {
				child.fire(e.type, target);
			});
		}
		
	};
	$.mix(WidgetParent, {
		
		EVENTS: {
			init: function () {
				var self = this;
				A.each(this.get(CHILDREN), this.add);
				Hash.each($.Widget.DOM_EVENTS, function (name) {
					self.on(name, self._domEventChildrenProxy);
				});
			}
		},
		
		ATTRS: {
				
			/**
			 * @config childType
			 * @description Constructor reference to the default type of the children managed by this Widget
			 * @default WidgetChild 
			 */
			childType: {
				value: $.WidgetChild
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
				value: false
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
					return this.get('selection').get('index');
				}
			}
		}
		
	});
	
	/**
	 * An extension that turns a widget into a child widget
	 * @class WidgetChild
	 * @constructor
	 * @extends Widget
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var WidgetChild = function () {};
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
			return this.get('parent').get(CHILDREN)[this.get(INDEX) + 1] || null;
		},
		
		/**
		 * @method previous
		 * @description Returns the Widget's previous sibling
		 * @returns Widget Widget instance
		 */
		previous: function () {
			return this.get('parent').get(CHILDREN)[this.get(INDEX) - 1] || null;
		}
	};
	$.mix(WidgetChild, {
		
		EVENTS: {
			
			render: function () {
				var self = this;
				var boundingBox = this.get(BOUNDING_BOX);
				Hash.each($.Widget.DOM_EVENTS, function (name) {
					boundingBox.unbind(name, self._domEventProxy);
				});
			},
			
			afterSelectedChange: function (e, newVal) {
				var selectedClass = this.get(CLASS_PREFIX) + this.get(CLASS_NAME) + '-' + SELECTED;
				var boundingBox = this.get(BOUNDING_BOX);
				if (newVal) {
					boundingBox.addClass(selectedClass);
					this.fire(SELECT);
				} else {
					boundingBox.removeClass(selectedClass);
				}
			}
		},
		
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
			}
		}
		
	});
	
	$.add({
		WidgetParent: WidgetParent,
		WidgetChild: WidgetChild
	});

});
