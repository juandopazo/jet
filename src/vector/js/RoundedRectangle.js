
/**
 * A rectangle with rounded corners
 * @class Vector.RoundedRectangle
 * @extends Rectangle
 * @constructor
 * @param {Object} config
 */
var RoundedRectangle = Base.create('roundrect', Rectangle, [], {}, {
	initializer: function () {
		this.set(NODE, UA_SUPPORTS_SVG ? "rect" : "roundrect");
	}
});