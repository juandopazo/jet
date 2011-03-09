
/**
 * A Tween is a variation of a property during a lapse of time that has a certain easing associated
 * @class Tween
 * @extends Base
 * @constructor
 * @namespace
 * @param {Object} config Object literal specifying configuration properties
 */
var Tween = Base.create('tween', Base, [], {
	ATTRS: {
		/**
		 * @config node
		 * @description The node that will be animated
		 * @required
		 * @writeOnce
		 */
		node: {
			setter: $
		},
		/**
		 * @config from
		 * @description an object literal with properties that will be animated
		 * @type Object
		 */
		from: {
			value: false
		},
		/**
		 * @config to
		 * @description an object literal with the target properties for the animation
		 * @type Object
		 */
		to: {
			required: true
		},
		/**
		 * @config easing
		 * @description The easing used by the animation
		 * @type Function
		 * @default Easing.linear
		 */
		easing: {
			value: Easing.linear,
			setter: function (easing) {
				return Lang.isFunction(easing) ? easing : Easing[easing];
			}
		},
		/**
		 * @config easingStrength
		 * @description The strength of the easing if applicable. Must be >= 0
		 * @type Number
		 * @default 2
		 */
		easingStrength: {
			value: 2,
			validator: function (val) {
				return val >= 0;
			}
		},
		/**
		 * @config duration
		 * @description The duration of the animation
		 * @default 1000
		 * @type {String | Number} Allowd strings: "fast", "slow", "normal". Numbers are milliseconds
		 */
		duration: {
			value: 1000,
			setter: function (value) {
				return value == "fast" ? 500 :
					   value == "slow" ? 4000 :
					   Lang.isNumber(value) ? value :
					   1000; 
			}
		},
		playing: {
			value: false,
			validator: Lang.isBoolean
		},
		startTime: {
			value: 0
		},
		/**
		 * Previous time is used for pausing. It keeps how much time had
		 * elapsed in the last run before the tween was _paused_.
		 * When stopped, "previous" is reset to 0.
		 * @config previousTime
		 * @private
		 */
		previousTime: {
			value: 0
		}
	}
	
}, {
	_enterFrame: function (e, time) {
		if (this.get('playing')) {
			if (!this.get('startTime')) {
				this.set('startTime', time);
			}
			var self = this;
			var easing = this.get('easing');
			var to = this.get('to');
			var from = this.get('from');
			var duration = this.get('duration');
			var strength = this.get('easingStrength');
			var node = this.get('node');
			var elapsed = time - this.get('startTime') + this.get('previousTime');
			if (elapsed < duration) {
				Hash.each(to, function (name, val) {
					var go = easing(elapsed, from[name], val, duration, strength);
					if ((val > from[name] && go > val) || (val < from[name] && go < val)) {
						go = val;
					}
					if (self.fire("tween", go)) {
						node.css(name, go);
					} else {
						elapsed = duration;
					}
				});
			} else {
				self.stop();
				setTimeout(function () {
					self.fire("end");
				}, 0); 
			}
		}
	},
	/**
	 * Play the tween's animation
	 * @method play
	 * @param {Number} startTime
	 * @param {Number} frameLength
	 * @chainable
	 */
	play: function () {
		var node = this.get('node');
		var startStyle = node.currentStyle();
		var from = this.get("from") || {};
		var to = this.get("to");
		var offset;
		var timeframe = jet.TimeFrame;
		if (to.left || to.top) {
			offset = node.offset();
		}
		Hash.each(to, function (name, val) {
			to[name] = pxToFloat(val);
			if (!from[name]) {
				// Some properties shouldn't be get from the computed style because
				// they might have non numeric values such as "auto"
				// @TODO: handle "auto" for margin, padding, etc
				switch (name) {
					case "left":
						from[name] = offset.left;
						break;
					case "top":
						from[name] = offset.top;
						break;
					case "width":
						from[name] = node.attr('offsetWidth');
						break;
					case "height":
						from[name] = node.attr('offsetHeight');
						break;
					default:
						from[name] = Lang.isNumber(pxToFloat(startStyle[name])) ? pxToFloat(startStyle[name]) : 0;
				}
			} 
		});
		this.set('from', from);
		if (this.fire("start")) {
			this.set('playing', true);
			timeframe.on(ENTER_FRAME, this._enterFrame, this);
			timeframe.addTween(this).play();
		}
		return this;
	},
	/**
	 * Stops the tween
	 * @method stop
	 * @chainable
	 */
	stop: function () {
		this.set('playing', false);
		var timeframe = jet.TimeFrame;
		timeframe.removeTween(this);
		timeframe.unbind(ENTER_FRAME, this._enterFrame);
		this.set('previousTime', 0);
		return this.set('startTime', 0);
	},
	/**
	 * Pauses the tween
	 * @method pause
	 * @chainable
	 */
	pause: function () {
		this.set('playing', false)
		var timeframe = jet.TimeFrame;
		timeframe.removeTween(this);
		timeframe.unbind(ENTER_FRAME, this._enterFrame);
		return this.set('previousTime', (new Date()).getTime() - this.get('startTime'));
	},
	/**
	 * Reverses the tween
	 * @method reverse
	 * @chainable
	 */
	reverse: function () {
		var from = this.get('from');
		return this.set('from', this.get('to')).set('to', from);
	}
});