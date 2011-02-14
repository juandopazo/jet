jet().add('widget-alignment', function ($) {
	
	var WidgetAlignment = function () {}
	WidgetAlignment.prototype = {
		_repositionUI: function () {
			var align = this.get('align');
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
			}
			switch (align[0].substr(0, 1)) {
				case 'm':
					boundingRelative.top -= boundingOffset.height / 2;
					break;
				case 'b':
					boundingRelative.top -= boundingOffset.height;
					break;
			}
			switch (align[0].substr(1)) {
				case 'c':
					boundingRelative.left -= boundingOffset.width / 2;
					break;
				case 'r':
					boundingRelative.left -= boundingOffset.width;
					break;
			}
			switch (align[1].substr(0, 1)) {
				case 'm':
					targetOffset.top += targetOffset.height / 2;
					break;
				case 'b':
					targetOffset.top += targetOffset.height;
					break;
			}
			switch (align[0].substr(1)) {
				case 'c':
					targetOffset.left += targetOffset.width / 2;
					break;
				case 'r':
					targetOffset.left += targetOffset.width;
					break;
			}
			
			boundingBox.css({
				left: (targetOffset.left - boundingRelative.left) + 'px',
				top: (targetOffset.top - boundingRelative.top) + 'px'
			});
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
				this._handlers.push(this.get('win').on('resize', this._repositionUI, this));
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