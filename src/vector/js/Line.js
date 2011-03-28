
/**
 * A line vector
 * @class Vector.Line
 * @extends Vector
 * @constructor
 * @param {Object} config
 */
var Line = Base.create('line', Vector, [], {
	ATTRS: {
		/**
		 * @attribute x1
		 * @description X coordinate of the line's starting point
		 */
		x1: {
			getter: getDefaultGetter("x1"),
			setter: getDefaultSetter("x1")
		},
		/**
		 * @attribute x2
		 * @description X coordinate of the line's ending point
		 */
		x2: {
			getter: getDefaultGetter("x2"),
			setter: getDefaultSetter("x2")
		},
		/**
		 * @attribute y1
		 * @description Y coordinate of the line's starting point
		 */
		y1: {
			getter: getDefaultGetter("y1"),
			setter: getDefaultSetter("y1")
		},
		/**
		 * @attribute y2
		 * @description Y coordinate of the line's ending point
		 */
		y2: {
			getter: getDefaultGetter("y2"),
			setter: getDefaultSetter("y2")
		}
	}
}, {
	initializer: function () {
		this.set(NODE, 'line');
	}
});