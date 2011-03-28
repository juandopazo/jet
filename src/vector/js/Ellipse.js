
/**
 * An ellipse
 * @class Vector.Ellipse
 * @extends Vector
 * @constructor
 * @param {Object} config
 */
var Ellipse = Base.create('ellipse', Vector, [], {
	
	ATTRS: {
		/**
		 * @cponfig rx
		 * @description Horizontal radius length
		 */
		rx: {
			getter: UA_SUPPORTS_SVG ? function () {
				return this.get(NODE).getAttribute("rx");
			} : function () {
				return $.pxToFloat(this.get(NODE).style.width) / 2;
			},
			setter: UA_SUPPORTS_SVG ? function (value) {
				this.get(NODE).setAttribute("rx", value);
				return value;
			} : function (value) {
				this.get(NODE).style.width = value * 2;
				return value;
			}
		},
		/**
		 * @attribute ry
		 * @description Vertical radius length
		 */
		ry: {
			getter: UA_SUPPORTS_SVG ? function () {
				return this.get(NODE).getAttribute("ry");
			} : function () {
				return $.pxToFloat(this.get(NODE).style.width) / 2;
			},
			setter: UA_SUPPORTS_SVG ? function (value) {
				this.get(NODE).setAttribute("ry", value);
				return value;
			} : function (value) {
				this.get(NODE).style.height = value * 2;
				return value;
			}
		},
		/**
		 * @attribute cx
		 * @description X coordinate of the ellipse's center
		 */
		cx: {
			getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING.cx ? VML_ATTR_MAPPING.cx : "cx"),
			setter: UA_SUPPORTS_SVG ? function (value) {
				this.get(NODE).setAttribute("cx", value);
				return value;
			} : function (value) {
				this.get(NODE).style.left = (value - $.pxToFloat(this.get("rx"))) + "px";
				return value;
			}
		},
		/**
		 * @attribute cy
		 * @description Y coordinate of the ellipse's center
		 */
		cy: {
			getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING.cy ? VML_ATTR_MAPPING.cy : "cy"),
			setter: UA_SUPPORTS_SVG ? function (value) {
				this.get(NODE).setAttribute("cy", value);
				return value;
			} : function (value) {
				this.get(NODE).style.top = (value - $.pxToFloat(this.get("ry")) / 2) + "px";
				return value;
			}
		}
	}
}, {
	initializer: function (config) {
		this.set(NODE, config.node && config.node == "circle" ? "circle" : UA_SUPPORTS_SVG ? "ellipse" : "oval");
	}
});