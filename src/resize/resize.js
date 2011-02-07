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
		A = $.Array,
		DOM = $.DOM,
		bind = $.bind;
	
	var TOP = "t",
		BOTTOM = "b",
		LEFT = "l",
		RIGHT = "r",
		CLIENT = "client",
		HEIGHT = "height",
		WIDTH = "width",
		VISIBILITY = "visibility",
		CLONE_PROXY = "clone",
		AUTO = "auto",
		PX = "px",
		NEW_DIV = "<div/>",
		LOCKED = "locked",
		HOVER = "hover";
		
	/**
	 * Provides a utility for resizing elements
	 * @class Resize
	 * @extends Utility
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.Resize = $.Utility.create('resize', {
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
		cssPrefix: {
			value: "yui",
			writeOnce: true
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
		},
		proxyNode: {
			value: null
		},
		mouse: {
			value: null,
			writeOnce: true
		},
		capturing: {
			value: false
		}
	}, {
		
		_getNewSize: function (type, x, y) {
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
		},
		
		_startResize: function (x, y, left, top) {
			var node = this.get(NODE)
			
			var capturing = this.get('capturing');
			var resizeVertical = capturing.indexOf(TOP) > -1 ? TOP : capturing.indexOf(BOTTOM) > -1 ? BOTTOM : false;
			var resizeHorizontal = capturing.indexOf(RIGHT) > -1 ? RIGHT : capturing.indexOf(LEFT) > -1 ? LEFT : false;
			var screenSize = DOM.screenSize();
			var originalWidth = node.width();
			var originalHeight = node.height();
			
			node.width(originalWidth).height(originalHeight);

			this.set({
				startX: x,
				startY: y,
				originalWidth: originalWidth,
				originalHeight: originalHeight,
				currentWidth: originalWidth,
				currentHeight: originalHeight
			});
			
			if (this.get("reposition")) {
				node.css({
					top:	resizeVertical == TOP ? AUTO : top + PX,
					bottom:	resizeVertical == BOTTOM ? AUTO : (screenSize.height - top - currentHeight) + PX,
					left:	resizeHorizontal == LEFT ? AUTO : left + PX,
					right:	resizeHorizontal == RIGHT ? AUTO : (screenSize.width - left - currentWidth) + PX
				});
			}
			
			if (this.get(PROXY)) {
				this.get(PROXY_NODE).css(VISIBILITY, "visible");
			}
		},
		
		_duringResize: function (e, x, y) {
			lastX = x;
			lastY = y;
			var capturing = this.get('capturing');
			var proxy = this.get(PROXY_NODE);
			var currentWidth = this.get('currentWidth');
			var currentHeight = this.get('currentHeight');
			if (!this.get(LOCKED) && capturing) {
				var offset = proxy.offset();
				/**
				 * @event beforeResize
				 * @description Fires before the resize action starts. If prevented, the resize action doesn't start
				 * @param {Number} currentWith
				 * @param {Number} currentHeight
				 * @param {Number} offsetLeft
				 * @param {Number} offsetTop 
				 */
				if (this.fire("beforeResize", currentWidth, currentHeight, offset.left, offset.top)) {
					screenSize = DOM.screenSize();
					if (resizeVertical) {
						currentHeight = this._getNewSize(HEIGHT, x, y);
					}
					if (resizeHorizontal) {
						currentWidth = this._getNewSize(WIDTH, x, y);
					}
					/**
					 * @event resize
					 * @description Fires during the resize action
					 * @param {Number} currentWith
					 * @param {Number} currentHeight
					 * @param {Number} offsetLeft
					 * @param {Number} offsetTop 
					 */
					if (this.fire("resize", currentWidth, currentHeight, offset.left, offset.top)) {
						if (Lang.isNumber(currentHeight) && Lang.isNumber(currentWidth)) {
							proxy.height(currentHeight).width(currentWidth);
						}
					}
				} else {
					this._stopResize.call(this, null, x, y);
				}
			}
		},
		
		_stopResize: function (e, x, y) {
			if (!this.get(LOCKED)) {
				var capturing = this.get('capturing');
				var node = this.get(NODE);
				var resizeVertical = capturing.indexOf(TOP) > -1 ? TOP : capturing.indexOf(BOTTOM) > -1 ? BOTTOM : false;
				var resizeHorizontal = capturing.indexOf(RIGHT) > -1 ? RIGHT : capturing.indexOf(LEFT) > -1 ? LEFT : false;
				if (capturing) {
					var screenSize = DOM.screenSize();
					var currentWidth = this._getNewSize(WIDTH, x, y);
					var currentHeight = this._getNewSize(HEIGHT, x, y);
					if (!this.get("animate")) {
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
				this.set('capturing', false);
				var offset;
				if (this.get(PROXY)) {
					this.get(PROXY_NODE).css(VISIBILITY, "hidden");
					offset = proxy.offset();
				} else {
					offset = node.offset();
				}
				/**
				 * @event endResize
				 * @description Fires when the resize action ends
				 */
				this.fire("endResize", currentWidth, currentHeight, offset.left, offset.top);
			}
		},
		
		_onProxyChange: function (e, useProxy) {
			var proxy = this.get(PROXY_NODE);
			var node = this.get(NODE);
			if (proxy) {
				proxy.remove();
			}
			if (useProxy === true) {
				proxy = $('<div/>').addClass(this.getCLassName(PROXY)).css({
					left: originalStyle.left,
					top: originalStyle.top,
					bottom: originalStyle.bottom,
					right: originalStyle.right,
					width: originalStyle.width,
					height: originalStyle.height
				});
			} else if (useProxy == CLONE_PROXY) {
				proxy = node.clone().css({
					visibility: "hidden",
					opacity: 0.5
				});
			}
			proxy.appendTo(node.parent());
			this.set(PROXY_NODE, proxy);
		},
		
		initializer: function () {
			var self = this;
			var mouse = new $.Mouse({
				shim: this.get("shim")
			});
			var hoverClass = this.getClassName('hover');
			var handleClass = this.getClassName('handle');
			var proxy = this.get(PROXY);
			
			this.set(MOUSE, mouse);
			this._onProxyChange.call(this, null, proxy);
			this.on(PROXY + 'Change', bind(this._onProxyChange, this));
			
			proxy = this.get(PROXY_NODE);
			
			A.each(this.get("handles"), function (type) {
				var handle = $(NEW_DIV);
				handle.addClass(handleClass, this.getClassName('handle', type));
				handle.on("mousedown", function (e) {
					if (!self.get(LOCKED)) {
						var offset = proxy.offset();
						capturing = type;
						tracker.get("shields").css("cursor", handle.currentStyle().cursor);
						tracker.set("tracking", true);
						self._startResize(e.clientX, e.clientY, offset.left, offset.top, type);
						self.fire("startResize", currentWidth, currentHeight, offset.left, offset.top, type);
					}
				}).on("mouseover", function (e) {
					if (!self.get(LOCKED) && !capturing) {
						handle.addClass(this.getClassName('handle', 'active'), this.getClassName('handle', type, 'active'));
						if (self.get(HOVER)) {
							node.removeClass(hoverClass);
						}
					}
				}).on("mouseout", function (e) {
					if (!self.get(LOCKED)) {
						handle.removeClass(handleClass + handleClassActive).removeClass(handleClass + "-" + type + handleClassActive);
						if (self.get(HOVER)) {
							node.addClass(hoverClass);
						}
					}
				}).append($(NEW_DIV).addClass(this.getClassName('handle', 'inner', type))).appendTo(node);
			});
			node.addClass(this.getClassName()).css("display", "block");
			if (this.get("hiddenHandles")) {
				node.addClass(this.getClassName('hidden'));
			} else if (self.get(HOVER)) {
				node.addClass(hoverClass);
			}
			mouse.on('mouseup', bind(this._stopResize, this));
			mouse.on('mousemove', bind(this._duringReize, this));
		},
		/**
		 * @method stop
		 * @description Makes the resize action end prematurely
		 * @chainable
		 */
		stop: function () {
			this._stopResize.call(this);
			return this;
		},
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
	})

	$.mix($.Resize, {
		Top: TOP,
		Bottom: BOTTOM,
		Left: LEFT,
		Right: RIGHT,
		TopLeft: TOP + LEFT,
		TopRight: TOP * RIGHT,
		BottomLeft: BOTTOM + LEFT,
		BottomRight: BOTTOM + RIGHT
	});
});