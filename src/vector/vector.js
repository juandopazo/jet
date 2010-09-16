/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Provides cross-browser vector graphics implementation based on SVG and VML
 * @module vector
 * @requires jet, lang, node, base, anim
 */
jet().add('vector', function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array,
		SLICE = Array.prototype.slice;
		
	var BOUNDING_BOX = "boundingBox",
		NODE = "node",
		VECTOR = "vector";
	var NAMESPACE_URI = "http://www.w3.org/2000/svg";
	
	var UA_SUPPORTS_SVG = !$.UA.ie || $.UA.ie > 8;
	
	var NodeList = $.NodeList,
		NP = NodeList.prototype;
		
	/**
	 * Basic Vector class
	 * A graphic represents a figure, an SVG element or its VML counterpart 
	 * @class Vector
	 * @extends Attribute
	 * @constructor
	 * @param {Object} configuration key/value pairs, as in the Attribute class
	 */
	//Parsing functions
	/**
	 * Short for paseInt(str, 10). Doesn't fail if it isn't a number
	 * @method parseDec
	 * @param {String} str Decimal number candidate
	 * @final
	 */
	var parseDec = function (str) {
		var num = parseInt(str, 10);
		return Lang.isValue(num) ? num : str;
	};
	/**
	 * Transforms a decimal number into a hex string
	 * @method decToHex
	 * @param {Number} dec Decimal number
	 * @return String
	 * @final
	 */
	var decToHex = function (dec) {
		return dec.toString(16);
	};
	/**
	 * Transforms a hext string into a decimal number
	 * @method hexToDec
	 * @param {String} hex Hex string
	 * @return Number
	 * @final
	 */
	var hexToDec = function (hex) {
		return parseInt(hex, 16);
	};
	/**
	 * Takes a hex color and returns an array of three numbers between 0 and 255
	 * @method colorHexToArray
	 * @param {String} hexColor Hex color string
	 * @return Array
	 * @final
	 */
	var colorHexToArray = function (hexColor) {
		if (hexColor.substr(0, 1) == "#") {
			hexColor = hexColor.substr(1);
		}
		if (hexColor.length == 3) {
			hexColor = [hexColor.substr(0, 1) + hexColor.substr(0, 1), hexColor.substr(1, 1) + hexColor.substr(1, 1), hexColor.substr(2, 1) + hexColor.substr(2, 1)];
		} else {
			hexColor = [hexColor.substr(0, 2), hexColor.substr(2, 2), hexColor.substr(4, 2)];
		}
		A.each(hexColor, function (val, i) {
			hexColor[i] = hexToDec(val);
		});
		return hexColor;
	};
	/**
	 * Takes an array of three decimal colors and returns a hex color string
	 * @method colorArrayToHex
	 * @param {Array} arr Color array
	 * @return String
	 * @final
	 */
	var colorArrayToHex = function (arr) {
		for (var i = 0; i < 3; i++) {
			arr[i] = decToHex(arr[i]);
			if (arr[i] < 10) {
				arr[i] = "0" + arr[i];
			}
		}
		return "#" + arr.join("");
	};
	
	/*
	 * IE apparently has two different ways of creating VML nodes.
	 * Thanks to Dmitry Baranovskiy of Raphael.js for this bit I couldn't figure out
	 */
	var createIENode;
	try {
		if (!document.namespaces.vml) {
			document.namespaces.add("vml", "urn:schemas-microsoft-com:vml");
		}
    	createIENode = function (tagName) {
			var node = $.context.createElement('<vml:' + tagName + ' class="vml">');
    		return node;
    	};
    } 
    catch (e) {
    	createIENode = function (tagName) {
    		return $.context.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="vml">');
    	};
    }
	
	// Setup VML behaviour
	if (!UA_SUPPORTS_SVG) {
		var styles = $.context.createStyleSheet();
		styles.addRule(".vml", "behavior:url(#default#VML)");
		styles.addRule(".vml", "display:inline-block");
	}

	// Vector class attribute definitions
	var Vector_ATTRS = {};
	
	// These attributes should map to styles in VML instead of DOM attributes
	var VML_STYLE_ATTRIBUTES = ['width', 'height', 'left', 'top'];
	
	// These attributes should always map to DOM attributes in both SVG and VML
	var ATTR_ATTRIBUTES = ['x', 'y', 'rx', 'ry', 'xmlns', 'version', 'fill', 'opacity'].concat(VML_STYLE_ATTRIBUTES);
	
	// Each key in this object is a SVG attribute and its value is its VML equivalent
	var VML_ATTR_MAPPING = {
		fill: "fillcolor",
		x: "left",
		y: "top",
		cx: "left",
		cy: "top"
	};
	
	// Set up attributes according to its support
	if (UA_SUPPORTS_SVG) {
		// In SVG everything works as an attribute modifiable with get/setAttribute()
		ATTR_ATTRIBUTES = ATTR_ATTRIBUTES.concat(VML_STYLE_ATTRIBUTES);
	}
	
	/*
	 * Create a default getter function
	 * @param {String} attrName
	 */
	var getDefaultGetter = function (attrName) {
		return UA_SUPPORTS_SVG ? function () {
			return parseDec(this.get(NODE).getAttribute(attrName));
		} : A.inArray(attrName, VML_STYLE_ATTRIBUTES) ? function () {
			return parseDec(this.get(NODE).style[attrName]);
		} : function () {
			return parseDec(this.get(NODE)[attrName]);
		};
	};
	/*
	 * Create a default setter function 
	 * @param {Object} attrName
	 */
	var getDefaultSetter = function (attrName) {
		return UA_SUPPORTS_SVG ? function (value) {
			this.get(NODE).setAttribute(attrName, value);
			return value;
		} : A.inArray(attrName, VML_STYLE_ATTRIBUTES) ? function (value) {
			this.get(NODE).style[attrName] = value;
			return value;
		} : function (value) {
			this.get(NODE)[attrName] = value;
			return value;
		};
	};
	
	A.each(ATTR_ATTRIBUTES, function (attrName) {
		var mappedAttrName = !UA_SUPPORTS_SVG && VML_ATTR_MAPPING[attrName] ? VML_ATTR_MAPPING[attrName] : attrName;
		Vector_ATTRS[attrName] = {
			getter: getDefaultGetter(mappedAttrName),
			setter: getDefaultSetter(mappedAttrName)
		};
	});
	
	
	// Each key in this object is a SVG attribute and its value is its VML equivalent
	var STROKE_ATTR_MAPPING = {
		stroke: "color",
		"stroke-width": "weight",
		"stroke-opacity": "opacity",
		"stroke-linecap": "endcap",
		"stroke-linejoin": "joinstyle",
		"stroke-miterlimit": "miterlimit",
		"stroke-dasharray": "dashstyle"
	};
	var strokeAttributesGetter = function (name) {
		if (UA_SUPPORTS_SVG) {
			return function (value) {
				this.get(NODE).getAttribute(name);
			};
		} else {
			return function (value) {
				return this.get("stroke")[STROKE_ATTR_MAPPING[name]];
			};
		}
	};
	var strokeAttributesSetter = function (name) {
		if (UA_SUPPORTS_SVG) {
			return function (value) {
				this.get(NODE).setAttribute(name, value);
				return value;
			};
		} else {
			return function (value) {
				var strkNode = this.get("stroke-node");
				strkNode.on = true;
				strkNode[STROKE_ATTR_MAPPING[name]] = value;
				return value;
			};
		}
	};
	Hash.each(STROKE_ATTR_MAPPING, function (asvg) {
		Vector_ATTRS[asvg] = {
			getter: strokeAttributesGetter(asvg),
			setter: strokeAttributesSetter(asvg)
		};
	});
	
	var Vector = UA_SUPPORTS_SVG ? function () {
		Vector.superclass.constructor.apply(this, arguments);
		var myself = this;
		
		var node;
		/**
		 * @config node
		 * @description A pointer to the vector node
		 * @required
		 * @writeOnce
		 * @type SVG/VML node
		 */
		myself.addAttr(NODE, {
			required: true,
			writeOnce: true,
			getter: function () {
				return node;
			},
			setter: function (newNode) {
				node = newNode.nodeType ? newNode : $.context.createElementNS(NAMESPACE_URI, newNode);
				return node;
			}
		});

		node = myself.get(NODE);
		
		/**
		 * @method on
		 * @description Adds an event listener to the vector node
		 * @param {String} eventType
		 * @param {Function} callback
		 * @chainable
		 */
		/**
		 * @method unbind
		 * @description Remove an event listeners from the vector node
		 * @param {String} eventType
		 * @param {Function} callback
		 * @chainable
		 */
		/**
		 * @method unbindAll
		 * @description Removes all event listeners of a certain type from the vector node
		 * @param {String} eventType
		 * @chainable
		 */
		A.each(['on', 'unbind', 'unbindAll'], function (method) {
			myself[method] = function (type, fn) {
				$(node)[method](type, fn);
				return myself;
			};
		});
		
		/**
		 * @config width
		 * @description width
		 */
		/**
		 * @config fill-opacity
		 * @description Opacity
		 */
		myself.addAttrs(Vector_ATTRS).addAttr("fill-opacity", {
			getter: function () {
				return this.get(NODE).getAttribute("fill-opacity");
			},
			setter: function (value) {
				this.get(NODE).setAttribute("opacity", value);
				return value;
			}
		});
		
	} : function () {
		Vector.superclass.constructor.apply(this, arguments);
		var myself = this;
		myself.addAttr(NODE, {
			required: true,
			writeOnce: true,
			getter: function () {
				return myself.node;
			},
			setter: function (node) {
				myself.node = node.nodeType ? node : createIENode(node);
				return myself.node;
			}
		});
		var stroke = createIENode("stroke");
		stroke.on = false;
		myself.set("stroke-node", stroke);
		var fill = createIENode("fill");
		myself.set("fill-node", fill);
		
		var node = myself.get(NODE);
		node.style.position = "absolute";
		node.appendChild(stroke);
		node.appendChild(fill);
		
		A.each(['on', 'unbind', 'unbindAll'], function (method) {
			myself[method] = function (type, fn) {
				$(node)[method](type, fn);
				return myself;
			};
		});
		
		myself.addAttrs(Vector_ATTRS).addAttr("fill-opacity", {
			getter: function () {
				return this.get("fill-node").opacity;
			},
			setter: function (value) {
				this.get("fill-node").opacity = value;
				return value;
			}
		});
	};
	$.extend(Vector, $.Attribute, {
		translate: function () {
			
		},
		scale: function () {
			
		},
		/**
		 * @method append
		 * @description Append the passed vector to this vector
		 * @param {Vector} vector
		 * @chainable
		 */
		append: function (vector) {
			this.get(NODE).appendChild(vector.get(NODE));
			return this;
		},
		/**
		 * @method appendTo
		 * @description Append this vector's node to the target node
		 * @param {NodeList | Vector | DOMNode} target
		 * @chainable
		 */
		appendTo: function (target) {
			target = target instanceof $.NodeList ? target[0] : target instanceof Vector ? target.get(NODE) : target;
			target.appendChild(this.get(NODE));
			return this;
		},
		/**
		 * @method remove
		 * @description Detach this vector from the DOM and remove all event listeners
		 * @chainable
		 */
		remove: function () {
			var node = this.get(NODE);
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
			$(node).unbindAll();
			return this;
		},
		/**
		 * @method detach
		 * @description Detach this vector from the DOM but keep all event listeners
		 */
		detach: function () {
			var node = this.get(NODE);
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
			return this;
		},
		/**
		 * Gets or sets CSS styles
		 * @method css
		 * @param {String|Hash} key
		 * @param {String} [value]
		 * @chainable
		 */
		css: function (key, value) {
			var node = this.get(NODE);
			var css = {};
			if (Lang.isHash(key)) {
				css = key;
			} else if (Lang.isValue(value)) {
				css[key] = value;
			} else {
				return $(node).currentStyle()[key];
			}
			Hash.each(css, function (name, val) {
				node.style[name] = val;
			});
			return this;
		},
		/**
		 * Hides all nodes
		 * @method hide
		 * @chainable
		 */
		hide: function () {
			var node = this.get(NODE);
			var display = node.style.display;
			if (!node.JET_oDisplay && display != "none") {
				node.JET_oDisplay = display;
			}
			node.style.display = "none";
			return this;
		},
		/**
		 * Shows all nodes
		 * @method show
		 * @chainable
		 */
		show: function () {
			var node = this.get(NODE);
			node.style.display = node.JET_oDisplay || "";
			return this;
		},
		/**
		 * Returns true if the first node in the collection has the className CSS class
		 * @method hasClass
		 * @param {String} className
		 * @return Boolean
		 */
		hasClass: function (className) {
			var node = this.get(NODE);
			var className = UA_SUPPORTS_SVG ? node.getAttribute("class") : node.className;
			return A.inArray(className, className ? className.split(" ") : []);
		},
		/**
		 * Removes a number of classes from all nodes in the collection.
		 * Takes multiple string parameters
		 * @method removeClass
		 * @chainable
		 */
		removeClass: function () {
			var args = SLICE.call(arguments);
			var node = this.get(NODE);
			var className = UA_SUPPORTS_SVG ? node.getAttribute("class") : node.className;
			var classes = className ? className.split(" ") : [];
			A.each(args, function (sClass) {
				A.remove(sClass, classes);
			});
			if (UA_SUPPORTS_SVG) {
				node.setAttribute("class", classes.join(" "));
			} else {
				node.className = classes.join(" ");
			}
			return this;
		},
		/**
		 * Adds a number of classes to all nodes in the collection
		 * Takes multiple string parameters
		 * @method addClass
		 * @chainable
		 */
		addClass: function () {
			var args = SLICE.call(arguments);
			var node = this.get(NODE);
			var className = UA_SUPPORTS_SVG ? node.getAttribute("class") : node.className;
			var classes = className ? className.split(" ") : [];
			A.each(args, function (sClass) {
				if (!A.inArray(sClass, classes)) {
					classes[classes.length] = sClass;
				}
			});
			if (UA_SUPPORTS_SVG) {
				node.setAttribute("class", classes.join(" "));
			} else {
				node.className = classes.join(" ");
			}
			return this;
		},
		/**
		 * Adds/removes a certain class from all nodes in the collection
		 * @method toggleClass
		 * @param {String} sClass
		 * @chainable
		 */
		toggleClass: function (sClass) {
			var args = SLICE.call(arguments);
			var node = this.get(NODE);
			var className = UA_SUPPORTS_SVG ? node.getAttribute("class") : node.className;
			var classes = className ? className.split(" ") : [];
			if (!A.inArray(sClass, classes)) {
				classes[classes.length] = sClass;
			} else {
				A.remove(sClass, classes);
			}
			if (UA_SUPPORTS_SVG) {
				node.setAttribute("class", classes.join(" "));
			} else {
				node.className = classes.join(" ");
			}
			return this;
		}
	});
	
	/**
	 * Draws a rectangle
	 * @class Rectangle
	 * @extends Vector
	 * @namespace Vector
	 * @constructor
	 * @param {Object} config
	 */
	var Rectangle = function (config) {
		config.node = config.node && config.node == "roundrect" ? "roundrect" : "rect";
		Rectangle.superclass.constructor.apply(this, arguments);
	};
	$.extend(Rectangle, Vector, {
		/**
		 * @method rotate
		 * @description Rotates the rectangle
		 * @param {Number} angle Angle between 0 and 360
		 * @chainable
		 */
		rotate: UA_SUPPORTS_SVG ? function (angle) {
			var myself = this;
			myself.node.setAttribute("transform", "rotate(" + angle + " " + (myself.get("x") + myself.get("width") / 2) + " " + (myself.get("y") + myself.get("height") / 2) + ")");
			return myself;
		} : function () {
		
		}
	});
	
	/**
	 * A rectangle with rounded corners
	 * @class RoundedRectangle
	 * @extends Rectangle
	 * @constructor
	 * @namespace Vector
	 * @param {Object} config
	 */
	var RoundedRectangle = function (config) {
		config.node = UA_SUPPORTS_SVG ? "rect" : "roundrect";
		RoundedRectangle.superclass.constructor.apply(this, arguments);
	};
	$.extend(RoundedRectangle, Rectangle);
	
	/**
	 * An ellipse
	 * @class Ellipse
	 * @extends Vector
	 * @namespace Vector
	 * @param {Object} config
	 */
	var Ellipse = function (config) {
		config.node = config.node && config.node == "circle" ? "circle" :
					UA_SUPPORTS_SVG ? "ellipse" : "oval";
		Ellipse.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
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
			 * @config ry
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
			}		
		});
		myself.addAttrs({
			/**
			 * @config cx
			 * @description X coordinate of the ellipse's center
			 */
			cx: {
				getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING.cx ? VML_ATTR_MAPPING.cx : "cx"),
				setter: UA_SUPPORTS_SVG ? function (value) {
					this.get(NODE).setAttribute("cx", value);
					return value;
				} : function (value) {
					this.get(NODE).style.left = (value - $.pxToFloat(myself.get("rx"))) + "px";
					return value;
				}
			},
			/**
			 * @config cy
			 * @description Y coordinate of the ellipse's center
			 */
			cy: {
				getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING.cy ? VML_ATTR_MAPPING.cy : "cy"),
				setter: UA_SUPPORTS_SVG ? function (value) {
					this.get(NODE).setAttribute("cy", value);
					return value;
				} : function (value) {
					this.get(NODE).style.top = (value - $.pxToFloat(myself.get("ry")) / 2) + "px";
					return value;
				}
			}
		});
	};
	$.extend(Ellipse, Vector);
	
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
	
	/**
	 * A line vector
	 * @class Line
	 * @extends Vector
	 * @constructor
	 * @namespace Vector
	 * @param {Object} config
	 */
	var Line = function (config) {
		config.node = "line";
		Line.superclass.constructor.apply(this, arguments);
		
		this.addAttrs({
			/**
			 * @config x1
			 * @description X coordinate of the line's starting point
			 */
			x1: {
				getter: getDefaultGetter("x1"),
				setter: getDefaultSetter("x1")
			},
			/**
			 * @config x2
			 * @description X coordinate of the line's ending point
			 */
			x2: {
				getter: getDefaultGetter("x2"),
				setter: getDefaultSetter("x2")
			},
			/**
			 * @config y1
			 * @description Y coordinate of the line's starting point
			 */
			y1: {
				getter: getDefaultGetter("y1"),
				setter: getDefaultSetter("y1")
			},
			/**
			 * @config y2
			 * @description Y coordinate of the line's ending point
			 */
			y2: {
				getter: getDefaultGetter("y2"),
				setter: getDefaultSetter("y2")
			}
		});
	};
	$.extend(Line, Vector);
	
	/**
	 * An Image vector
	 * @class Image
	 * @extends Vector
	 * @constructor
	 * @namespace Vector
	 * @param {Object} config
	 */
	var ImageVector = function (config) {
		ImageVector.superclass.constructor.call(this, "Image");
	};
	$.extend(ImageVector, Vector);
	
	/**
	 * An Text vector
	 * @class Text
	 * @extends Vector
	 * @constructor
	 * @namespace Vector
	 * @param {Object} config
	 */
	var Text = function (config) {
		Text.superclass.constructor.call(this, "text");
		
		this.attr(config);
	};
	$.extend(Text, Vector);
	
	/**
	 * An Path vector
	 * @class Path
	 * @extends Vector
	 * @constructor
	 * @namespace Vector
	 * @param {Object} config
	 */
	var Path = function (config) {
		Path.superclass.constructor.call(this, "path");
	};
	$.extend(Path, Vector);
	
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
});