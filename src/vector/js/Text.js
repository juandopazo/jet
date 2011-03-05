
/**
 * A Text vector
 * @class Text
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var Text = Base.create('text', Vector, [], {}, {
	initializer: function () {
		this.set(NODE, 'text');
	}
});