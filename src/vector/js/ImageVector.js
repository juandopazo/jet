
/**
 * An Image vector
 * @class Image
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var ImageVector = function (config) {
	config.node = "image";
	ImageVector.superclass.constructor.apply(this, arguments);
};
$.extend(ImageVector, Vector);