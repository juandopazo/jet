
/**
 * An Path vector
 * @class Path
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var Path = function (config) {
	config.node = "path";
	Path.superclass.constructor.apply(this, arguments);
	
	this.addAttrs({
		/**
		 * @config y2
		 * @description Y coordinate of the line's ending point
		 */
		d: {
			getter: getDefaultGetter("d"),
			setter: getDefaultSetter("d")
		}
	});
};
$.extend(Path, Vector);