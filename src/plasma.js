jet().add('plasma', function ($) {
	
	var TRUE = true,
		FALSE = false;
		
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;
		
	var BOUNDING_BOX = "boundingBox",
		NODE = "node",
		PLASMA = "plasma";
	var NAMESPACE_URI = "http://www.w3.org/2000/svg";
	
	var UA_SUPPORTS_SVG = !$.UA.ie || $.UA.ie > 8;
	
	var Node = $.Node,
		NP = Node.prototype;
		
	/*
	 * Parsing functions
	 */
	var decToHex = function (dec) {
		return dec.toString(16);
	};
	var hexToDec = function (hex) {
		return parseInt(hex, 16);
	};
	var colorHexToArray = function (hexColor) {
		if (hexColor.substr(0, 1) == "#") {
			hexColor = hexColor.substr(1);
		}
		if (hexColor.length == 3) {
			hexColor = [hexColor.substr(0, 1) + hexColor.substr(0, 1), hexColor.substr(1, 1) + hexColor.substr(1, 1), hexColor.substr(2, 1) + hexColor.substr(2, 1)]
		} else {
			hexColor = [hexColor.substr(0, 2), hexColor.substr(2, 2), hexColor.substr(4, 2)];
		}
		A.each(hexColor, function (val, i) {
			hexColor[i] = hexToDec(val);
		});
		return hexColor;
	};
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
    	!document.namespaces.vml && document.namespaces.add("vml", "urn:schemas-microsoft-com:vml");
    	createIENode = function(tagName) {
			var node = $.context.createElement('<vml:' + tagName + ' class="vml">');
    		return node;
    	};
    } 
    catch (e) {
    	createIENode = function(tagName) {
    		return $.context.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="vml">');
    	};
    }
	
	/*
	 * Setup VML behaviour
	 */
	if (!UA_SUPPORTS_SVG) {
		var styles = $.context.createStyleSheet();
		styles.addRule(".vml", "behavior:url(#default#VML)");
		styles.addRule(".vml", "display:inline-block");
	}

	/**
	 * Create a default getter function
	 * @param {String} attrName
	 */
	var getDefaultGetter = function (attrName) {
		return UA_SUPPORTS_SVG ?  function () {
			return this._node.getAttribute(attrName);
		} : A.inArray(attrName, VML_STYLE_ATTRIBUTES) ? function () {
			return this._node.style[attrName];
		} : function () {
			return this._node[attrName];
		};
	};
	/**
	 * Create a default setter function 
	 * @param {Object} attrName
	 */
	var getDefaultSetter = function (attrName) {
		return UA_SUPPORTS_SVG ? function (value) {
			this._node.setAttribute(attrName, value);
			return value;
		} : A.inArray(attrName, VML_STYLE_ATTRIBUTES) ? function (value) {
			this._node.style[attrName] = value;
			return value;
		} : function (value) {
			this._node[attrName] = value;
			return value;
		};
	};
	
	/*
	 * Graphic class attribute definitions
	 */
	var Graphic_ATTRS = {};
	/*
	 * This attributes should map to styles in VML instead of DOM attributes
	 */
	var VML_STYLE_ATTRIBUTES = ['width', 'height', 'left', 'top'];
	/*
	 * This attributes should always map to DOM attributes in both SVG and VML
	 */
	var ATTR_ATTRIBUTES = ['x', 'y', 'rx', 'ry', 'xmlns', 'version', 'fill', 'opacity'].concat(VML_STYLE_ATTRIBUTES);
	/*
	 * Each key in this object is a SVG attribute and its value is its VML equivalent
	 */
	var VML_ATTR_MAPPING = {
		fill: "fillcolor",
		x: "left",
		y: "top",
		cx: "left",
		cy: "top"
	};
	/*
	 * Set up attributes according to its support
	 */
	if (UA_SUPPORTS_SVG) {
		/*
		 * In SVG everything works as an attribute modifiable with get/setAttribute() 
		 */
		ATTR_ATTRIBUTES = ATTR_ATTRIBUTES.concat(VML_STYLE_ATTRIBUTES);

	}
	A.each(ATTR_ATTRIBUTES, function (attrName) {
		var mappedAttrName = !UA_SUPPORTS_SVG && VML_ATTR_MAPPING[attrName] ? VML_ATTR_MAPPING[attrName] : attrName;
		Graphic_ATTRS[attrName] = {
			getter: getDefaultGetter(mappedAttrName),
			setter: getDefaultSetter(mappedAttrName)
		}
	});
	
	
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
				this._node.getAttribute(name);
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
				this._node.setAttribute(name, value);
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
		Graphic_ATTRS[asvg] = {
			getter: strokeAttributesGetter(asvg),
			setter: strokeAttributesSetter(asvg)
		};
	});
	
	/**
	 * Basic Graphic class
	 * A graphic represents a figure, an SVG element or its VML counterpart 
	 * 
	 * @param {Object} configuration key/value pairs, as in the Attribute class
	 */
	var Graphic = UA_SUPPORTS_SVG ? function () {
		Graphic.superclass.constructor.apply(this, arguments);
		var myself = this;
		myself.addAttr(NODE, {
			required: TRUE,
			getter: function () {
				return myself._node;
			},
			setter: function (node) {
				myself._node = node.nodeType ? node : $.context.createElementNS(NAMESPACE_URI, node);
				return myself._node;
			}
		});
		var node = myself.get(NODE);
		myself._node = node.nodeType ? node : $.context.createElementNS(NAMESPACE_URI, node);
		
		myself.addAttrs(Graphic_ATTRS).addAttr("fill-opacity", {
			getter: function () {
				return this.get(NODE).getAttribute("fill-opacity");
			},
			setter: function (value) {
				this.get(NODE).setAttribute("opacity", value);
				return value;
			}
		});
		
	} : function () {
		Graphic.superclass.constructor.apply(this, arguments);
		var myself = this;
		myself.addAttr(NODE, {
			required: TRUE,
			getter: function () {
				return myself._node;
			},
			setter: function (node) {
				myself._node = node.nodeType ? node : createIENode(node);
				return myself._node;
			}
		});
		var node = myself.get(NODE);
		myself._node = node.nodeType ? node : createIENode(node);
		node.style.position = "absolute";
		var stroke = createIENode("stroke");
		stroke.on = false;
		node.appendChild(stroke);
		myself.set("stroke-node", stroke);
		var fill = createIENode("fill");
		node.appendChild(fill);
		myself.set("fill-node", fill);

		myself.addAttrs(Graphic_ATTRS).addAttr("fill-opacity", {
			getter: function () {
				return this.get("fill-node")["opacity"];
			},
			setter: function (value) {
				this.get("fill-node")["opacity"] = value;
				return value;
			}
		});;
	};
	$.extend(Graphic, $.Attribute, {
		rotate: function () {
			
		},
		translate: function () {
			
		},
		scale: function () {
			
		}
	});
	/*
	 * Copy methods from Node
	 * After all, SVG and VML elements are DOM nodes and we don't want them to have custom events,
	 * but we don't need every method from Node either
	 */
	A.each(['append', 'appendTo', 'on', 'unbind',
					  'unbindAll', 'remove', 'hide', 'show', 'children'], function (method) {
		Graphic.prototype[method] = NP[method];
	});
	
	/**
	 * A collection of Graphics
	 */
	var GraphicList = function () {
		var collection = [];
			var addToCollection = function (node) {
				if (node instanceof Graphic) {
					collection[collection.length] = node;
				} else if (node.nodeType || Lang.isString(node)) {
					collection[collection.length] = new Graphic(node);
				}
			};
			A.each(arguments, function (node) {
				if (node.length) {
					A.each(node, addToCollection);
				} else {
					addToCollection(node);
				}
			});
			
			this._nodes = collection;
	};
	$.extend(GraphicList, $.Attribute, {
		
	});
	A.each(['each', 'append', 'appendTo', 'on', 'unbind',
					  'unbindAll', 'remove', 'hide', 'show'], function (method) {
		GraphicList.prototype[method] = NP[method];
	});
	
	/**
	 * 
	 * @param {Object} config
	 */
	var Rectangle = function (config) {
		config.node = "rect";
		Rectangle.superclass.constructor.apply(this, arguments);
	};
	$.extend(Rectangle, Graphic);
	
	/**
	 * 
	 * @param {Object} config
	 */
	var RoundedRectangle = function (config) {
		config.node = UA_SUPPORTS_SVG ? "rect" : "roundrect";
		RoundedRectangle.superclass.constructor.apply(this, arguments);
	};
	$.extend(RoundedRectangle, Graphic);
	
	/**
	 * 
	 * @param {Object} config
	 */
	var Ellipse = function (config) {
		config.node = UA_SUPPORTS_SVG ? "ellipse" : "oval";
		Ellipse.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			rx: {
				getter: UA_SUPPORTS_SVG ? function () {
					return this._node.getAttribute("rx");
				} : function () {
					return $.pxToFloat(this._node.style.width) / 2;
				},
				setter: UA_SUPPORTS_SVG ? function (value) {
					this._node.setAttribute("rx", value);
					return value;
				} : function (value) {
					this._node.style.width = value * 2;
					return value;
				}
			},
			ry: {
				getter: UA_SUPPORTS_SVG ? function () {
					return this._node.getAttribute("ry");
				} : function () {
					return $.pxToFloat(this._node.style.width) / 2;
				},
				setter: UA_SUPPORTS_SVG ? function (value) {
					this._node.setAttribute("ry", value);
					return value;
				} : function (value) {
					this._node.style.height = value * 2;
					return value;
				}
			}		
		});
		myself.addAttrs({
			cx: {
				getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING["cx"] ? VML_ATTR_MAPPING["cx"] : "cx"),
				setter: UA_SUPPORTS_SVG ? function (value) {
					this._node.setAttribute("cx", value);
					return value;
				} : function (value) {
					this._node.style.left = (value - $.pxToFloat(myself.get("rx"))) + "px";
					return value;
				}
			},
			cy: {
				getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING["cy"] ? VML_ATTR_MAPPING["cy"] : "cy"),
				setter: UA_SUPPORTS_SVG ? function (value) {
					this._node.setAttribute("cy", value);
					return value;
				} : function (value) {
					this._node.style.top = (value - $.pxToFloat(myself.get("ry")) / 2) + "px";
					return value;
				}
			}
		});
	};
	$.extend(Ellipse, Graphic);
	
	/**
	 * 
	 * @param {Object} config
	 */
	var Circle = function (config) {
		config.node = UA_SUPPORTS_SVG ? "circle" : "oval";
		Circle.superclass.constructor.apply(this, arguments);
		var myself = this.addAttrs({
			r: {
				getter: UA_SUPPORTS_SVG ? function () {
					return this._node.getAttribute("r");
				} : function () {
					return this._node.style.width;
				},
				setter: UA_SUPPORTS_SVG ? function (value) {
					this._node.setAttribute("r", value);
					return value;
				} : function (value) {
					var ns = this._node.style;
					ns.width = value * 2;
					ns.height = value * 2;
					return value;
				}
			}
		});
		myself.addAttrs({
			cx: {
				getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING["cx"] ? VML_ATTR_MAPPING["cx"] : "cx"),
				setter: UA_SUPPORTS_SVG ? function (value) {
					this._node.setAttribute("cx", value);
					return value;
				} : function (value) {
					this._node.style.left = (value - $.pxToFloat(myself.get("r")) / 2) + "px";
					return value;
				}
			},
			cy: {
				getter: getDefaultGetter(!UA_SUPPORTS_SVG && VML_ATTR_MAPPING["cy"] ? VML_ATTR_MAPPING["cy"] : "cy"),
				setter: UA_SUPPORTS_SVG ? function (value) {
					this._node.setAttribute("cy", value);
					return value;
				} : function (value) {
					this._node.style.top = (value - $.pxToFloat(myself.get("r")) / 2) + "px";
					return value;
				}
			}
		});
	};
	$.extend(Circle, Graphic);
	
	/**
	 * 
	 * @param {Object} config
	 */
	var ImageGraphic = function (config) {
		ImageGraphic.superclass.constructor.call(this, "Image");
		
		this.attr(config);
	};
	$.extend(ImageGraphic, Graphic);
	
	/**
	 * 
	 * @param {Object} config
	 */
	var Text = function (config) {
		Text.superclass.constructor.call(this, "text");
		
		this.attr(config);
	};
	$.extend(Text, Graphic);
	
	/**
	 * 
	 * @param {Object} config
	 */
	var Path = function (config) {
		Path.superclass.constructor.call(this, "path");
		
		this.attr(config);
	};
	$.extend(Path, Graphic);
	
	/**
	 * 
	 */
	var Plasma = UA_SUPPORTS_SVG ? function () {
		Plasma.superclass.constructor.apply(this, arguments);
		var box = new Graphic({
			node: "svg",
			xmlns: NAMESPACE_URI,
			version: "1.1"
		});
		var myself = this.addAttrs({
			srcNode: {
				required: TRUE,
				setter: $
			},
			width: {
				setter: function (value) {
					box.set("width", value);
					return value;
				}
			},
			height: {
				setter: function (value) {
					box.set("height", value);
					return value;
				}
			},
			boundingBox: {
				readOnly: TRUE,
				getter: function () {
					return box;
				}
			}
		});
		
		myself.get("srcNode").append(box);
		
	} : function () {
		Plasma.superclass.constructor.apply(this, arguments);
		
		var box = new Node("div");
		box.css({
			position: "relative",
			overflow: "hidden"
		});

		var myself = this.addAttrs({
			srcNode: {
				required: TRUE,
				setter: function (value) {
					return $(value);
				}
			},
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
				readOnly: TRUE,
				getter: function () {
					return box;
				}
			}
		});
		
		myself.get("srcNode").append(box);
		
	};
	var appendToPlasma = function (shape, plasma) {
		return shape.set(PLASMA, plasma).appendTo(plasma.get(BOUNDING_BOX));
	};
	$.extend(Plasma, $.TimeFrame, {
		rectangle: function (config) {
			return appendToPlasma(new Rectangle(config), this);
		},
		circle: function (config) {
			return appendToPlasma(new Circle(config), this);
		},
		ellipse: function (config) {
			return appendToPlasma(new Ellipse(config), this);
		},
		image: function (config) {
			return appendToPlasma(new ImageGraphic(config), this);
		},
		text: function (config) {
			return appendToPlasma(new Text(config), this);
		},
		path: function (config) {
			return appendToPlasma(new Path(config), this);
		},
		link: function () {
			return new GraphicList(arguments);
		},
		clear: function () {
			this.get(BOUNDING_BOX).children().remove();
		}
	});
	
	Plasma.Circle = Circle;
	Plasma.Rectangle = Rectangle;
	Plasma.Image = ImageGraphic;
	Plasma.Text = Text;
	Plasma.Path = Path;
	
	$.add({
		Plasma: Plasma,
		decToHex: decToHex,
		hexToDec: hexToDec,
		colorHexToArray: colorHexToArray,
		colorArrayToHex: colorArrayToHex
	});
});