
/**
 * A Text vector
 * @class Text
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var Text = function (config) {
	config.node = "text";
	Text.superclass.constructor.apply(this, arguments);
};
$.extend(Text, Vector);