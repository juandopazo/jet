
var Lang = $.Lang,
	Hash = $.Hash,
	DOM = $.DOM;

var TOP = 't',
	BOTTOM = 'b',
	LEFT = 'l',
	RIGHT = 'r';

var CLIENT = 'client',
	HEIGHT = 'height',
	WIDTH = 'width',
	VISIBILITY = 'visibility',
	CLONE_PROXY = 'clone',
	AUTO = 'auto',
	PX = 'px';

var NEW_DIV = '<div/>',
	LOCKED = 'locked',
	HOVER = 'hover';
	
var de = $.context.documentElement,
	db = $.context.body;
			
/**
 * Provides a utility for resizing elements
 * @class Resize
 * @extends Utility
 * @param {Object} config Object literal specifying configuration properties
 */
var Resize = $.Resize = $.Base.create('resize', $.Utility, [], {
	
	ATTRS: {
		/**
		 * @attribute node
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
		 * @description An array with the position of the needed handles. Posible values: 't', 'b', 'r', 'l', 'tr', 'tl', etc
		 * @type Array
		 * @default ['b', 'r', 'br']
		 */
		handles: {
			value: [BOTTOM, RIGHT, BOTTOM + RIGHT],
			validator: Lang.isArray
		},
		/**
		 * @attribute hiddenHandles
		 * @description If set to true, the handles are interactive but invisible
		 * @type Boolean
		 * @default false
		 */
		hiddenHandles: {
			value: false
		},
		prefix: {
			value: 'yui'
		},
		/**
		 * @attribute minWidth
		 * @description The minimum with the node can achieve
		 * @type Number
		 * @default 0
		 */
		minWidth: {
			value: 0
		},
		/**
		 * @attribute minHeight
		 * @description The minimum height the node can achieve
		 * @type Number
		 * @default 0
		 */
		minHeight: {
			value: 0
		},
		/**
		 * @attribute constrain
		 * @description If set to true, the node can't become bigger than the screen
		 * @type Boolean
		 * @default false
		 */
		constrain: {
			value: false
		},
		/**
		 * @attribute useProxy
		 * @description Whether to use a copy of the node while resizing or not.
		 * Possible values: false, true, 'clone'
		 * @type Boolean | String
		 * @writeOnce
		 * @default false
		 */
		useProxy: {
			value: false,
			writeOnce: true
		},
		/**
		 * @attribute animate
		 * @description Creates an animation when the resize handle is released. Can only be set to true
		 * if 'proxy' is set to true. <strong>Requires the Anim module.</strong>
		 * @type Boolean
		 * @default false
		 */
		animate: {
			value: false,
			validator: function () {
				return this.get('proxy');
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
		 * @attribute shim
		 * @description Uses invisible elements to be able to resize the node over iframes
		 * @type Boolean
		 * @default false 
		 */
		shim: {
			value: false
		},
		/**
		 * @attribute locked
		 * @description If the resize is locked the handles are not interactive
		 * @type Boolean
		 * @default false
		 */
		locked: {
			value: false
		},
		capturing: {
			value: false
		},
		screenSize: {
			value: DOM.screenSize()
		}
	},
	
	EVENTS: {
		destroy: function () {
			this._tracker.destroy();
		}
	}
}, {
	
	initializer: function () {
		var tracker = this._tracker = new $.Mouse({
			shim: this.get('shim')
		});
		this._setupProxy();
		this._setupHandlers();

		tracker.on('mouseup', this._stop, this);
		tracker.on('mousemove', this._during, this);
	},
	
	_setupProxy: function () {
		var node = this.get('node');
		var useProxy = this.get('useProxy');
		var proxy = useProxy == CLONE_PROXY ? node.clone() :
					useProxy ? $(NEW_DIV) : node;
					
		var originalStyle = node.currentStyle();
		if (useProxy) {
			if (useProxy === true) {
				var offset = node.offset();
				proxy.addClass('yui-resize-proxy').css({
					left: originalStyle.left,
					top: originalStyle.top,
					bottom: originalStyle.bottom,
					right: originalStyle.right,
					width: originalStyle.width,
					height: originalStyle.height
				});
			} else if (useProxy == CLONE_PROXY) {
				proxy.css({
					visibility: 'hidden',
					opacity: 0.5
				});
			}
			proxy.appendTo(node.parent());
		}
		this.set('proxy', proxy);
	},
	
	_onHandleMouseDown: function (e) {
		if (!this.get(LOCKED)) {
			var handle = $(e.target);
			if (handle.hasClass(this.get('prefix') + '-resize-handle-inner')) {
				handle = handle.parent();
			}
			var type = handle._nodes[0].type;
			var proxy = this.get('proxy');
			var offset = proxy.offset();
			var tracker = this._tracker;
			this.set('capturing', type);
			tracker.get('shields').css('cursor', handle.currentStyle().cursor);
			tracker.set('tracking', true);
			this._start(e.clientX, e.clientY, offset.left, offset.top, type);
			this.fire('resize:start', {
				width: this.get('currentWidth'),
				height: this.get('currentHeight'),
				left: offset.left,
				top: offset.top,
				direction: type
			});
		}
	},
	
	_onHandleMouseOver: function (e) {
		var handle = $(e.target);
		var resizeClass = this.get('prefix') + '-resize';
		var hoverClass = resizeClass + '-hover';
		var handleClass = resizeClass + '-handle';
		var handleClassActive = '-active';
		if (handle.hasClass(handleClass + '-inner')) {
			handle = handle.parent();
		}
		if (!this.get(LOCKED) && !this.get('capturing')) {
			handle.addClass([handleClass, handleClassActive, ' ', handleClass, '-', handle._nodes[0].type, handleClassActive].join(''));
			if (this.get(HOVER)) {
				this.get('node').removeClass(hoverClass);
			}
		}
	},
	
	_onHandleMouseOut: function (e) {
		var handle = $(e.target);
		var resizeClass = this.get('prefix') + '-resize';
		var hoverClass = resizeClass + '-hover';
		var handleClass = resizeClass + '-handle';
		var handleClassActive = '-active';
		if (handle.hasClass(handleClass + '-inner')) {
			handle = handle.parent();
		}
		if (!this.get(LOCKED)) {
			handle.removeClass(handleClass + handleClassActive).removeClass(handleClass + '-' + handle._nodes[0].type + handleClassActive);
			if (this.get(HOVER)) {
				this.get('node').addClass(hoverClass);
			}
		}
	},
	
	_setupHandlers: function () {
		var self = this;
		var node = this.get('node');
		var proxy = this.get('proxy');
		var tracker = this._tracker;
		var resizeClass = this.get('prefix') + '-resize';
		var hoverClass = resizeClass + '-hover';
		var handleClass = resizeClass + '-handle';
		var handleClassActive = '-active';
		$.Array.each(this.get('handles'), function (type) {
			var handle = $(NEW_DIV);
			handle.addClass([handleClass, ' ', handleClass, '-', type].join(''));
			handle._nodes[0].type = type;
			self._handlers.push(handle.on('mousedown', self._onHandleMouseDown, self), handle.on('mouseover', self._onHandleMouseOver, self), handle.on('mouseout', self._onHandleMouseOut, self));
			handle.append($(NEW_DIV).addClass(handleClass + '-inner', handleClass + '-inner-' + type)).appendTo(node);
		});
		node.addClass(resizeClass).css('display', 'block');
		if (this.get('hiddenHandles')) {
			node.addClass(resizeClass + '-hidden');
		} else if (this.get(HOVER)) {
			node.addClass(hoverClass);
		}
	},
	
	_getNew: function (type, x, y) {
		var vertical = (type == 'height');
		var resize = this.get(vertical ? 'resizeVertical' : 'resizeHorizontal');
		var original = this.get(vertical ? 'originalHeight' : 'originalWidth');
		var direction = vertical ? 'Y' : 'X';
		
		var size = resize == (vertical ? TOP : LEFT) ? original - (vertical ? y : x) + this.get('start' + direction) :
				   resize == (vertical ? BOTTOM : RIGHT) ? original + (vertical ? y : x) - this.get('start' + direction) :
				   original;
		
		var min = this.get('min' + type.substr(0, 1).toUpperCase() + type.substr(1));
		var max = this.get('max' + type.substr(0, 1).toUpperCase() + type.substr(1));
		var screenSize = this.get('screenSize');
		
		return size < min ? min : 
			   max && size > max ? max :
			   this.get('constrain') && size > screenSize[type] ? screenSize[type] : 
			   size;
	},
	
	_start: function (x, y, left, top) {
		var node = this.get('node');
		var capturing = this.get('capturing');
		var resizeVertical = capturing.indexOf(TOP) > -1 ? TOP :
						 capturing.indexOf(BOTTOM) > -1 ? BOTTOM :
						 false;
		var resizeHorizontal = capturing.indexOf(RIGHT) > -1 ? RIGHT :
							capturing.indexOf(LEFT) > -1 ? LEFT :
							false;
		this.set({
			resizeVertical: resizeVertical,
			resizeHorizontal: resizeHorizontal,
			startX: x,
			startY: y
		});
		
		var screenSize = DOM.screenSize();
		
		var originalWidth = node.width();
		var originalHeight = node.height();
		this.set({
			currentWidth: originalWidth,
			currentHeight: originalHeight,
			originalWidth: originalWidth,
			originalHeight: originalHeight,
			screenSize: screenSize
		});
		if (resizeHorizontal) {
			node.width(originalWidth);
		}
		if (resizeVertical) {
			node.height(originalHeight);
		}
		
		if (this.get('reposition')) {
			node.css({
				top:	resizeVertical == TOP ? AUTO : top + PX,
				bottom:	resizeVertical == BOTTOM ? AUTO : (screenSize.height - top - originalHeight) + PX,
				left:	resizeHorizontal == LEFT ? AUTO : left + PX,
				right:	resizeHorizontal == RIGHT ? AUTO : (screenSize.width - left - originalWidth) + PX
			});
		}
		
		if (this.get('useProxy')) {
			this.get('proxy').css(VISIBILITY, 'visible');
		}
	},
	
	_during: function (e) {
		var x = e.clientX,
			y = e.clientY;
		this.set({
			lastX: x,
			lastY: y
		});
		if (!this.get(LOCKED) && this.get('capturing')) {
			var proxy = this.get('proxy');
			var offset = proxy.offset();
			var currentWidth = this.get('currentWidth');
			var currentHeight = this.get('currentHeight');
			var resizeHorizontal = this.get('resizeHorizontal');
			var resizeVertical = this.get('resizeVertical');
			/**
			 * @event beforeResize
			 * @description Fires before the resize action starts. If prevented, the resize action doesn't start
			 * @param {Number} currentWith
			 * @param {Number} currentHeight
			 * @param {Number} offsetLeft
			 * @param {Number} offsetTop 
			 */
			if (this.fire('beforeResize', { width: currentWidth, height: currentHeight, left: offset.left, top: offset.top })) {
				var screenSize = DOM.screenSize();
				if (resizeVertical) {
					this.set('currentHeight', currentHeight = this._getNew(HEIGHT, x, y));
				}
				if (resizeHorizontal) {
					this.set('currentWidth', currentWidth = this._getNew(WIDTH, x, y));
				}
				/**
				 * @event resize
				 * @description Fires during the resize action
				 * @param {Number} currentWith
				 * @param {Number} currentHeight
				 * @param {Number} offsetLeft
				 * @param {Number} offsetTop 
				 */
				if (this.fire('resize', { width: currentWidth, height: currentHeight, left: offset.left, top: offset.top })) {
					if (resizeVertical && Lang.isNumber(currentHeight)) {
						proxy.height(currentHeight);
					}
					if (resizeHorizontal && Lang.isNumber(currentWidth)) {
						proxy.width(currentWidth);
					}
				}
			} else {
				this._stop({
					clientX: x,
					clientY: y
				});
			}
		}
	},
	
	_stop: function (e) {
		var x = e.clientX,
			y = e.clientY;
		if (!this.get(LOCKED)) {
			var node = this.get('node');
			var currentWidth = this._getNew(WIDTH, x, y);
			var currentHeight = this._getNew(HEIGHT, x, y);
			if (this.get('capturing')) {
				var screenSize = DOM.screenSize();
				var resizeVertical = this.get('resizeVertical');
				var resizeHorizontal = this.get('resizeHorizontal');
				if (!this.get('animate')) {
					if (resizeVertical) {
						node.height(currentHeight);
					}
					if (resizeHorizontal) {
						node.width(currentWidth);
					}
				} else if ($.Tween) {
					var to = {};
					if (resizeVertical) {
						to.height = currentHeight;
					}
					if (resizeHorizontal) {
						to.width = currentWidth;
					}
					(new $.Tween({
						node: node,
						to: to,
						duration: 'fast'
					})).start();
				}
			}
			this.set('capturing', false);
			var offset;
			var proxy = this.get('proxy');
			if (this.get('useProxy')) {
				proxy.css('visibility', 'hidden');
				offset = proxy.offset();
			} else {
				offset = node.offset();
			}
			/**
			 * @event endResize
			 * @description Fires when the resize action ends
			 */
			this.fire('resize:end', { width: currentWidth, height: currentHeight, left: offset.left, top: offset.top });
		}
	},
	
	/**
	 * @method stop
	 * @description Makes the resize action end prematurely
	 * @chainable
	 */
	stop: function () {
		this._stop(null, this.get('lastX'), this.get('lastY'));
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