
/**
 * An Path vector
 * @class Path
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var Path = Base.create('path', Vector, [], {
	ATTRS: {
		/**
		 * @config y2
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