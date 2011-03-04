
/**
 * Draws a rectangle
 * @class Rectangle
 * @extends Vector
 * @namespace Vector
 * @constructor
 * @param {Object} config
 */
var Rectangle = function (config) {
	config.node = config.node && config.node == "roundrect" ? "roundrect" : "rect";
	Rectangle.superclass.constructor.apply(this, arguments);
};
$.extend(Rectangle, Vector, {
	/**
	 * @method rotate
	 * @description Rotates the rectangle
	 * @param {Number} angle Angle between 0 and 360
	 * @chainable
	 */
	rotate: UA_SUPPORTS_SVG ? function (angle) {
		var myself = this;
		myself.node.setAttribute("transform", "rotate(" + angle + " " + (myself.get("x") + myself.get("width") / 2) + " " + (myself.get("y") + myself.get("height") / 2) + ")");
		return myself;
	} : function () {
	
	}
});