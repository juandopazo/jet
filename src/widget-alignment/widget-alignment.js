jet().add('widget-alignment', function ($) {
	
	var UA_SUPPORTS_FIXED = $.UA.support.fixed;
	var DOM = $.DOM;
	var FIXED = 'fixed';
	
	var WidgetAlignment = function () {}
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
	})
	WidgetAlignment.prototype = {
		_repositionUI: function () {
			var align = this.get('align');
			var points = align.points || [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft];
			var target = align.node ? $(align.node) : null;
			var boundingBox = this.get('boundingBox');
			var targetOffset, boundingOffset = boundingBox.offset();
			var constrain = this.get('constrain');
			var screenSize = $.DOM.screenSize()
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
			
			targetOffset.left += boundingRelative.left;
			targetOffset.top += boundingRelative.top;
			
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
	$.mix(WidgetAlignment, {
		
		ATTRS: {
			
			fixed: {
				value: false
			},
			
			constrain: {
				value: false
			},
			
			align: {
				value: {
					points: [WidgetAlignment.TopLeft, WidgetAlignment.TopLeft]
				}
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
			afterRender: function () {
				this._repositionUI();
			},
			afterWidthChange: function () {
				this._repositionUI();
			},
			afterHeightChange: function () {
				this._repositionUI();
			}
		}
		
	});
	$.WidgetAlignment = WidgetAlignment;
	
});