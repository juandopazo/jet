/**
 * Animations
 * @module anim
 * @requires node, node-deferred;
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('anim', function ($) {

			
var Lang = $.Lang,
	Hash = $.Hash,
	Base = $.Base,
	A = $.Array;

var PLAYING = "playing",
	ENTER_FRAME = "enterFrame";
	
var pxToFloat = function (str) {
	return !Lang.isString(str) ? str :
		str.substr(-2, str.length) == "px" ? parseFloat(str.substr(0, str.length - 2)) : parseFloat(str);
};

var oneDBezier = function (points, t) {  
    var n = points.length;
    var tmp = [];

    for (var i = 0; i < n; ++i) {
        tmp[i] = points[i]; // save input
    }
    
    for (var j = 1; j < n; ++j) {
        for (i = 0; i < n - j; ++i) {
            tmp[i] = (1 - t) * tmp[i] + t * tmp[parseInt(i + 1, 10)];
        }
    }

    return tmp[0];

};

/**
 * Easing modes
 * @class Easing
 * @static
 */
var Easing = {
	/**
	 * @method linear
	 * @description Linear easing
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 */
	linear: function (x, y0, yf, dur) {
		return (yf - y0) * x / dur + y0;
	},
	/**
	 * @method easein
	 * @description An easing that's stronger at the beginning and softer at the end
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 * @param {Number} pw Easing strengh
	 */
	easein: function (x, y0, yf, dur, pw) {
		return yf - (yf - y0) * Math.pow((yf >= y0 ? -1 : 1) * (x / dur - 1), pw);
	},
	/**
	 * @method easeout
	 * @description An easing that's softer at the beginning and stronger at the end
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 * @param {Number} pw Easing strengh
	 */
	easeout: function (x, y0, yf, dur, pw) {
		return y0 + (yf - y0) * Math.pow(x / dur, pw);
	},
	/*bounce: function (x, y0, yf, dur, pw) {
		return oneDBezier([y0, yf + pw, yf], x / dur);
	},*/
	/**
	 * @method sling
	 * @description An easing that goes back before going forward
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 * @param {Number} pw Easing strengh
	 */
	sling: function (x, y0, yf, dur, pw) {
		return oneDBezier([y0, y0 + (yf < y0 ? 1 : -1) * pw, yf], x / dur);
	}
};
if (!jet.TimeFrame) {
	/**
	 * A timeframe for queueing animations
	 * @class TimeFrame
	 * @uses EventTarget
	 * @static
	 */
	var TimeFrame = (function () {
		var tweens = [];
		var interval;
		var frameLength;
		var time = 0;
		var playing = false;

		return {
			/**
			 * @property fps
			 * @description Refresh speed in frames per second.
			 * Can't be changed during playback
			 * @default 35
			 */
			fps: 50,
			/**
			 * @method play
			 * @description Starts the playback
			 * @chainable
			 */
			play: function () {
				var self = this;
				if (!playing) {
					if (interval) {
						clearInterval(interval);
					}
					var frameLength = Math.round(1000 / self.fps);
					interval = setInterval(function () {
						self.fire(ENTER_FRAME, { time: (new Date()).getTime() });
					}, frameLength);
					playing = true;
				}
				return self;
			},
			/**
			 * @method stop
			 * @description Stops the playback
			 * @chainable
			 */
			stop: function () {
				if (interval) {
					clearInterval(interval);
				}
				playing = false;
				return this;
			},
			/**
			 * @method addTween
			 * @description Adds a Tween to the queue
			 * @param {Tween} tween
			 * @chainable
			 */
			addTween: function (tween) {
				tweens[tweens.length] = tween;
				return this;
			},
			/**
			 * @method removeTween
			 * @description Removes a Tween from the queue
			 * @param {Tween} tween
			 * @chainable
			 */
			removeTween: function (tween) {
				A.remove(tween, tweens);
				return tweens.length === 0 ? this.stop() : this;
			}
		};
	}());
	jet.TimeFrame = $.mix(new $.EventTarget(), TimeFrame);
}
/**
 * A Tween is a variation of a property during a lapse of time that has a certain easing associated
 * @class Tween
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
var Tween = Base.create('tween', Base, [], {
	ATTRS: {
		/**
		 * @attribute node
		 * @description The node that will be animated
		 * @required
		 * @writeOnce
		 */
		node: {
			setter: $
		},
		/**
		 * @attribute from
		 * @description an object literal with properties that will be animated
		 * @type Object
		 */
		from: {
			attribute: false
		},
		/**
		 * @attribute to
		 * @description an object literal with the target properties for the animation
		 * @type Object
		 */
		to: {
			required: true
		},
		/**
		 * @attribute easing
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
		 * @attribute easingStrength
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
		 * @attribute duration
		 * @description The duration of the animation
		 * @default 1000
		 * @type {String | Number} Allowd strings: "fast", "slow", "normal". Numbers are milliseconds
		 */
		duration: {
			value: 1000,
			setter: function (value) {
				return value == 'fast' ? 500 :
					   value == 'slow' ? 4000 :
					   Lang.isNumber(value) ? value :
					   1000; 
			}
		},
		/**
		 * @attribute playing
		 * @description Whether the animation is playing or not
		 * @readOnly
		 * @type Boolean
		 */
		playing: {
			value: false,
			validator: Lang.isBoolean
		},
		/**
		 * @attribute startTime
		 * @description Start time is used to calculate the elapsed time of the animation
		 * @default 0
		 * @private
		 */
		startTime: {
			value: 0
		},
		/**
		 * Previous time is used for pausing. It keeps how much time had
		 * elapsed in the last run before the tween was _paused_.
		 * When stopped, "previous" is reset to 0.
		 * @attribute previousTime
		 * @private
		 */
		previousTime: {
			value: 0
		}
	}
	
}, {
	_enterFrame: function (e) {
		var time = e.time;
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
					if (self.fire('tween', { property: name, value: go })) {
						node.css(name, go);
					} else {
						elapsed = duration;
					}
				});
			} else {
				self.stop();
				setTimeout(function () {
					self.fire('end');
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
		var from = this.get('from') || {};
		var to = this.get('to');
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
					case 'left':
						from[name] = offset.left;
						break;
					case 'top':
						from[name] = offset.top;
						break;
					case 'width':
						from[name] = node.attr('offsetWidth');
						break;
					case 'height':
						from[name] = node.attr('offsetHeight');
						break;
					default:
						from[name] = Lang.isNumber(pxToFloat(startStyle[name])) ? pxToFloat(startStyle[name]) : 0;
				}
			} 
		});
		this.set('from', from);
		if (this.fire('start')) {
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
	},
	
	destructor: function () {
		this.stop();
	}
});$.mix($.NodeList.prototype, {
		/**
	 * @method animate
	 * @for NodeList
	 * @description Animates all members of the node list. <strong>Requires the Anim module</strong>
	 * @param {Hash} props
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	animate: function (props, duration, easing, callback) {
		return this.defer(function (promise) {
			var tw = this.tw = new $.Tween({
				node: this,
				to: props,
				duration: duration,
				easing: easing
			});
			tw.on('end', promise.resolve, promise);
			tw.play();
		}).then(callback);
	},
	/**
	 * @method fadeIn
	 * @for NodeList
	 * @description Causes all nodes to fade in. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	fadeIn: function (duration, easing, callback) {
		return this.animate({
			opacity: 1 
		}, duration, easing, callback);
	},
	/**
	 * @method fadeOut
	 * @for NodeList
	 * @description Causes all nodes to fade out. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	fadeOut: function (duration, easing, callback) {
		return this.animate({
			opacity: 0
		}, duration, easing, callback);
	},
	/**
	 * @method fadeToggle
	 * @for NodeList
	 * @description Causes all nodes to fade in or out. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	fadeToggle: function (duration, easing, callback) {
		var promises = [];
		this.forEach(function (node) {
			node = $(node);
			promises.push(this.defer(function (promise) {
				var resolve = $.bind(promise.resolve, promise);
				if (node.css('opacity') == 1) {
					node.fadeOut(duration, easing, resolve);
				} else {
					node.fadeIn(duration, easing, resolve);
				}
			}));
		});
		return this.when(promises).then(callback);
	},
	/**
	 * @method slideDown
	 * @for NodeList
	 * @description Causes all nodes to slide down, changing their height and setting their overflow
	 *  to hidden for the duration of the animation. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	slideDown: function (duration, easing, callback) {
		var self = this;
		var overflow = this.css('overflow');
		return this.css('overflow', 'hidden').animate({ height: this.oHeight }, duration, easing, function () {
			self.css('overflow', overflow);
			callback.call(self);
		});
	},
	/**
	 * @method slideUp
	 * @for NodeList
	 * @description Causes all nodes to slide up, changing their height and setting their overflow
	 *  to hidden for the duration of the animation. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	slideUp: function (duration, easing, callback) {
		var myself = this;
		var overflow = myself.css('overflow');
		return myself.css('overflow', 'hidden').animate({
			height: 0
		}, duration, easing, function () {
			myself.css('overflow', overflow);
			callback.call(myself);
		});
	},
	/**
	 * @method stop
	 * @for NodeList
	 * @description Makes the current animation for this nodelist stop. <strong>Requires the Anim module</strong>
	 * @chainable
	 */
	stop: function () {
		if (this.tw) {
			this.tw.stop();
		}
		return this.reject();
	}
});

$.add({
	Tween: Tween,
	Easing: Easing
});
			
});
