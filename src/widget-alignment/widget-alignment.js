jet().add('widget-alignment', function ($) {
	
	var UA_SUPPORTS_FIXED = $.UA.support.fixed;
	var DOM = $.DOM;
	
	var WidgetAlignment = function () {}
	WidgetAlignment.prototype = {
		_repositionUI: function () {
			var align = this.get('align');
			var points = align.points || ['tl', 'tl'];
			var target = align.node ? $(align.node) : null;
			var boundingBox = this.get('boundingBox');
			var targetOffset, boundingOffset = boundingBox.offset();
			var fixed = align.fixed;
			
			var boundingRelative = {
				left: 0,
				top: 0
			};
			if (!target) {
				targetOffset = $.DOM.screenSize();
				targetOffset.left = 0;
				targetOffset.top = 0;
			} else {
				targetOffset = target.offset();
			}
			switch (points[0].substr(0, 1)) {
				case 'm':
					boundingRelative.top -= boundingOffset.height / 2;
					break;
				case 'b':
					boundingRelative.top -= boundingOffset.height;
					break;
			}
			switch (points[0].substr(1)) {
				case 'c':
					boundingRelative.left -= boundingOffset.width / 2;
					break;
				case 'r':
					boundingRelative.left -= boundingOffset.width;
					break;
			}
			switch (points[1].substr(0, 1)) {
				case 'm':
					targetOffset.top += targetOffset.height / 2;
					break;
				case 'b':
					targetOffset.top += targetOffset.height;
					break;
			}
			switch (points[1].substr(1)) {
				case 'c':
					targetOffset.left += targetOffset.width / 2;
					break;
				case 'r':
					targetOffset.left += targetOffset.width;
					break;
			}
			if (this.get('fixed') && !UA_SUPPORTS_FIXED) {
				targetOffset.left += DOM.scrollLeft();
				targetOffset.top += DOM.scrollTop();
			}
			
			boundingBox.offset(targetOffset.left + boundingRelative.left, targetOffset.top + boundingRelative.top);
		}
	};
	$.mix(WidgetAlignment, {
		
		ATTRS: {
			
			align: {
				value: {
					points: ['tl', 'tl']
				}
			}
			
		},
		
		EVENTS: {
			render: function () {
				var fixed = this.get('fixed');
				var win = $(this.get('win'));
				this.get('boundingBox').css('position', fixed && UA_SUPPORTS_FIXED ? 'fixed' : 'absolute');
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
		},
		
		TopLeft: 'tl',
		TopCenter: 'tc',
		TopRight: 'tr',
		
		MiddleLeft: 'ml',
		MiddleCenter: 'mc',
		MiddleRight: 'mr',
		
		BottomLeft: 'bl',
		BottomCenter: 'bc',
		BottomRight: 'br'
		
	});
	$.WidgetAlignment = WidgetAlignment;
	
});