
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
		/**
		 * @config childType 
		 */
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