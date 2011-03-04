
/**
 * A Tween is a variation of a property during a lapse of time that has a certain easing associated
 * @class Tween
 * @extends Base
 * @constructor
 * @namespace
 * @param {Object} config Object literal specifying configuration properties
 */
var Tween = function () {
	Tween.superclass.constructor.apply(this, arguments);
	
	var timeframe = jet.TimeFrame;
	var playing = false;
	var notPlaying = function () {
		return !playing;
	};
	
	var myself = this.addAttrs({
		/**
		 * @config node
		 * @description The node that will be animated
		 * @required
		 * @writeOnce
		 */
		node: {
			writeOnce: true,
			required: true,
			setter: function (value) {
				return $(value);
			}
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
			value: Easing.linear
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
		}
	});
	
	var node = myself.get("node");
	var from;
	var to;
	var startTime;
	/*
	 * Previous time is used for pausing. It keeps how much time had
	 * elapsed in the last run before the tween was _paused_.
	 * When stopped, "previous" is reset to 0.
	 */
	var previous = 0;
	var easing, duration, strength;
	
	var enterFrame = function (e, time) {
		if (playing) {
			if (!startTime) {
				startTime = time;
			}
			var elapsed = time - startTime + previous;
			var check = 0;
			var against = Hash.keys(to).length;
			Hash.each(to, function (name, val) {
				var go = easing(elapsed, from[name], val, duration, strength);
				if ((val > from[name] && go > val) || (val < from[name] && go < val)) {
					go = val;
				}
				if (myself.fire("tween", go)) {
					node.css(name, go);
				} else {
					elapsed = duration;
				}
			});
			if (elapsed >= duration) {
				myself.stop();
				setTimeout(function () {
					myself.fire("end");
				}, 0); 
			}
		}
	};
	
	/**
	 * Play the tween's animation
	 * @method play
	 * @param {Number} startTime
	 * @param {Number} frameLength
	 * @chainable
	 */
	myself.play = function () {
		var startStyle = node.currentStyle();
		playing = true;
		from = myself.get("from") || {};
		to = myself.get("to");
		var offset = node.offset();
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
					from[name] = offset.width;
					break;
				case "height":
					from[name] = offset.height;
					break;
				default:
					from[name] = Lang.isNumber(pxToFloat(startStyle[name])) ? pxToFloat(startStyle[name]) : 0;
				}
			} 
		});
		easing = myself.get("easing");
		easing = Lang.isFunction(easing) ? easing : Easing[easing];
		duration = myself.get("duration");
		strength = myself.get("easingStrength");
		if (myself.fire("start")) {
			timeframe.on(ENTER_FRAME, enterFrame);
			timeframe.addTween(myself).play();
		}
		return myself;
	};
	/**
	 * Stops the tween
	 * @method stop
	 * @chainable
	 */
	myself.stop = function () {
		playing = false;
		timeframe.removeTween(myself);
		timeframe.unbind(ENTER_FRAME, enterFrame);
		previous = startTime = 0;
		return myself;
	};
	/**
	 * Pauses the tween
	 * @method pause
	 * @chainable
	 */
	myself.pause = function () {
		playing = false;
		timeframe.removeTween(myself);
		timeframe.unbind(ENTER_FRAME, enterFrame);
		previous = (new Date()).getTime() - startTime;
		return myself;
	};
	/**
	 * Reverses the tween
	 * @method reverse
	 * @chainable
	 */
	myself.reverse = function () {
		return myself.set("from", to).set("to", from);
	};
};
$.extend(Tween, $.Base);