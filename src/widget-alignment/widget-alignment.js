jet().add('widget-alignment', function ($) {
	
	var UA_SUPPORTS_FIXED = $.UA.support.fixed;
	var DOM = $.DOM;
	var FIXED = 'fixed';
	var PX = 'px';
	
	/**
	 * A widget extension that provides alignment support
	 * @class WidgetAlignment
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var WidgetAlignment = function () {};
	$.mix(WidgetAlignment, {
		Top: 't',
		Middle: 'm',
		Bottom: 'b',
		Left: 'l',
		Center: 'c',
		Right: 'r'		
	});
	$.mix(WidgetAlignment, {
		TopLeft: WidgetAlignment.Top + WidgetAlignment.Left,
		TopCenter: WidgetAlignment.Top + WidgetAlignment.Center,
		TopRight: WidgetAlignment.Top + WidgetAlignment.Right,
		
		MiddleLeft: WidgetAlignment.Middle + WidgetAlignment.Left,
		MiddleCenter: WidgetAlignment.Middle + WidgetAlignment.Center,
		MiddleRight: WidgetAlignment.Middle + WidgetAlignment.Right,
		
		BottomLeft: WidgetAlignment.Bottom + WidgetAlignment.Left,
		BottomCenter: WidgetAlignment.Bottom + WidgetAlignment.Center,
		BottomRight: WidgetAlignment.Bottom + WidgetAlignment.Right
	});
	WidgetAlignment.prototype = {
		
		_getPositionTop: function (boundingAlignVert, targetAlignVert, boundingHeight, targetHeight, targetTop, offsetTop, screenHeight, fixed, constrain) {
			var boundingRelative = 0;
			
			switch (boundingAlignVert) {
				case WidgetAlignment.Middle:
					boundingRelative -= boundingHeight / 2;
					break;
				case WidgetAlignment.Bottom:
					boundingRelative -= boundingHeight;
					break;
			}
			switch (targetAlignVert) {
				case WidgetAlignment.Middle:
					targetTop += targetHeight / 2;
					break;
				case WidgetAlignment.Bottom:
					targetTop += targetHeight;
					break;
			}
			if (fixed && !UA_SUPPORTS_FIXED) {
				targetTop += DOM.scrollTop();
			}
			
			targetTop += boundingRelative + offsetTop;
			
			if (constrain) {
				if (targetTop < 0) {
					targetTop = 0;
				} else if (targetTop > screenHeight - boundingHeight) {
					targetTop = screenHeight - boundingHeight;
				}
			}
			return targetTop + PX;
		},
		
		_getPositionLeft: function (boundingAlignHoriz, targetAlignHoriz, boundingWidth, targetWidth, targetLeft, offsetLeft, screenWidth, fixed, constrain) {
			var boundingRelative = 0;

			switch (boundingAlignHoriz) {
				case WidgetAlignment.Center:
					boundingRelative -= boundingWidth / 2;
					break;
				case WidgetAlignment.Right:
					boundingRelative -= boundingWidth;
					break;
			}
			switch (targetAlignHoriz) {
				case WidgetAlignment.Center:
					targetLeft += targetWidth / 2;
					break;
				case WidgetAlignment.Right:
					targetLeft += targetWidth;
					break;
			}
			if (fixed && !UA_SUPPORTS_FIXED) {
				targetLeft += DOM.scrollLeft();
			}
			targetLeft += boundingRelative + offsetLeft;
			
			if (constrain) {
				if (targetLeft < 0) {
					targetLeft = 0;
				} else if (targetLeft > screenWidth - boundingWidth) {
					targetLeft = screenWidth - boundingWidth;
				}
			}
			return targetLeft + PX;
		},
		
		_getPositionBottom: function (boundingAlignVert, boundingHeight, offsetTop, fixed, constrain) {
			var bottom = 0;
			switch (boundingAlignVert) {
				case WidgetAlignment.Top:
					bottom -= boundingHeight;
					break;
				case WidgetAlignment.Middle:
					bottom -= boundingHeight / 2;
					break;
			}
			bottom -= offsetTop;
			if (fixed && !UA_SUPPORTS_FIXED) {
				bottom -= DOM.scrollTop();
			}
			if (constrain) {
				bottom = Math.max(bottom, 0);
			}
			return bottom + PX;
		},
		
		_getPositionRight: function (boundingAlignHoriz, boundingWidth, offsetLeft, fixed, constrain) {
			var right = 0;
			switch (boundingAlignHoriz) {
				case WidgetAlignment.Left:
					right -= boundingWidth;
					break;
				case WidgetAlignment.Center:
					right -= boundingWidth / 2;
					break;
			}
			right -= offsetLeft;
			if (fixed && !UA_SUPPORTS_FIXED) {
				right -= DOM.scrollTop();
			}
			if (constrain) {
				right = Math.max(right, 0);
			}
			return right + PX;
		},
		
		_repositionUI: function () {
			var align = this.get('align');
			var points = align.points || [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft];
			var alignOffset = align.offset || [0, 0];
			
			var target = align.node ? $(align.node) : null;
			var boundingBox = this.get(this.get('alignedBox'));
			
			var targetOffset = target ? target.offset() : null;
			var boundingOffset = boundingBox.offset();
			
			var fixed = this.get(FIXED);
			var constrain = this.get('constrain');
			var screenSize = DOM.screenSize();
			
			var boundingAlign = points[0];
			var targetAlign = points[1];
			
			var boundingAlignVert = boundingAlign.substr(0, 1);
			var boundingAlignHoriz = boundingAlign.substr(1);
			var targetAlignVert = targetAlign.substr(0, 1);
			var targetAlignHoriz = targetAlign.substr(1);
			
			var getPositionLeft = this._getPositionLeft;
			var getPositionTop = this._getPositionTop;
			
			var resultingPosition = {};
			
			if (!target) {
				if (targetAlignVert == WidgetAlignment.Bottom) {
					resultingPosition.bottom = this._getPositionBottom();
				} else {
					resultingPosition.top = getPositionTop(boundingAlignVert, targetAlignVert, boundingOffset.height, screenSize.height, 0, alignOffset[1] || 0, screenSize.height, fixed, constrain);
				}
				if (targetAlignHoriz == WidgetAlignment.Right) {
					resultingPosition.right = this._getPositionRight();
				} else {
					resultingPosition.left = getPositionLeft(boundingAlignHoriz, targetAlignHoriz, boundingOffset.width, screenSize.width, 0, alignOffset[0] || 0, screenSize.width, fixed, constrain);
				}
			} else {
				resultingPosition = {
					left: getPositionLeft(boundingAlignHoriz, targetAlignHoriz, boundingOffset.width, targetOffset.width, targetOffset.left, alignOffset[0] || 0, screenSize.width, fixed, constrain),
					top: getPositionTop(boundingAlignVert, targetAlignVert, boundingOffset.height, targetOffset.height, targetOffset.top, alignOffset[1] || 0, screenSize.height, fixed, constrain)
				};
			}			
			boundingBox.css(resultingPosition);
		}
	};
	function doReposition() {
		this._repositionUI();
	}
	$.mix(WidgetAlignment, {
		
		ATTRS: {
			/**
			 * @config fixed
			 * @description Whether the widget should stay fixed to the viewport or no
			 * @default false
			 */
			fixed: {
				value: false
			},
			
			/**
			 * @config constrain
			 * @description If set to true, the widget will never bleed outside the viewport
			 * @default false
			 */
			constrain: {
				value: false
			},

			/**
			 * @config align
			 * @description Alignment configuration. An object containing three optional properties:
			 * - node: a selector or node instance of a node to use as a reference
			 * - points: an array of two values representing corners of nodes. The first one is this widget's corner to use. The second one is the target's corner
			 * - offset: an array of two values that move the widget relative to the calculated position
			 * @default { points: [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft], offset: [0, 0] }
			 */
			align: {
				value: {
					points: [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft],
					offset: [0, 0]
				}
			},
			
			alignedBox: {
				value: 'boundingBox',
				writeOnce: true
			}
			
		},
		
		EVENTS: {
			render: function () {
				var fixed = this.get(FIXED);
				var win = $(this.get('win'));
				this.get('boundingBox').css('position', fixed && UA_SUPPORTS_FIXED ? FIXED : 'absolute');
				this._handlers.push(win.on('resize', this._repositionUI, this));
				if (fixed && !UA_SUPPORTS_FIXED) {
					this._handlers.push(win.on('scroll', this._repositionUI, this));
				}
				this._repositionUI();
			},
			afterRender: doReposition,
			afterFixedChange: doReposition,
			afterConstrainChange: doReposition,
			afterAlignChange: doReposition,
			afterWidthChange: doReposition,
			afterHeightChange: doReposition
		}
		
	});
	$.WidgetAlignment = WidgetAlignment;
	
});