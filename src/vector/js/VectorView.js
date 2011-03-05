
/**
 * A canvas for Vectors
 * @class VectorView
 * @namespace
 * @extends Widget
 * @constructor
 * @param {Object} config
 */
$.VectorView = Base.create('vectorview', $.Widget, [], {
	ATTRS: {
		canvas: {
			value: null
		}
	},
	
	EVENTS: {
		afterWidthChange: function (e, newVal) {
			this.get('canvas').set('width', newVal);
		},
		afterHeightChange: function (e, newVal) {
			this.get('canvas').set('height', newVal);
		}
	}
}, {
	initializer: function () {
		this.set('canvas', UA_SUPPORTS_SVG ? new Vector({
			node: "svg",
			xmlns: NAMESPACE_URI,
			version: "1.1"
		}) : $("<div/>").css({
			position: "relative",
			overflow: "hidden"
		}));
	},
	
	/**
	 * @method rectangle
	 * @description Draw a rectangle in this vector view
	 * @param {Object} config
	 * @return Vector.Rectangle
	 */
	rectangle: function (config) {
		return this._append(new Rectangle(config));
	},
	/**
	 * @method circle
	 * @description Draw a circle in this vector view
	 * @param {Object} config
	 * @return Vector.Circle
	 */
	circle: function (config) {
		return this._append(new Circle(config));
	},
	/**
	 * @method ellipse
	 * @description Draw an ellipse in this vector view
	 * @param {Object} config
	 * @return Vector.Ellipse
	 */
	ellipse: function (config) {
		return this._append(new Ellipse(config));
	},
	/**
	 * @method image
	 * @description Draw an image in this vector view
	 * @param {Object} config
	 * @return Vector.Image
	 */
	image: function (config) {
		return this._append(new ImageVector(config));
	},
	/**
	 * @method text
	 * @description Draw text in this vector view
	 * @param {Object} config
	 * @return Vector.Text
	 */
	text: function (config) {
		return this._append(new Text(config));
	},
	/**
	 * @method line
	 * @description Draw a line in this vector view
	 * @param {Object} config
	 * @return Vector.Line
	 */
	line: function (config) {
		return this._append(new Line(config));
	},
	/**
	 * @method path
	 * @description Draw a path in this vector view
	 * @param {Object} config
	 * @return Vector.Path
	 */
	path: function (config) {
		return this._append(new Path(config));
	},
	/**
	 * @method clear
	 * @description Remove all vectors from this vector view
	 * @chainable
	 */
	clear: function () {
		this.get('canvas').children().remove();
	},

	_append: function (shape) {
		return shape.set(VECTOR, this).appendTo(this.get('canvas'));
	}
});

$.mix(Vector, {
	Circle: Circle,
	Rectangle: Rectangle,
	Image: ImageVector,
	Text: Text,
	Path: Path,
	decToHex: decToHex,
	hexToDec: hexToDec,
	colorHexToArray: colorHexToArray,
	colorArrayToHex: colorArrayToHex
});