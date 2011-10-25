
var Lang = $.Lang,
	Hash = $.Hash,
	A = $.Array,
	Base = $.Base,
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
		var node = $.config.doc.createElement('<vml:' + tagName + ' class="vml">');
		return node;
	};
} 
catch (e) {
	createIENode = function (tagName) {
		return $.config.doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="vml">');
	};
}

// Setup VML behaviour
if (!UA_SUPPORTS_SVG) {
	var styles = $.config.doc.createStyleSheet();
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
	return UA_SUPPORTS_SVG ? function (value) {
		this.get(NODE).getAttribute(name);
	} : function (value) {
		return this.get("stroke")[STROKE_ATTR_MAPPING[name]];
	};
};
var strokeAttributesSetter = function (name) {
	return UA_SUPPORTS_SVG ? function (value) {
		this.get(NODE).setAttribute(name, value);
		return value;
	} : function (value) {
		var strkNode = this.get("stroke-node");
		strkNode.on = true;
		strkNode[STROKE_ATTR_MAPPING[name]] = value;
		return value;
	};
};
Hash.each(STROKE_ATTR_MAPPING, function (asvg) {
	Vector_ATTRS[asvg] = {
		getter: strokeAttributesGetter(asvg),
		setter: strokeAttributesSetter(asvg)
	};
});

Vector_ATTRS.node = {
	setter: UA_SUPPORTS_SVG ? function (node) {
		return node.nodeType ? node : $.config.doc.createElementNS(NAMESPACE_URI, node);
	} : function (node) {
		return node.nodeType ? node : createIENode(node);
	}
};
Vector_ATTRS['fill-opacity'] = {
	getter: UA_SUPPORTS_SVG ? function () {
			return this.get(NODE).getAttribute("fill-opacity");
		} : function () {
			return this.get("fill-node").opacity;
		},
	setter: UA_SUPPORTS_SVG ? function (value) {
			this.get(NODE).setAttribute("opacity", value);
			return value;
		} : function (value) {
			this.get("fill-node").opacity = value;
			return value;
		}
};

var Vector = $.Vector = Base.create('vector', $.Attribute, [], {
	/**
	 * @attribute node
	 * @description A pointer to the vector node
	 * @type SVG/VML node
	 */
	/**
	 * @attribute width
	 * @description width
	 */
	/**
	 * @attribute fill-opacity
	 * @description Opacity
	 */
	ATTRS: Vector_ATTRS
}, {
	initializer: function () {
		if (!UA_SUPPORTS_SVG) {
			var stroke = createIENode('stroke');
			var fill = createIENode('fill');
			var node = this.get(NODE);
			stroke.on = false;
			this.set('stroke-node', stroke);
			this.set('fill-node', fill);
			
			node.style.position = "absolute";
			node.appendChild(stroke);
			node.appendChild(fill);
		}
	},
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
		className = UA_SUPPORTS_SVG ? node.getAttribute("class") : node.className;
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
	Vector.prototype[method] = function (type, fn) {
		$(this.get('node'))[method](type, fn);
		return this;
	};
});