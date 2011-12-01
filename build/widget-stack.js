/**
 * Provides a WidgetStack extension for Widget that controls zIndex and provides support for overlaying on top of windowed elements
 * @module widget-stack
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('widget-stack', function ($) {
"use strict";

			
var Lang = $.Lang,
	A = $.Array,
	layers,
	
	ZINDEX = 'zIndex',
	RESIZE = 'resize',
	SHIM = 'shim',
	BOUNDING_BOX = 'boundingBox';
	
if (!jet.layers) {
	jet.layers = [];
}
layers = jet.layers;

/**
 * Provides stacking support via zIndex and shimming support with iframes
 * @class WidgetStack
 * @constructor
 */
function WidgetStack() {
	var zIndex = this.get(ZINDEX);
	if (zIndex === 0) {
		layers[zIndex = layers.length] = this;
		this.set(ZINDEX, zIndex);
	} else {
		layers.splice(zIndex, 0, this);
		this._refreshZIndex();
	}
	
	this._shim = $('<iframe/>').attr({
		src: 'javascript:' + ($.UA.ie ? 'false;' : ';'),
		frameborder: 0
	}).addClass(this.getClassName(SHIM)).css({
		zIndex: zIndex
	});
}
$.WidgetStack = $.mix(WidgetStack, {
	
	ATTRS: {
		/**
		 * @attribute shim
		 * @description Whether the widget should use shimming or not
		 * @type Boolean
		 * @default true If browser is IE 6. Otherwise, false by default
		 */
		shim: {
			value: ($.UA.ie == 6),
			validator: Lang.isBoolean
		},
		
		/**
		 * @attribute zIndex
		 * @description The current relative zIndex value of the widget
		 * @default 0
		 */
		zIndex: {
			value: 0,
			setter: function (val) {
				if (Lang.isString(val)) {
					val = parseInt(val, 10);
				}
				if (!Lang.isNumber(val)) {
					val = 0;
				}
				return val;
			}
		}
	},
	
	/**
	 * @static
	 * @property MIN_ZINDEX
	 * @description The min zIndex to apply to the widget. This value is added to the zIndex attribute
	 * @default 1
	 */
	MIN_ZINDEX: 1,
		
	EVENTS: {
		
		render: function () {
			this.get(BOUNDING_BOX).css(ZINDEX, WidgetStack.MIN_ZINDEX + this.get(ZINDEX));
		},
		
		afterRender: function () {
			if (this.get(SHIM)) {
				this._shim.insertBefore(this.get(BOUNDING_BOX));
				this.syncShim();
				$.on(RESIZE, this.syncShim, this);
			}
		},
		
		afterShimChange: function (e) {
			var shim = this._shim;
			if (e.newVal) {
				shim.insertBefore(this.get(BOUNDING_BOX));
				$.on(RESIZE, this.syncShim, this);
			} else {
				shim.remove();
				$.unbind(RESIZE, this.syncShim);
			}
		},
		
		afterZIndexChange: function (e) {
			this.get(BOUNDING_BOX).css(ZINDEX, e.newVal);
		},
		
		focus: function () {
			this.bringToFront();
		},
		
		blur: function () {
			this.sendToBack();
		},
		
		destroy: function () {
			//$.unbind(RESIZE, this.syncShim);
		}
		
	},
	
	HTML_PARSER: {
		zIndex: function (boundingBox) {
			return boundingBox.css(ZINDEX);
		}
	}
	
});
WidgetStack.prototype = {
	
	_refreshZIndex: function () {
		for (var i = 0, minZIndex = WidgetStack.MIN_ZINDEX, length = layers.length; i < length; i++) {
			layers[i].set(ZINDEX, minZIndex + i);
		}
		return this;
	},
	
	/**
	 * @method syncShim
	 * @description Syncs the position of the shimming iframe with the position of the boundingBox
	 * @chainable
	 */
	syncShim: function () {
		var position = this.get(BOUNDING_BOX).offset();
		this._shim.position(position.left, position.top).width(position.width).height(position.height);
		return this;
	},
	
	/**
	 * @method bringToFront
	 * @description Brings the widget to the front of the stack
	 * @chainable
	 */
	bringToFront: function () {
		A.remove(this, layers).push(this);
		return this._refreshZIndex();
	},
	
	/**
	 * @method sendToBack
	 * @description Sends the widget to the back of the stack
	 * @chainable
	 */
	sendToBack: function () {
		A.remove(this, layers).unshift(this);
		return this._refreshZIndex();
	}
	
};
			
});
