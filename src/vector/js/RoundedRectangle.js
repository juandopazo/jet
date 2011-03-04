
/**
 * A rectangle with rounded corners
 * @class RoundedRectangle
 * @extends Rectangle
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var RoundedRectangle = function (config) {
	config.node = UA_SUPPORTS_SVG ? "rect" : "roundrect";
	RoundedRectangle.superclass.constructor.apply(this, arguments);
};
$.extend(RoundedRectangle, Rectangle);