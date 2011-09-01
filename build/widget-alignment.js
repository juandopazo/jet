/**
 * A widget extension that provides alignment support
 * @module widget-alignment
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('widget-alignment', function ($) {

			
var UA_SUPPORTS_FIXED = $.UA.support.fixed,
	DOM = $.DOM,
	FIXED = 'fixed',
	PX = 'px',
	REPOSITION_UI = '_repositionUI',
	
	TOP = 't',
	MIDDLE = 'm',
	BOTTOM = 'b',
	LEFT = 'l',
	CENTER = 'c',
	RIGHT = 'r';

/**
 * A widget extension that provides alignment support
 * @class WidgetAlignment
 * @constructor
 */
function WidgetAlignment() {}
$.WidgetAlignment = $.mix(WidgetAlignment, {
	Top: TOP,
	Middle: MIDDLE,
	Bottom: BOTTOM,
	Left: LEFT,
	Center: CENTER,
	Right: RIGHT,
	
	TopLeft: TOP + LEFT,
	TopCenter: TOP + CENTER,
	TopRight: TOP + RIGHT,
	
	MiddleLeft: MIDDLE + LEFT,
	MiddleCenter: MIDDLE + CENTER,
	MiddleRight: MIDDLE + RIGHT,
	
	BottomLeft: BOTTOM + LEFT,
	BottomCenter: BOTTOM + CENTER,
	BottomRight: BOTTOM + RIGHT
});
WidgetAlignment.prototype = {
	
	_getPositionTop: function (boundingAlignVert, targetAlignVert, boundingHeight, targetHeight, targetTop, offsetTop, screenHeight, fixed, constrain) {
		var boundingRelative = 0;
		
		switch (boundingAlignVert) {
			case MIDDLE:
				boundingRelative -= boundingHeight / 2;
				break;
			case BOTTOM:
				boundingRelative -= boundingHeight;
				break;
		}
		switch (targetAlignVert) {
			case MIDDLE:
				targetTop += targetHeight / 2;
				break;
			case BOTTOM:
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
		return targetTop;
	},
	
	_getPositionLeft: function (boundingAlignHoriz, targetAlignHoriz, boundingWidth, targetWidth, targetLeft, offsetLeft, screenWidth, fixed, constrain) {
		var boundingRelative = 0;

		switch (boundingAlignHoriz) {
			case CENTER:
				boundingRelative -= boundingWidth / 2;
				break;
			case RIGHT:
				boundingRelative -= boundingWidth;
				break;
		}
		switch (targetAlignHoriz) {
			case CENTER:
				targetLeft += targetWidth / 2;
				break;
			case RIGHT:
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
		return targetLeft;
	},
	
	_getPositionBottom: function (boundingAlignVert, boundingHeight, offsetTop, fixed, constrain) {
		var bottom = 0;
		switch (boundingAlignVert) {
			case TOP:
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
		return bottom;
	},
	
	_getPositionRight: function (boundingAlignHoriz, boundingWidth, offsetLeft, fixed, constrain) {
		var right = 0;
		switch (boundingAlignHoriz) {
			case LEFT:
				right -= boundingWidth;
				break;
			case CENTER:
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
		return right;
	},
	
	_repositionUI: function () {
		var align = this.get('align'),
			points = align.points || [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft],
			alignOffset = align.offset || [0, 0],
			
			target = align.node ? $(align.node) : null,
			boundingBox = this.get('alignedNode'),
			
			targetOffset = target ? target.offset() : null,
			boundingOffset = boundingBox.offset(),
			
			fixed = this.get(FIXED),
			constrain = this.get('constrain'),
			screenSize = DOM.screenSize(),
			
			boundingAlign = points[0],
			targetAlign = points[1],
			
			boundingAlignVert = boundingAlign.substr(0, 1),
			boundingAlignHoriz = boundingAlign.substr(1),
			targetAlignVert = targetAlign.substr(0, 1),
			targetAlignHoriz = targetAlign.substr(1),
			
			getPositionLeft = $.bind(this._getPositionLeft, this),
			getPositionTop = $.bind(this._getPositionTop, this),
			
			resultingPosition = {};
		
		if (!target) {
			if (targetAlignVert == BOTTOM) {
				resultingPosition.bottom = this._getPositionBottom(boundingAlignVert, boundingOffset.height, alignOffset[1], fixed, constrain) + PX;
			} else {
				resultingPosition.top = getPositionTop(boundingAlignVert, targetAlignVert, boundingOffset.height, screenSize.height, 0, alignOffset[1] || 0, screenSize.height, fixed, constrain) + PX;
			}
			if (targetAlignHoriz == RIGHT) {
				resultingPosition.right = this._getPositionRight(boundingAlignHoriz, boundingOffset.width, alignOffset[0], fixed, constrain) + PX;
			} else {
				resultingPosition.left = getPositionLeft(boundingAlignHoriz, targetAlignHoriz, boundingOffset.width, screenSize.width, 0, alignOffset[0] || 0, screenSize.width, fixed, constrain) + PX;
			}
			boundingBox.css(resultingPosition);
		} else {
			resultingPosition = {
				left: getPositionLeft(boundingAlignHoriz, targetAlignHoriz, boundingOffset.width, targetOffset.width, targetOffset.left, alignOffset[0] || 0, screenSize.width, fixed, constrain),
				top: getPositionTop(boundingAlignVert, targetAlignVert, boundingOffset.height, targetOffset.height, targetOffset.top, alignOffset[1] || 0, screenSize.height, fixed, constrain)
			};
			boundingBox.position(resultingPosition.left, resultingPosition.top);
		}			
	}
};
$.mix(WidgetAlignment, {
	
	ATTRS: {
		/**
		 * @attribute fixed
		 * @description Whether the widget should stay fixed to the viewport or no
		 * @default false
		 */
		fixed: {
			value: false
		},
		
		/**
		 * @attribute constrain
		 * @description If set to true, the widget will never bleed outside the viewport
		 * @default false
		 */
		constrain: {
			value: false
		},

		/**
		 * @attribute align
		 * @description Alignment configuration. An object containing three optional properties:
		 * - node: a selector or node instance of a node to use as a reference
		 * - points: an array of two values representing corners of nodes. The first one is this widget's corner to use. The second one is the target's corner
		 * - offset: an array of two values that move the widget relative to the calculated position
		 * @default { points: [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft], offset: [0, 0] }
		 */
		align: {
			valueFn: function() {
				return {
					points: [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft],
					offset: [0, 0]
				};
			}
		},
		
		alignedNode: {
			value: 'boundingBox',
			getter: function(val) {
				return $.Lang.isString(val) ? this.get(val) : val;
			}
		}
		
	},
	
	EVENTS: {
		render: function () {
			var fixed = this.get(FIXED),
				win = $($.config.win);
				
			this.get('alignedNode').css('position', (fixed && UA_SUPPORTS_FIXED) ? FIXED : 'absolute');
			this._handlers.push(win.on('resize', this._repositionUI, this));
			
			if (fixed && !UA_SUPPORTS_FIXED) {
				this._handlers.push(win.on('scroll', this._repositionUI, this));
			}
			this._repositionUI();
		},
		afterRender: REPOSITION_UI,
		afterFixedChange: REPOSITION_UI,
		afterConstrainChange: REPOSITION_UI,
		afterAlignChange: REPOSITION_UI,
		afterWidthChange: REPOSITION_UI,
		afterHeightChange: REPOSITION_UI
	}
	
});
			
});
