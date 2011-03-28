
/**
 * An Image vector
 * @class Vector.Image
 * @extends Vector
 * @constructor
 * @param {Object} config
 */
var ImageVector = Base.create('image', Vector, [], {}, {
	initializer: function () {
		this.set(NODE, 'image');
	}
});