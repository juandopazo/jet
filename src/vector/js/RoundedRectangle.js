
/**
 * A rectangle with rounded corners
 * @class RoundedRectangle
 * @extends Rectangle
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var RoundedRectangle = Base.create('roundrect', Rectangle, [], {}, {
	initializer: function () {
		this.set(NODE, UA_SUPPORTS_SVG ? "rect" : "roundrect");
	}
});