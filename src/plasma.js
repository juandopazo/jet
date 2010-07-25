jet().add('plasma', function ($) {
	
	var TRUE = true,
		FALSE = false;
		
	var Lang = $.Lang,
		Hash = $.Hash,
		ArrayHelper = $.Array;
		
	var BOUNDING_BOX = "boundingBox";
	var NAMESPACE_URI = "http://www.w3.org/2000/svg";
	
	var Graphic = function (tagName) {
		
		this._node = tagName.nodeType ? tagName : document.createElementNS(NAMESPACE_URI, tagName);
	};
	$.mix(Graphic.prototype, {
		attr: function (key, value) {
			key = key || {};
			var node = this._node;
			var attrs = {};
			if (Lang.isHash(key)) {
				attrs = key;
			} else if (Lang.isValue(value)) {
				attrs[key] = value;
			} else {
				return node.getAttribute(key)
			}
			Hash.each(attrs, function (name, val) {
				node.setAttribute(name, val);
			});
			return this;
		},
		rotate: function () {
			
		}
	});
	/*
	 * Copy methods from Node
	 */
	ArrayHelper.each(['append', 'appendTo', 'on', 'unbind',
					  'unbindAll', 'remove', 'hide', 'show'], function (method) {
		Graphic.prototype[method] = $.Node.prototype[method];
	});
	
	var GraphicList = function () {
		var collection = [];
			var addToCollection = function (node) {
				if (node instanceof Graphic) {
					collection[collection.length] = node;
				} else if (node.nodeType || Lang.isString(node)) {
					collection[collection.length] = new Graphic(node);
				}
			};
			ArrayHelper.each(arguments, function (node) {
				if (node.length) {
					ArrayHelper.each(node, addToCollection);
				} else {
					addToCollection(node);
				}
			});
			
			this._nodes = collection;
	};
	ArrayHelper.each(['append', 'appendTo', 'on', 'unbind',
					  'unbindAll', 'remove', 'hide', 'show'], function (method) {
		Graphic.prototype[method] = $.Node.prototype[method];
	});
	
	var normalizeAttributes = function (attrs, relationships) {
		Hash.each(relationships, function (from, to) {
			if (Lang.isValue(attrs[from])) {
				attrs[to] = attrs[from];
				delete attrs[from];
			}
		});
		return attrs;
	};
	
	var Rectangle = function (config) {
		Rectangle.superclass.constructor.call(this, "rect");
		
		config = normalizeAttributes(config, {
			r: "rx"
		});
		if (config.rx) {
			config.ry = config.rx;
		}
		
		this.attr(config);
	};
	$.extend(Rectangle, Graphic);
	
	var Circle = function (config) {
		Circle.superclass.constructor.call(this, "circle");
		
		config = normalizeAttributes(config, {
			x: "cx",
			y: "cy"
		});
		
		this.attr(config);
	};
	$.extend(Circle, Graphic);
	
	var ImageGraphic = function (config) {
		ImageGraphic.superclass.constructor.call(this, "Image");
		
		this.attr(config);
	};
	$.extend(ImageGraphic, Graphic);
	
	var Text = function (config) {
		Text.superclass.constructor.call(this, "text");
		
		this.attr(config);
	};
	$.extend(Text, Graphic);
	
	var Plasma = function () {
		Plasma.superclass.constructor.apply(this, arguments);
		var box = new Graphic("svg");
		box.attr({
			xmlns: NAMESPACE_URI,
			version: "1.1"
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
					box.attr("width", value);
					return value;
				}
			},
			height: {
				setter: function (value) {
					box.attr("height", value);
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
			return new Rectangle(config).appendTo(this.get(BOUNDING_BOX));
		},
		circle: function (config) {
			return new Circle(config).appendTo(this.get(BOUNDING_BOX));
		},
		image: function (config) {
			return new ImageGraphic(config).appendTo(this.get(BOUNDING_BOX));
		},
		text: function (config) {
			
		},
		link: function () {
			return new GraphicList(arguments);
		}
	});
	
	Plasma.Circle = Circle;
	Plasma.Rectangle = Rectangle;
	Plasma.Image = ImageGraphic;
	Plasma.Text = Text;
	
	$.add({
		Plasma: Plasma
	});
});