
/**
 * Draws a rectangle
 * @class Vector.Rectangle
 * @extends Vector
 * @constructor
 * @param {Object} config
 */
var Rectangle = Base.create('rectangle', Vector, [], {}, {
	initializer: function (config) {
		this.set(NODE, config.node && config.node == "roundrect" ? "roundrect" : "rect");
	},
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