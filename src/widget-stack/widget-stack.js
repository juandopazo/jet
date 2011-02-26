jet().add('widget-stack', function ($) {
	
	var Lang = $.Lang,
		A = $.Array,
		layers,
		
		ZINDEX = 'zIndex',
		BOUNDING_BOX;
		
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
		
		this._shim = $('<iframe/>').attr({
			src: 'javascript:false',
			frameborder: 0
		}).css({
			position: 'absolute',
			zIndex: zIndex
		});
	}
	$.WidgetStack = $.mix(WidgetStack, {
		
		ATTRS: {
			shim: {
				value: ($.UA.ie == 6),
				validator: Lang.isBoolean
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
			
			afterRender: function () {
				if (this.get('shim')) {
					this._shim.insertBefore(this.get(BOUNDING_BOX));
				}
			},
			
			afterShimChange: function (e, newVal) {
				var shim = this._shim;
				if (newVal) {
					shim.insertBefore(this.get(BOUNDING_BOX));
				} else {
					shim.remove();
				}
			},
			
			afterZIndexChange: function (e, newVal) {
				this.get(BOUNDING_BOX).css(ZINDEX, newVal);
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