jet().add('widget-stack', function ($) {
	
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
		}).addClass(this.getClassName(SHIM)).css({
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
				if (this.get(SHIM)) {
					this._shim.insertBefore(this.get(BOUNDING_BOX));
					this.syncShim();
					$.on(RESIZE, this.syncShim, this);
				}
			},
			
			afterShimChange: function (e, newVal) {
				var shim = this._shim;
				if (newVal) {
					shim.insertBefore(this.get(BOUNDING_BOX));
					$.on(RESIZE, this.syncShim, this);
				} else {
					shim.remove();
					$.unbind(RESIZE, this.syncShim);
				}
			},
			
			afterZIndexChange: function (e, newVal) {
				this.get(BOUNDING_BOX).css(ZINDEX, newVal);
			},
			
			focus: function () {
				this.bringToFront();
			},
			
			blur: function () {
				this.sendToBack();
			},
			
			destroy: function () {
				$.unbind(RESIZE, this.syncShim);
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
		
		syncShim: function () {
			var position = this.get(BOUNDING_BOX).offset();
			this._shim.setPosition(position.left, position.top).width(position.width).height(position.height);
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