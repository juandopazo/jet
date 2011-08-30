/**
 * Creates a resizable layout
 * @module layout
 * @requires base,resize,widget-parentchild
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('layout', function ($) {

			
var Resize = $.Resize;

/**
 * Base class used to create both the Layout and LayoutPanel classes.
 * Provides functionality to resize panels keeping the declared layout structure
 * @class LayoutPanelBase
 * @constructor
 */
function LayoutPanelBase() {
	this.after('widthChange', this._onSizeChange);
	this.after('heightChange', this._onSizeChange);
}

LayoutPanelBase.Vertical = 'v';
LayoutPanelBase.Horizontal = 'h';

$.mix(LayoutPanelBase, {
	
	ATTRS: {
		/**
		 * @config direction
		 * @description Direction in which this panel can be resized
		 * @default LayoutPanelBase.Vertical
		 * @writeOnce
		 */
		direction: {
			value: LayoutPanelBase.Vertical,
			writeOnce: true
		},
		/**
		 * @config minSize
		 * @description Minimum size the panel can acquire. Applies to width or height depending on the 'direction' attribute
		 * @default 0
		 * @writeOnce
		 */
		minSize: {
			value: 0,
			wriceOnce: true
		},
		/**
		 * @config shim
		 * @description Whether the resize utility should use a shim to protect the mouse movements
		 * @default false
		 * @writeOnce
		 */
		shim: {
			value: false,
			writeOnce: true
		},
		/**
		 * @config defaultChildType
		 * @description Default type to apply to children
		 * @default LayoutPanel
		 */
		defaultChildType: {
			value: 'LayoutPanel'
		}
	},
	
	EVENTS: {
		afterRender: '_uiLayoutRender',
		afterAddChild: '_setupChildResize',
		removeChild: '_destroyChildResize'
	},
	
	HTML_PARSER: {
		direction: function (boundingBox) {
			return boundingBox.hasClass(this.getClassName(LayoutPanelBase.Horizontal)) ? LayoutPanelBase.Horizontal : LayoutPanelBase.Vertical;
		}
	}
});

LayoutPanelBase.prototype = {
	
	_onSizeChange: function(e) {
		if (this.size() > 0 && $.Lang.isNumber(e.prevVal) && $.Lang.isNumber(e.newVal)) {
			var lastChild = this.last(),
				sizeType = this.get('direction') === LayoutPanelBase.Vertical ? 'height' : 'width',
				size = 0,
				child = this.first();
			while (child !== lastChild) {
				size += child.get(sizeType);
				child = child.next();
			}
			lastChild.set(sizeType, Math.floor(e.newVal - size));
		}
	},
		
	_uiLayoutRender: function () {
		var direction = this.get('direction');
		var boundingBox = this.get('boundingBox');
		var sizeType = direction == LayoutPanelBase.Horizontal ? 'width' : 'height';
		var setSize = 0;
		var freeSize = 0;
		var childrenNumber = this.get('children').length;
		if (childrenNumber > 0) {
			boundingBox.addClass(this.getClassName(direction));
		}
		this.each(function (child) {
			setSize += child.get(sizeType) || 0;
		});
		freeSize = (boundingBox[sizeType]() - setSize) / childrenNumber;
		this.each(function (child) {
			if (!child.get(sizeType)) {
				child.set(sizeType, freeSize);
			}
		});
	},
	
	_setupChildResize: function (e) {
		
		var Resize = $.Resize;
		var minSize = this.get('minSize');
		var direction = this.get('direction');
		var child = e.child;
			
		if (e.index > 0) {
			
			child.resize = new Resize({
				node: child.get('boundingBox'),
				handles: [direction == LayoutPanelBase.Horizontal ? Resize.Left : Resize.Top],
				minWidth: minSize,
				minHeight: minSize,
				shim: this.get('shim')
			});
			
			child.resize.on('resize:start', this._onChildResizeStart, child);
			child.resize.on('resize', this._onChildResize, child);
			
		}
			
		child.get('boundingBox').addClass(child.getClassName('child', direction));
	},
	
	_destroyChildResize: function (e) {
		
		e.child.resize.destroy();
		e.child.resize = null;
		
	},
	
	_onChildResizeStart: function (e) {
		
		var previous = this.previous();
		var previousBoundingBox = previous.get('boundingBox');
		
		previous._originalWidth = previousBoundingBox.width();
		previous._originalHeight = previousBoundingBox.height(); 
		
	},
	
	_onChildResize: function (e) {
		var childResize = e.target;
		var previous = this.previous();
		var previousBoundingBox = previous.get('boundingBox');
		
		if (this.get('parent').get('direction') == LayoutPanelBase.Horizontal) {
			
			previousBoundingBox.width(childResize.get('originalWidth') - e.width + previous._originalWidth);
			
		} else {
			
			previousBoundingBox.height(childResize.get('originalHeight') - e.height + previous._originalHeight);
			
		}
	}
};

$.LayoutPanelBase = LayoutPanelBase;
/**
 * A Layout Panel is a resizable block which size is constrained by the other blocks in the same container
 * @class LayoutPanel
 * @uses LayoutPanelBase
 * @uses WidgetParent
 * @uses WidgetChild
 * @extends Widget
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.LayoutPanel = $.Base.create('layout-panel', $.Widget, [$.LayoutPanelBase, $.WidgetParent, $.WidgetChild], {}, {
	
	CONTENT_TEMPLATE: null
	
});

/**
 * A Layout is a container of Layout Panels
 * @class Layout
 * @uses LayoutPanelBase
 * @uses WidgetParent
 * @extends Widget
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Layout = $.Base.create('layout', $.Widget, [$.LayoutPanelBase, $.WidgetParent], {}, {
	
	CONTENT_TEMPLATE: null
	
});

			
});
