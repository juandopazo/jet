
/**
 * A circle vector
 * @class Circle
 * @extends Vector
 * @constructor
 * @namespace Vector
 * @param {Object} config
 */
var Circle = function (config) {
	config.node = UA_SUPPORTS_SVG ? "circle" : "oval";
	Circle.superclass.constructor.apply(this, arguments);
	var myself = this.addAttrs({
		/**
		 * @config r
		 * @description Radius of the circle
		 */
		r: {
			getter: UA_SUPPORTS_SVG ? function () {
				return this.get(NODE).getAttribute("r");
			} : function () {
				return this.get(NODE).style.width;
			},
			setter: UA_SUPPORTS_SVG ? function (value) {
				this.get(NODE).setAttribute("r", value);
				return value;
			} : function (value) {
				var ns = this.get(NODE).style;
				ns.width = value * 2;
				ns.height = value * 2;
				return value;
			}
		}
	}).addAttrs({
		/**
		 * @config cx
		 * @description X coordinate of the circle's center
		 */
		cx: {
			getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING.cx ? VML_ATTR_MAPPING.cx : "cx"),
			setter: UA_SUPPORTS_SVG ? function (value) {
				this.get(NODE).setAttribute("cx", value);
				return value;
			} : function (value) {
				this.get(NODE).style.left = (value - $.pxToFloat(myself.get("r")) / 2) + "px";
				return value;
			}
		},
		/**
		 * @config cy
		 * @description Y coordinate of the circle's center
		 */
		cy: {
			getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING.cy ? VML_ATTR_MAPPING.cy : "cy"),
			setter: UA_SUPPORTS_SVG ? function (value) {
				this.get(NODE).setAttribute("cy", value);
				return value;
			} : function (value) {
				this.get(NODE).style.top = (value - $.pxToFloat(myself.get("r")) / 2) + "px";
				return value;
			}
		}
	});
};
$.extend(Circle, Vector);