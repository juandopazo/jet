
$.MenuBar = $.Base.create('menubar', $.Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'MenuItem'
		}
	}
}, {
	CONTENT_TEMPLATE: '<ul/>',
	renderUI: function() {
		if (this.size() > 0) {
			this.item(0).unselect();
		}
	},
	bindUI: function(boundingBox) {
		this._handlers.push(
			$($.config.doc).on('click', function(e) {
				var selection = this.get('selection');
				if (selection && !boundingBox.contains(e.target)) {
					selection.unselect();
				}
			}, this)
		);
	}
});