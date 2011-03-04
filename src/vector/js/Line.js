
/**
 * A line vector
 * @class Line
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var Line = function (config) {
	config.node = "line";
	Line.superclass.constructor.apply(this, arguments);
	
	this.addAttrs({
		/**
		 * @config x1
		 * @description X coordinate of the line's starting point
		 */
		x1: {
			getter: getDefaultGetter("x1"),
			setter: getDefaultSetter("x1")
		},
		/**
		 * @config x2
		 * @description X coordinate of the line's ending point
		 */
		x2: {
			getter: getDefaultGetter("x2"),
			setter: getDefaultSetter("x2")
		},
		/**
		 * @config y1
		 * @description Y coordinate of the line's starting point
		 */
		y1: {
			getter: getDefaultGetter("y1"),
			setter: getDefaultSetter("y1")
		},
		/**
		 * @config y2
		 * @description Y coordinate of the line's ending point
		 */
		y2: {
			getter: getDefaultGetter("y2"),
			setter: getDefaultSetter("y2")
		}
	});
};
$.extend(Line, Vector);