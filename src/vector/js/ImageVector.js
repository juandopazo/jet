
/**
 * An Image vector
 * @class Image
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var ImageVector = Base.create('image', Vector, [], {}, {
	initializer: function () {
		this.set(NODE, 'image');
	}
});