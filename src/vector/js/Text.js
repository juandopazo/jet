
/**
 * A Text vector
 * @class Vector.Text
 * @extends Vector
 * @constructor
 * @param {Object} config
 */
var Text = Base.create('text', Vector, [], {}, {
	initializer: function () {
		this.set(NODE, 'text');
	}
});