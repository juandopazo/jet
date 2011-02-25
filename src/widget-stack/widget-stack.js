jet().add('widget-stack', function ($) {
	
	var Lang = $.Lang,
		A = $.Array,
		layers;
		
	var Z_INDEX = 'zIndex';
	
	if (!jet.WidgetStack) {
		jet.WidgetStack = {};
	}
	if (!jet.WidgetStack.layers) {
		layers = jet.WidgetStack.layers = [];
	}
		
	$.WidgetStack = $.mix(function WidgetStack() {
		var zIndex = this.get(Z_INDEX);
		if (zIndex == 0) {
			zIndex = layers.length;
		}
		layers.splice(zIndex, 0, this);
		this.set(Z_INDEX, zIndex);
		this._refreshZIndex();
	}, {
		
		ATTRS: {
			shim: {
				value: true
			},
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
		
		EVENTS: {
			afterZIndexChange: function (e, newVal) {
				this.get('boundingBox').css(Z_INDEX, newVal);
			}
		},
		
		HTML_PARSER: {
			zIndex: function (boundingBox) {
				return boundingBox.css(Z_INDEX);
			}
		}
		
	});
	WidgetStack.prototype = {
		
		_refreshZIndex: function () {
			var length = layers.length,
				i;
			for (i = 0; i < length; i++) {
				layers[i].set(Z_INDEX, i);
			}
			return this;
		},
		
		bringToFront: function () {
			A.remove(this, layers).push(this);
			return this._refreshZIndex();
		},
		
		sendToBack: function () {
			A.remove(this, layers).unshift(this);
			return this._refreshZIndex();
		}
		
	}
	
});