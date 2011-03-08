
var Resize = $.Resize;

function LayoutPanelBase() {}

LayoutPanelBase.Vertical = 'v';
LayoutPanelBase.Horizontal = 'h';

LayoutPanelBase.ATTRS = {
	direction: {
		value: LayoutPanelBase.Vertical
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
};

LayoutPanelBase.EVENTS = {
	afterRender: '_uiLayoutRender',
	afterAddChild: '_setupChildResize',
	removeChild: '_destroyChildResize'
};

LayoutPanelBase.prototype = {
	
	_uiLayoutRender: function () {
		var setWidth = 0;
		var freeWidth = 0;
		this.each(function (child) {
			setWidth += child.get('width') || 0;
		});
		freeWidth = (this.get('boundingBox').width() - setWidth) / this.get('children').length;
		this.each(function (child) {
			if (!child.get('width')) {
				child.set('width', freeWidth);
			}
		});
	},
	
	_setupChildResize: function (e, child, index) {
		
		if (index > 0) {
			
			var Resize = $.Resize;
			var minSize = this.get('minSize');
			
			child.resize = new Resize({
				node: child.get('boundingBox'),
				handles: [this.get('direction') == LayoutPanelBase.Horizontal ? Resize.Left : Resize.Top],
				minWidth: minSize,
				minHeight: minSize,
				shim: this.get('shim')
			});
			
			child.resize.on('resize:start', this._onChildResizeStart, child);
			child.resize.on('resize', this._onChildResize, child);
			
		}
			
		child.get('boundingBox').addClass(child.getClassName(this.get('direction')));
	},
	
	_destroyChildResize: function (e, child) {
		
		child.resize.destroy();
		child.resize = null;
		
	},
	
	_onChildResizeStart: function (e) {
		
		var previous = this.previous();
		var previousBoundingBox = previous.get('boundingBox');
		
		previous._originalWidth = previousBoundingBox.width();
		previous._originalHeight = previousBoundingBox.height(); 
		
	},
	
	_onChildResize: function (e, currentWidth, currentHeight) {
		var childResize = e.target;
		var previous = this.previous();
		var previousBoundingBox = previous.get('boundingBox');
		
		if (this.get('parent').get('direction') == LayoutPanelBase.Horizontal) {
			
			previousBoundingBox.width(childResize.get('originalWidth') - currentWidth + previous._originalWidth);
			
		} else {
			
			previousBoundingBox.height(childResize.get('originalHeight') - currentHeight + previous._originalHeight);
			
		}
	}
};


$.LayoutPanel = $.Base.create('layout-panel', $.Widget, [LayoutPanelBase, $.WidgetParent, $.WidgetChild], {}, {
	
	CONTENT_TEMPLATE: null
	
});
$.Layout = $.Base.create('layout', $.Widget, [LayoutPanelBase, $.WidgetParent], {}, {
	
	CONTENT_TEMPLATE: null
	
});
