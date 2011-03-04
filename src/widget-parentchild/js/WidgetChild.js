
/**
 * An extension that turns a widget into a child widget
 * @class WidgetChild
 * @constructor
 * @extends Widget
 * @param {Object} config Object literal specifying widget configuration properties
 */
function WidgetChild() {}
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
	},
	
	HTML_PARSER: {
		selected: function () {
			return this.get(BOUNDING_BOX).hasClass(this.getClassName(SELECTED));
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