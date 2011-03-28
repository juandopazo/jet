
/**
 * A utility for tracking the mouse movement without crashing the browser rendering engine.
 * Also allows for moving the mouse over iframes and other pesky elements
 * @class Mouse
 * @constructor
 * @extends Utility
 * @param {Object} config Object literal specifying configuration properties
 */
var Mouse = function () {
	Mouse.superclass.constructor.apply(this, arguments);

	var clientX, clientY;
	var prevX, prevY;
	var interval;
	var capturing = false;
	var pageSize = $.DOM.pageSize();
	
	if (!Mouse.shim) {
		Mouse.shim = $('<iframe/>').attr({
			frameborder: '0',
			src: 'javascript:;'
		}).css({
			opacity: 0,
			position: 'absolute',
			top: '0px',
			left: '0px',
			width: pageSize.width,
			height: pageSize.height,
			border: 0,
			zIndex: 20000000
		}).appendTo(this.get('doc').body).hide();
	}
	var shim = Mouse.shim;
	
	var self = this.addAttrs({
		/**
		 * Frequency at which the tracker updates
		 * @attribute frequency
		 * @default 20 (ms)
		 * @type Number
		 */
		frequency: {
			value: 20
		},
		shields: {
			readOnly: true,
			getter: function () {
				return shim;
			}
		}
	});
	
	/**
	 * Tracking status. Set it to true to start tracking
	 * @attribute tracking
	 * @type Boolean
	 * @default false
	 */
	this.addAttr(TRACKING, {
		value: false,
		validator: Lang.isBoolean
		
	}).on(TRACKING + "Change", function (e, value) {
		if (value) {
			if (!capturing) {
				if (self.get('shim')) {
					shim.show();
				}
				interval = setInterval(function () {
					if (prevX != clientX || prevY != clientY) {
						self.fire(MOUSEMOVE, clientX, clientY);
						prevX = clientX;
						prevY = clientY;
					}
				}, self.get(FREQUENCY));
				capturing = true;
			}
		} else {
			shim.hide();
			clearInterval(interval);
			capturing = false;
		}
	});
	
	function onSelectStart(e) {
		if (capturing) {
			e.preventDefault();
		}
	}
	
	function onMouseMove(e) {
		clientX = e.clientX;
		clientY = e.clientY;
	}
	
	function onMouseUp() {
		/**
		 * Fires when the mouse button is released
		 * @event up
		 */
		self.set(TRACKING, false).fire("up", clientX, clientY);
	}
	
	
	/**
	 * Fires not when the mouse moves, but in an interval defined by the frequency attribute
	 * This way you can track the mouse position without breakin the browser's rendering engine
	 * because the native mousemove event fires too quickly
	 * @event move
	 */
	var shimDoc = shim._nodes[0].contentWindow.document; 
	$(shimDoc.body).css({
		margin: 0,
		padding: 0
	});
	shimDoc = $(shimDoc);
	shimDoc.on(MOUSEMOVE, onMouseMove);
	shimDoc.on(MOUSEUP, onMouseUp);
	
	var context = $(this.get('doc')); 
	context.on("selectstart", onSelectStart);
	context.on(MOUSEMOVE, onMouseMove);
	context.on(MOUSEUP, onMouseUp);
	self.on('contextChange', function (e, newVal, prevVal) {
		$(prevVal).unbind("selectstart", onSelectStart).unbind(MOUSEMOVE, onMouseMove).unbind(MOUSEUP, onMouseUp);
		$(newVal).on("selectstart", onSelectStart).on(MOUSEMOVE, onMouseMove).on(MOUSEUP, onMouseUp);
	});
	self.on(DESTROY, function () {
		shim.unbindAll();
	});
};
extend(Mouse, Utility, {
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
	
	var $_event = new EventTarget();
	var interval, timeout;
	var lastScrollLeft, lastScrollTop;
	var win = $.config.win;
	
	var scroll = function () {
		var scrollLeft = $.DOM.scrollLeft();
		var scrollTop = $.DOM.scrollTop();
		if (scrollLeft != lastScrollLeft || scrollTop != lastScrollTop) {
			$_event.fire('scroll', scrollLeft, scrollTop);
		} else {
			clearInterval(interval);
			interval = null;
		}
		lastScrollLeft = scrollLeft;
		lastScrollTop = scrollTop;
	}
	
	$($.config.win).on('scroll', function () {
		if (!interval) {
			interval = setInterval(scroll, 50);
		}
	});
	
	$.on = $.bind($_event.on, $_event);
	
	A.each(['load', 'unload'], function (name) {
		$(win).on(name, function () {
			$_event.fire(name);
		});
	});
	
	$(win).on('resize', function () {
		$_event.fire('resize');
	});
	
}());

$.add({
	Mouse: Mouse,
	Attribute: Attribute,
	Base: Base,
	Utility: Utility,
	Widget: Widget,
	EventTarget: EventTarget,
	extend: extend
});