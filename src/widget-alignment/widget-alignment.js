jet().add('widget-alignment', function ($) {
	
	var UA_SUPPORTS_FIXED = $.UA.support.fixed;
	var DOM = $.DOM;
	var FIXED = 'fixed';
	
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
		_repositionUI: function () {
			var align = this.get('align');
			var points = align.points || [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft];
			var alignOffset = align.offset || [0, 0];
			var target = align.node ? $(align.node) : null;
			var boundingBox = this.get(this.get('alignedBox'));
			var targetOffset, boundingOffset = boundingBox.offset();
			var constrain = this.get('constrain');
			var screenSize = $.DOM.screenSize();
			var boundingAlign = points[0];
			var targetAlign = points[1];
			
			var boundingRelative = {
				left: 0,
				top: 0
			};
			
			if (!target) {
				targetOffset = {};
				$.mix(targetOffset, screenSize);
				targetOffset.left = 0;
				targetOffset.top = 0;
			} else {
				targetOffset = target.offset();
			}
			
			switch (boundingAlign.substr(0, 1)) {
				case WidgetAlignment.Middle:
					boundingRelative.top -= boundingOffset.height / 2;
					break;
				case WidgetAlignment.Bottom:
					boundingRelative.top -= boundingOffset.height;
					break;
			}
			switch (boundingAlign.substr(1)) {
				case WidgetAlignment.Center:
					boundingRelative.left -= boundingOffset.width / 2;
					break;
				case WidgetAlignment.Right:
					boundingRelative.left -= boundingOffset.width;
					break;
			}
			switch (targetAlign.substr(0, 1)) {
				case WidgetAlignment.Middle:
					targetOffset.top += targetOffset.height / 2;
					break;
				case WidgetAlignment.Bottom:
					targetOffset.top += targetOffset.height;
					break;
			}
			switch (targetAlign.substr(1)) {
				case WidgetAlignment.Center:
					targetOffset.left += targetOffset.width / 2;
					break;
				case WidgetAlignment.Right:
					targetOffset.left += targetOffset.width;
					break;
			}
			if (this.get(FIXED) && !UA_SUPPORTS_FIXED) {
				targetOffset.left += DOM.scrollLeft();
				targetOffset.top += DOM.scrollTop();
			}
			
			targetOffset.left += boundingRelative.left + alignOffset[0];
			targetOffset.top += boundingRelative.top + alignOffset[1];
			
			if (constrain) {
				if (targetOffset.left < 0) {
					targetOffset.left = 0;
				} else if (targetOffset.left > screenSize.width - boundingOffset.width) {
					targetOffset.left = screenSize.width - boundingOffset.width;
				}
				if (targetOffset.top < 0) {
					targetOffset.top = 0;
				} else if (targetOffset.top > screenSize.height - boundingOffset.height) {
					targetOffset.top = screenSize.height - boundingOffset.height;
				}
			}
			
			boundingBox.offset(targetOffset.left, targetOffset.top);
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