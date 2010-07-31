/*
 * @requires Base module
 */
jet().add('resize', function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash;
	
	var TOP = "t",
		BOTTOM = "b",
		LEFT = "l",
		RIGHT = "r";
	
	var TRUE = true,
		FALSE = false;
		
	var NEW_DIV = "<div/>",
		LOCKED = "locked",
		HOVER = "hover";
		
	var de = $.context.documentElement,
		db = $.context.body;
				
	/**
	 * 
	 * @extends Utility
	 */
	var Resize = function () {
		Resize.superclass.constructor.apply(this, arguments);
		
		var myself = this;
		myself.addAttrs({
			node: {
				required: TRUE,
				setter: function (value) {
					return $(value);
				}
			},
			handles: {
				value: [Resize.Bottom, Resize.Right, Resize.BottomRight],
				validator: Lang.isArray
			},
			prefix: {
				value: "yui"
			},
			minWidth: {
				value: 0
			},
			minHeight: {
				value: 0
			},
			constrain: {
				value: FALSE
			},
			animate: {
				value: FALSE,
				validator: function () {
					return myself.get("proxy");
				}
			}
		});

		var node = myself.get("node");
				
		var CLIENT = "client",
			HEIGHT = "height",
			WIDTH = "width",
			VISIBILITY = "visibility",
			CLONE_PROXY = "clone",
			AUTO = "auto",
			PX = "px";
		
		var min = {
			height: myself.get("minHeight"),
			width: myself.get("minWidth")
		};
		var max = {
			height: myself.get("maxHeight"),
			width: myself.get("maxWidth")
		};
		
		var useProxy = myself.get("proxy");
		var proxy = useProxy == CLONE_PROXY ? node.clone() :
				useProxy ? $(NEW_DIV) : node;
					
		var originalStyle = node.currentStyle();
		if (useProxy) {
			if (useProxy === TRUE) {
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
		
		var capturing = FALSE;
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
		var resizeVertical = FALSE, resizeHorizontal = FALSE;
		
		var startResize = function (x, y, left, top) {
			resizeVertical = capturing.indexOf(TOP) > -1 ? TOP :
							 capturing.indexOf(BOTTOM) > -1 ? BOTTOM :
							 FALSE;
			resizeHorizontal = capturing.indexOf(RIGHT) > -1 ? RIGHT :
								capturing.indexOf(LEFT) > -1 ? LEFT :
								FALSE;
			start.X = x;
			start.Y = y;
			
			screenSize = $.screenSize();
			
			currentWidth = originalWidth = node.width();
			currentHeight = originalHeight = node.height();
			node.width(originalWidth).height(originalHeight);
			
			if (myself.get("reposition")) {
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
				   myself.get("constrain") && size > screenSize[type] ? screenSize[type] : 
				   size;
		};
		
		var tracker = new $.utils.MouseTracker({
			shim: myself.get("shim")
		});
				
		var stopResize = function (e, x, y) {
			if (!myself.get(LOCKED)) {
				if (capturing) {
					screenSize = $.screenSize();
					currentWidth = getNew(WIDTH, x, y);
					currentHeight = getNew(HEIGHT, x, y);
					if (!myself.get("animate")) {
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
				capturing = FALSE;
				var offset;
				if (useProxy) {
					proxy.css(VISIBILITY, "hidden");
					offset = proxy.offset();
				} else {
					offset = node.offset();
				}
				myself.fire("endResize", currentWidth, currentHeight, offset.left, offset.top);
			}
		};
		
		var lastX, lastY;
		var duringResize = function (e, x, y) {
			lastX = x;
			lastY = y;
			if (!myself.get(LOCKED) && capturing) {
				var offset = proxy.offset();
				if (myself.fire("beforeResize", currentWidth, currentHeight, offset.left, offset.top)) {
					screenSize = $.screenSize();
					if (resizeVertical) {
						currentHeight = getNew(HEIGHT, x, y);
					}
					if (resizeHorizontal) {
						currentWidth = getNew(WIDTH, x, y);
					}
					offset = proxy.offset();
					if (myself.fire("resize", currentWidth, currentHeight, offset.left, offset.top)) {
						if (Lang.isNumber(currentHeight) && Lang.isNumber(currentWidth)) {
							proxy.height(currentHeight).width(currentWidth);
						}
					}
				} else {
					stopResize(x, y);
				}
			}
		};
		
		var resizeClass = myself.get("prefix") + "-resize";
		var hoverClass = resizeClass + "-hover";
		var handleClass = resizeClass + "-handle";
		var handleClassActive = "-active";
		$.Array.each(myself.get("handles"), function (type) {
			var handle = $(NEW_DIV);
			handle.addClass([handleClass, " ", handleClass, "-", type].join(""));
			handle.on("mousedown", function (e) {
				if (!myself.get(LOCKED)) {
					var offset = proxy.offset();
					capturing = type;
					tracker.get("shim").css("cursor", handle.currentStyle().cursor);
					tracker.set("tracking", TRUE);
					startResize(e.clientX, e.clientY, offset.left, offset.top, type);
					myself.fire("startResize", currentWidth, currentHeight, offset.left, offset.top, type);
				}
			}).on("mouseover", function (e) {
				if (!myself.get(LOCKED) && !capturing) {
					handle.addClass([handleClass, handleClassActive, " ", handleClass, "-", type, handleClassActive].join(""));
					if (myself.get(HOVER)) {
						node.removeClass(hoverClass);
					}
				}
			}).on("mouseout", function (e) {
				if (!myself.get(LOCKED)) {
					handle.removeClass(handleClass + handleClassActive).removeClass(handleClass + "-" + type + handleClassActive);
					if (myself.get(HOVER)) {
						node.addClass(hoverClass);
					}
				}
			}).append($(NEW_DIV).addClass(handleClass + "-inner-" + type)).appendTo(node);
		});
		node.addClass(resizeClass).css("display", "block");
		if (myself.get("hiddenHandles")) {
			node.addClass(resizeClass + "-hidden");
		} else if (myself.get(HOVER)) {
			node.addClass(hoverClass);
		}
		tracker.on("mouseup", stopResize);
		tracker.on("mousemove", duringResize);
		
		this.stop = function () {
			stopResize(lastX, lastY);
		};
	};
	$.extend(Resize, $.Utility, {
		lock: function () {
			if (this.fire("lock")) {
				this.set(LOCKED, TRUE);
			}
		},
		unlock: function () {
			if (this.fire("unlock")) {
				this.set(LOCKED, FALSE);
			}
		},
		isLocked: function () {
			return !!this.get(LOCKED);
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
