
$.SimpleMenu = $.Base.create('simplemenu', $.Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'MenuItem'
		},
		multiple: {
			value: false
		}
	}
}, {
	CONTENT_TEMPLATE: '<ul/>',
	_smPreventNoSelection: function(e) {
		var selection = this.get('selection');
		if (!e.newVal && (!selection || selection === e.target)) {
			e.preventDefault();
		}
	},
	initializer: function() {
		this.after('addChild', function(e) {
			e.child.on('selectedChange', this._smPreventNoSelection, this);
		});
	}
});
