
	$.PageView = Base.create('pageview', $.Widget, [$.WidgetParent], {
		
		ATTRS: {
			navHolder: {
				required: true
			},
			defaultChildType: {
				value: 'Page'
			}
		}
	}, {
		
		initializer: function () {
			this.on('addChild', function (e) {
				e.child.navHolder = e.child.navHolder || this.get('navHolder');
			});
		}
		
	});