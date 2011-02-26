jet().add('widget-stack', function ($) {
	
	var Lang = $.Lang,
		A = $.Array,
		layers,
		
		ZINDEX = 'zIndex';
		
	if (!jet.layers) {
		jet.layers = [];
	}
	layers = jet.layers;
	
	function WidgetStack() {
		var zIndex = this.get(ZINDEX);
		if (zIndex === 0) {
			layers[zIndex = layers.length] = this;
			this.set(ZINDEX, zIndex);
		} else {
			layers.splice(zIndex, 0, this);
			this._refreshZIndex();
		}
	}
	$.WidgetStack = $.mix(WidgetStack, {
		
		ATTRS: {
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
				this.get('boundingBox').css(ZINDEX, newVal);
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
			for (var i = 0, length = layers.length; i < length; i++) {
				layers[i].set(ZINDEX, i);
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
		
	};
	
});