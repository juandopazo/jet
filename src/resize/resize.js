/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Provides a utility for resizing elements
 * @module resize
 * @requires jet, lang, base
 */
jet().add('resize', function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash,
		DOM = $.DOM;
	
	var TOP = "t",
		BOTTOM = "b",
		LEFT = "l",
		RIGHT = "r";
	
	var NEW_DIV = "<div/>",
		LOCKED = "locked",
		HOVER = "hover";
		
	var de = $.context.documentElement,
		db = $.context.body;
				
	/**
	 * Provides a utility for resizing elements
	 * @class Resize
	 * @extends Utility
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var Resize = function () {
		Resize.superclass.constructor.apply(this, arguments);
		
		var self = this;
		self.addAttrs({
			/**
			 * @config node
			 * @description The node to be resized
			 * @required
			 */
			node: {
				required: true,
				setter: function (value) {
					return $(value);
				}
			},
			/**
			 * qconfig handles
			 * @description An array with the position of the needed handles. Posible values: "t", "b", "r", "l", "tr", "tl", etc
			 * @type Array
			 * @default ["b", "r", "br"]
			 */
			handles: {
				value: [Resize.Bottom, Resize.Right, Resize.BottomRight],
				validator: Lang.isArray
			},
			/**
			 * @config hiddenHandles
			 * @description If set to true, the handles are interactive but invisible
			 * @type Boolean
			 * @default false
			 */
			hiddenHandles: {
				value: false
			},
			prefix: {
				value: "yui"
			},
			/**
			 * @config minWidth
			 * @description The minimum with the node can achieve
			 * @type Number
			 * @default 0
			 */
			minWidth: {
				value: 0
			},
			/**
			 * @config minHeight
			 * @description The minimum height the node can achieve
			 * @type Number
			 * @default 0
			 */
			minHeight: {
				value: 0
			},
			/**
			 * @config constrain
			 * @description If set to true, the node can't become bigger than the screen
			 * @type Boolean
			 * @default false
			 */
			constrain: {
				value: false
			},
			/**
			 * @config proxy
			 * @description Whether to use a copy of the node while resizing or not.
			 * Possible values: false, true, "clone"
			 * @type Boolean | String
			 * @default false
			 */
			proxy: {
				value: false
			},
			/**
			 * @config animate
			 * @description Creates an animation when the resize handle is released. Can only be set to true
			 * if "proxy" is set to true. <strong>Requires the Anim module.</strong>
			 * @type Boolean
			 * @default false
			 */
			animate: {
				value: false,
				validator: function () {
					return self.get("proxy");
				}
			},
			/**
			 * @ocnfig reposition
			 * @description If set to true, the resize utility will automatically change the position of the 
			 * node so that is stays in place when resizing it in any direction
			 * @type Boolean
			 * @default false
			 */
			reposition: {
				value: false
			},
			/**
			 * @config shim
			 * @description Uses invisible elements to be able to resize the node over iframes
			 * @type Boolean
			 * @default false 
			 */
			shim: {
				value: false
			},
			/**
			 * @config locked
			 * @description If the resize is locked the handles are not interactive
			 * @type Boolean
			 * @default false
			 */
			locked: {
				value: false
			}
		});

		var node = self.get("node");
				
		var CLIENT = "client",
			HEIGHT = "height",
			WIDTH = "width",
			VISIBILITY = "visibility",
			CLONE_PROXY = "clone",
			AUTO = "auto",
			PX = "px";
		
		var min = {
			height: self.get("minHeight"),
			width: self.get("minWidth")
		};
		var max = {
			height: self.get("maxHeight"),
			width: self.get("maxWidth")
		};
		
		var useProxy = self.get("proxy");
		var proxy = useProxy == CLONE_PROXY ? node.clone() :
				useProxy ? $(NEW_DIV) : node;
					
		var originalStyle = node.currentStyle();
		if (useProxy) {
			if (useProxy === true) {
				var offset = node.offset();
				proxy.addClass("yui-resize-proxy").css({
					left: originalStyle.left,
					top: originalStyle.top,
					bottom: originalStyle.bottom,
					right: originalStyle.right,
					width: originalStyle.width,
					height: originalStyle.height
				});
			} else if (useProxy == CLONE_PROXY) {
				proxy.css({
					visibility: "hidden",
					opacity: 0.5
				});
			}
			proxy.appendTo(node.parent());
		}
		
		var capturing = false;
		var start = {
			X: 0,
			Y: 0
		};
		var originalWidth, originalHeight;
		var currentWidth, currentHeight;
		var screenSize = {
			width: 0,
			height: 0
		};
		var resizeVertical = false, resizeHorizontal = false;
		
		var startResize = function (x, y, left, top) {
			resizeVertical = capturing.indexOf(TOP) > -1 ? TOP :
							 capturing.indexOf(BOTTOM) > -1 ? BOTTOM :
							 false;
			resizeHorizontal = capturing.indexOf(RIGHT) > -1 ? RIGHT :
								capturing.indexOf(LEFT) > -1 ? LEFT :
								false;
			start.X = x;
			start.Y = y;
			
			screenSize = DOM.screenSize();
			
			currentWidth = originalWidth = node.width();
			currentHeight = originalHeight = node.height();
			node.width(originalWidth).height(originalHeight);
			
			if (self.get("reposition")) {
				node.css({
					top:	resizeVertical == TOP ? AUTO : top + PX,
					bottom:	resizeVertical == BOTTOM ? AUTO : (screenSize.height - top - currentHeight) + PX,
					left:	resizeHorizontal == LEFT ? AUTO : left + PX,
					right:	resizeHorizontal == RIGHT ? AUTO : (screenSize.width - left - currentWidth) + PX
				});
			}
			
			if (useProxy) {
				proxy.css(VISIBILITY, "visible");
			}
		};
		
		var getNew = function (type, x, y) {
			var vertical = (type == HEIGHT);
			var resize = vertical ? resizeVertical : resizeHorizontal;
			var original = vertical ? originalHeight : originalWidth;
			var direction = vertical ? "Y" : "X";
			
			var size = resize == (vertical ? TOP : LEFT) ? original - (vertical ? y : x) + start[direction] :
					   resize == (vertical ? BOTTOM : RIGHT) ? original + (vertical ? y : x) - start[direction] :
					   original;
			
			return size < min[type] ?  min[type] : 
				   max[type] && size > max[type] ? max[type] :
				   self.get("constrain") && size > screenSize[type] ? screenSize[type] : 
				   size;
		};
		
		var tracker = new $.Mouse({
			shim: self.get("shim")
		});
				
		var stopResize = function (e, x, y) {
			if (!self.get(LOCKED)) {
				if (capturing) {
					screenSize = DOM.screenSize();
					currentWidth = getNew(WIDTH, x, y);
					currentHeight = getNew(HEIGHT, x, y);
					if (!self.get("animate")) {
						if (resizeVertical) {
							node.height(currentHeight);
						}
						if (resizeHorizontal) {
							node.width(currentWidth);
						}
					} else if ($.Anim) {
						var to = {};
						if (resizeVertical) {
							to.height = currentHeight;
						}
						if (resizeHorizontal) {
							to.width = currentWidth;
						}
						(new $.Anim({
							node: node,
							to: to,
							duration: "fast"
						})).start();
					}
				}
				capturing = false;
				var offset;
				if (useProxy) {
					proxy.css(VISIBILITY, "hidden");
					offset = proxy.offset();
				} else {
					offset = node.offset();
				}
				/**
				 * @event endResize
				 * @description Fires when the resize action ends
				 */
				self.fire("endResize", currentWidth, currentHeight, offset.left, offset.top);
			}
		};
		
		var lastX, lastY;
		var duringResize = function (e, x, y) {
			lastX = x;
			lastY = y;
			if (!self.get(LOCKED) && capturing) {
				var offset = proxy.offset();
				/**
				 * @event beforeResize
				 * @description Fires before the resize action starts. If prevented, the resize action doesn't start
				 * @param {Number} currentWith
				 * @param {Number} currentHeight
				 * @param {Number} offsetLeft
				 * @param {Number} offsetTop 
				 */
				if (self.fire("beforeResize", currentWidth, currentHeight, offset.left, offset.top)) {
					screenSize = DOM.screenSize();
					if (resizeVertical) {
						currentHeight = getNew(HEIGHT, x, y);
					}
					if (resizeHorizontal) {
						currentWidth = getNew(WIDTH, x, y);
					}
					offset = proxy.offset();
					/**
					 * @event resize
					 * @description Fires during the resize action
					 * @param {Number} currentWith
					 * @param {Number} currentHeight
					 * @param {Number} offsetLeft
					 * @param {Number} offsetTop 
					 */
					if (self.fire("resize", currentWidth, currentHeight, offset.left, offset.top)) {
						if (Lang.isNumber(currentHeight) && Lang.isNumber(currentWidth)) {
							proxy.height(currentHeight).width(currentWidth);
						}
					}
				} else {
					stopResize(x, y);
				}
			}
		};
		
		var resizeClass = self.get("prefix") + "-resize";
		var hoverClass = resizeClass + "-hover";
		var handleClass = resizeClass + "-handle";
		var handleClassActive = "-active";
		$.Array.each(self.get("handles"), function (type) {
			var handle = $(NEW_DIV);
			handle.addClass([handleClass, " ", handleClass, "-", type].join(""));
			handle.on("mousedown", function (e) {
				if (!self.get(LOCKED)) {
					var offset = proxy.offset();
					capturing = type;
					tracker.get("shields").css("cursor", handle.currentStyle().cursor);
					tracker.set("tracking", true);
					startResize(e.clientX, e.clientY, offset.left, offset.top, type);
					self.fire("startResize", currentWidth, currentHeight, offset.left, offset.top, type);
				}
			});
			handle.on("mouseover", function (e) {
				if (!self.get(LOCKED) && !capturing) {
					handle.addClass([handleClass, handleClassActive, " ", handleClass, "-", type, handleClassActive].join(""));
					if (self.get(HOVER)) {
						node.removeClass(hoverClass);
					}
				}
			});
			handle.on("mouseout", function (e) {
				if (!self.get(LOCKED)) {
					handle.removeClass(handleClass + handleClassActive).removeClass(handleClass + "-" + type + handleClassActive);
					if (self.get(HOVER)) {
						node.addClass(hoverClass);
					}
				}
			})
			handle.append($(NEW_DIV).addClass(handleClass + "-inner-" + type)).appendTo(node);
		});
		node.addClass(resizeClass).css("display", "block");
		if (self.get("hiddenHandles")) {
			node.addClass(resizeClass + "-hidden");
		} else if (self.get(HOVER)) {
			node.addClass(hoverClass);
		}
		tracker.on("mouseup", stopResize);
		tracker.on("mousemove", duringResize);
		
		/**
		 * @method stop
		 * @description Makes the resize action end prematurely
		 * @chainable
		 */
		this.stop = function () {
			stopResize(lastX, lastY);
			return this;
		};
	};
	$.extend(Resize, $.Utility, {
		/**
		 * @method lock
		 * @description Makes the handles non interactive
		 * @chainable
		 */
		lock: function () {
			return this.set(LOCKED, true);
		},
		/**
		 * @method unlock
		 * @description Makes the handles interactive
		 * @chainable
		 */
		unlock: function () {
			return this.set(LOCKED, false);
		}
	});
	
	Hash.each({
		Top: TOP,
		Bottom: BOTTOM,
		Left: LEFT,
		Right: RIGHT,
		TopLeft: TOP + LEFT,
		TopRight: TOP * RIGHT,
		BottomLeft: BOTTOM + LEFT,
		BottomRight: BOTTOM + RIGHT
	}, function (name, value) {
		Resize[name] = value;
	});
	$.Resize = Resize;
});