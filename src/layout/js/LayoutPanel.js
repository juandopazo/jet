
$.LayoutPanel = $.Base.create('layout-panel', $.Widget, [$.WidgetParent, $.WidgetChild], {
	
	Vertical: 'v',
	Horizontal: 'h',
	
	ATTRS: {
		direction: {
			value: 'h'
		},
		minSize: {
			value: 0,
			wriceOnce: true
		},
		shim: {
			value: false,
			writeOnce: true
		},
		defaultChildType: {
			value: 'LayoutPanel'
		}
	},
	
	EVENTS: {
		afterAddChild: '_setupChildResize',
		removeChild: '_destroyChildResize'
	}
}, {
	
	CONTENT_TEMPLATE: null,
	
	_setupChildResize: function (e, child, index) {
		if (index > 0) {
			var Resize = $.Resize;
			var minSize = this.get('minSize');
			child.resize = new Resize({
				node: child.get('boundingBox'),
				handles: [this.get('direction') == $.LayoutPanel.Horizontal ? Resize.Left : Resize.Top],
				minWidth: minSize,
				minHeight: minSize,
				shim: this.get('shim')
			});
			child.resize.on('start', this._onChildResizeStart, this);
			child.resize.on('resize', this._onChildResize, this);
		}
	},
	
	_destroyChildResize: function (e, child) {
		child.resize.destroy();
		child.resize = null;
	},
	
	_onChildResizeStart: function (e) {
		var previous = this.previous();
		previous._originalWidth = previous.width();
		previous._originalHeight = previous.height(); 
	},
	
	_onChildResize: function (e, currentWidth, currentHeight) {
		var childResize = e.target;
		var previous = this.previous();
		if (this.get('direction') == $.LayoutPanel.Horizontal) {
			previous.width(currentWidth - childResize.get('originalWidth') + previous._originalWidth);
		} else {
			previous.height(currentHeight - childResize.get('originalHeight') + previous._originalHeight);
		}
	}
});
