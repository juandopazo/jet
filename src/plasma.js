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
	 * IE apparently has two different ways to create VML nodes
	 */
	var createIENode;
	try {
    	!document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
    	createIENode = function(tagName) {
			var node = $.context.createElement('<rvml:' + tagName + ' class="rvml">');
    		return node;
    	};
    } 
    catch (e) {
    	createIENode = function(tagName) {
    		return $.context.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
    	};
    }
	
	/*
	 * Setup VML behaviour
	 */
	if (!UA_SUPPORTS_SVG) {
		var styles = $.context.createStyleSheet();
		styles.addRule(".rvml", "behavior:url(#default#VML)");
		styles.addRule(".rvml", "display:inline-block");
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
	var VML_STYLE_ATTRIBUTES = ['width', 'height'];
	/*
	 * This attributes should always map to DOM attributes in both SVG and VML
	 */
	var ATTR_ATTRIBUTES = ['x', 'y', 'cx', 'cy', 'rx', 'ry', 'xmlns', 'version', 'fill'].concat(VML_STYLE_ATTRIBUTES);
	/*
	 * Each key in this object is a SVG attribute and its value is its VML equivalent
	 */
	var VML_ATTR_MAPPING = {
		fill: "fillcolor",
		rx: "width",
		ry: "height"
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
		myself.addAttrs(Graphic_ATTRS);
		
		var node = myself.get(NODE);
		myself._node = node.nodeType ? node : $.context.createElementNS(NAMESPACE_URI, node);
		
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
		myself.addAttrs(Graphic_ATTRS);
		
		var node = myself.get(NODE);
		myself._node = node.nodeType ? node : createIENode(node);
		
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
					  'unbindAll', 'remove', 'hide', 'show'], function (method) {
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
					ns.width = value;
					ns.height = value;
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
	var Ellipse = function (config) {
		config.node = UA_SUPPORTS_SVG ? "ellipse" : "oval";
		Ellipse.superclass.constructor.apply(this, arguments);
	};
	$.extend(Ellipse, Graphic);
	
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
	$.extend(Plasma, $.TimeFrame, {
		rectangle: function (config) {
			return new Rectangle(config).set(PLASMA, this).appendTo(this.get(BOUNDING_BOX));
		},
		circle: function (config) {
			return new Circle(config).set(PLASMA, this).appendTo(this.get(BOUNDING_BOX));
		},
		ellipse: function (config) {
			return new Ellipse(config).set(PLASMA, this).appendTo(this.get(BOUNDING_BOX));
		},
		image: function (config) {
			return new ImageGraphic(config).set(PLASMA, this).appendTo(this.get(BOUNDING_BOX));
		},
		text: function (config) {
			return new Text(config).set(PLASMA, this).appendTo(this.get(BOUNDING_BOX));
		},
		path: function (config) {
			return new Path(config).set(PLASMA, this).appendTo(this.get(BOUNDING_BOX));
		},
		link: function () {
			return new GraphicList(arguments);
		}
	});
	
	Plasma.Circle = Circle;
	Plasma.Rectangle = Rectangle;
	Plasma.Image = ImageGraphic;
	Plasma.Text = Text;
	Plasma.Path = Path;
	
	$.add({
		Plasma: Plasma
	});
});