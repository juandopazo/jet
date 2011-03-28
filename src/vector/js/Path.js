
/**
 * An Path vector
 * @class Vector.Path
 * @extends Vector
 * @constructor
 * @param {Object} config
 */
var Path = Base.create('path', Vector, [], {
	ATTRS: {
		/**
		 * @attribute y2
		 * @description Y coordinate of the line's ending point
		 */
		d: {
			getter: getDefaultGetter("d"),
			setter: getDefaultSetter("d")
		}
	}
}, {
	initializer: function () {
		this.set(NODE, 'path');
	}
});