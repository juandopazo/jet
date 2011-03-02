jet.add('layout', function ($) {
	
	var Base = $.Base;
	
	$.LayoutPanel = Base.create('layout', $.Widget, [$.WidgetParent, $.WidgetChild], {
		
		ATTRS: {
			direction: {
				value: 'h'
			}
		},
		
		EVENTS: {
			afterAddChild: '_makeResizable'
		}
		
	}, {
		CONTENT_TEMPLATE: null,
		
		_makeResizable: function (e, child) {
			
		}
	});
	
});
