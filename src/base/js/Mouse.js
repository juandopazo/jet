
/**
 * A utility for tracking the mouse movement without crashing the browser rendering engine.
 * Also allows for moving the mouse over iframes and other pesky elements
 * @class Mouse
 * @constructor
 * @extends Utility
 * @param {Object} config Object literal specifying configuration properties
 */
$.Mouse = $.Base.create('mouse', $.Utility, [], {
	
	ATTRS: {
		/**
		 * Frequency at which the tracker updates
		 * @attribute frequency
		 * @default 20 (ms)
		 * @type Number
		 */
		frequency: {
			value: 20
		},
		/**
		 * Tracking status. Set it to true to start tracking
		 * @attribute tracking
		 * @type Boolean
		 * @default false
		 */
		tracking: {
			value: false,
			validator: Lang.isBoolean
		},
		shields: {
			readOnly: true,
			getter: '_buildShim'
		},
		shim: {
			value: false,
			validator: Lang.isBoolean
		},
		prevX: {
			value: 0
		},
		prevY: {
			value: 0
		}
	}
	
}, {
	
	_buildShim: function () {
		if (!$.Mouse.shim) {
			var pageSize = this.get('pageSize');
			$.Mouse.shim = $('<iframe/>').attr({
				frameborder: '0',
				src: 'javascript:' + ($.UA.ie ? 'false;' : ';')
			}).css({
				opacity: 0,
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: pageSize.width,
				height: pageSize.height,
				border: 0,
				zIndex: 20000000
			}).appendTo($.config.doc.body).hide();
		}
		return $.Mouse.shim;
	},
	
	_onTrackingChange: function (e) {
		var self = this;
		var value = e.newVal;
		if (value) {
			if (!this._capturing) {
				if (this.get('shim')) {
					this.shim.show();
				}
				this.interval = setInterval(function () {
					var clientX = self.get('clientX');
					var clientY = self.get('clientY');
					if (self.get('prevX') != clientX || self.get('prevY') != clientY) {
						self.fire(MOUSEMOVE, {
							clientX: clientX,
							clientY: clientY
						});
						self.set({
							prevX: clientX,
							prevY: clientY
						});
					}
				}, this.get(FREQUENCY));
				this._capturing = true;
			}
		} else {
			this.shim.hide();
			clearInterval(this.interval);
			this._capturing = false;
		}
	},
	
	_onSelectStart: function (e) {
		if (this._capturing) {
			e.preventDefault();
		}
	},
	
	_onMouseMove: function (e) {
		if (this._capturing) {
			this.set({
				clientX: e.clientX,
				clientY: e.clientY
			});
		}
	},
	
	_onMouseUp: function () {
		/**
		 * Fires when the mouse button is released
		 * @event mouseup
		 */
		this.set(TRACKING, false).fire('mouseup', { clientX: this.get('clientX'), clientY: this.get('clientY') });
	},
	
	initializer: function () {
		this.set('pageSize', $.DOM.pageSize());
		
		var shim = this.shim = this._buildShim();
		
		this._capturing = false;
		
		this.after('trackingChange', this._onTrackingChange);
		
		/**
		 * Fires not when the mouse moves, but in an interval defined by the frequency attribute
		 * This way you can track the mouse position without breakin the browser's rendering engine
		 * because the native mousemove event fires too quickly
		 * @event move
		 */
		var shimDoc = $(shim.getDOMNode().contentWindow.document); 
		shimDoc.find('body').css({
			margin: 0,
			padding: 0
		});
		shimDoc.on(MOUSEMOVE, this._onMouseMove, this);
		shimDoc.on(MOUSEUP, this._onMouseUp, this);
		
		var context = $($.config.doc);
		context.on("selectstart", this._onSelectStart, this);
		context.on(MOUSEMOVE, this._onMouseMove, this);
		context.on(MOUSEUP, this._onMouseUp, this);

		this.on('destroy', function () {
			this.off();
		}, shim);
	},
	
	/**
	 * Start tracking. Equivalent to setting the tracking attribute to true.
	 * Simulates the mousedown event
	 * @method down
	 * @chainable
	 */
	down: function () {
		return this.set(TRACKING, true);
	},
	/**
	 * Stop tracking. Equivalent to setting the tracking attribute to false
	 * Simulates the mouseup event
	 * @method up
	 * @chainable
	 */
	up: function () {
		return this.set(TRACKING, false);
	}
});
(function () {
	
	var $_event = new $.EventTarget();
	var interval, timeout;
	var lastScrollLeft, lastScrollTop;
	var win = $.config.win;
	
	var scroll = function () {
		var scrollLeft = $.DOM.scrollLeft();
		var scrollTop = $.DOM.scrollTop();
		if (scrollLeft != lastScrollLeft || scrollTop != lastScrollTop) {
			$_event.fire('scroll', { scrollLeft: scrollLeft, scrollTop: scrollTop });
		} else {
			clearInterval(interval);
			interval = null;
		}
		lastScrollLeft = scrollLeft;
		lastScrollTop = scrollTop;
	};
	
	$($.config.win).on('scroll', function () {
		if (!interval) {
			interval = setInterval(scroll, 50);
		}
	});
	
	$Array.each(['on', 'once', 'fire', 'off'], function (eventMethod) {
		$[eventMethod] = $.bind($_event[eventMethod], $_event);
	});
	
	$Array.each(['load', 'unload'], function (name) {
		$(win).on(name, function () {
			$_event.fire(name);
		});
	});
	
	$(win).on('resize', function () {
		$_event.fire('resize');
	});
	
}());