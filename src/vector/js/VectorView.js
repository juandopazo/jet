
/**
 * A canvas for Vectors
 * @class VectorView
 * @namespace
 * @extends Widget
 * @constructor
 * @param {Object} config
 */
var VectorView = UA_SUPPORTS_SVG ? function () {
	VectorView.superclass.constructor.apply(this, arguments);
	var box = new Vector({
		node: "svg",
		xmlns: NAMESPACE_URI,
		version: "1.1"
	});
	var myself = this.addAttrs({
		/**
		 * @config width
		 * @description Width of the VectorView (a vector "canvas")
		 */
		width: {
			setter: function (value) {
				box.set("width", value);
				return value;
			}
		},
		/**
		 * @config height
		 * @description Height of the VectorView (a vector "canvas")
		 */
		height: {
			setter: function (value) {
				box.set("height", value);
				return value;
			}
		},
		boundingBox: {
			readOnly: true,
			getter: function () {
				return box;
			}
		},
		className: {
			value: "vectorview"
		}
	});
	
} : function () {
	VectorView.superclass.constructor.apply(this, arguments);
	
	var box = $("<div/>").css({
		position: "relative",
		overflow: "hidden"
	});

	var myself = this.addAttrs({
		width: {
			setter: function (value) {
				box.css("width", value);
				return value;
			}
		},
		height: {
			setter: function (value) {
				box.css("height", value);
				return value;
			}
		},
		boundingBox: {
			readOnly: true,
			getter: function () {
				return box;
			}
		},
		className: {
			value: "vectorview"
		}
	});
	
};
var appendToVectorView = function (shape, vectorview) {
	return shape.set(VECTOR, vectorview).appendTo(vectorview.get(BOUNDING_BOX));
};
$.extend(VectorView, $.Widget, {
	/**
	 * @method rectangle
	 * @description Draw a rectangle in this vector view
	 * @param {Object} config
	 * @return Vector.Rectangle
	 */
	rectangle: function (config) {
		return appendToVectorView(new Rectangle(config), this);
	},
	/**
	 * @method circle
	 * @description Draw a circle in this vector view
	 * @param {Object} config
	 * @return Vector.Circle
	 */
	circle: function (config) {
		return appendToVectorView(new Circle(config), this);
	},
	/**
	 * @method ellipse
	 * @description Draw an ellipse in this vector view
	 * @param {Object} config
	 * @return Vector.Ellipse
	 */
	ellipse: function (config) {
		return appendToVectorView(new Ellipse(config), this);
	},
	/**
	 * @method image
	 * @description Draw an image in this vector view
	 * @param {Object} config
	 * @return Vector.Image
	 */
	image: function (config) {
		return appendToVectorView(new ImageVector(config), this);
	},
	/**
	 * @method text
	 * @description Draw text in this vector view
	 * @param {Object} config
	 * @return Vector.Text
	 */
	text: function (config) {
		return appendToVectorView(new Text(config), this);
	},
	/**
	 * @method line
	 * @description Draw a line in this vector view
	 * @param {Object} config
	 * @return Vector.Line
	 */
	line: function (config) {
		return appendToVectorView(new Line(config), this);
	},
	/**
	 * @method path
	 * @description Draw a path in this vector view
	 * @param {Object} config
	 * @return Vector.Path
	 */
	path: function (config) {
		return appendToVectorView(new Path(config), this);
	},
	/**
	 * @method clear
	 * @description Remove all vectors from this vector view
	 * @chainable
	 */
	clear: function () {
		this.get(BOUNDING_BOX).children().remove();
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

$.add({
	VectorView: VectorView,
	Vector: Vector
});