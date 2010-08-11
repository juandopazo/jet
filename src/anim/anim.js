/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License:
 http://code.google.com/p/jet-js/wiki/License
*/
/**
 * Animations
 * @module anim
 * @namespace
 */
jet().add('anim', function ($) {
	
	var TRUE = true,
		FALSE = false;
		
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;
	
	var PLAYING = "playing",
		ENTER_FRAME = "enterFrame";
		
	var pxToFloat = function(str){
		return !Lang.isString(str) ? str :
			str.substr(-2, str.length) == "px" ? parseFloat(str.substr(0, str.length - 2)) : parseFloat(str);
	};
	
	/**
	 * Easing modes
	 * @class Easing
	 * @static
	 */
	var Easing = {
		/**
		 * @method DEFAULT
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
		 * @method EASEIN
		 * @description An easing that's stronger at the beginning and softer at the end
		 * @param {Number} x The time variable
		 * @param {Number} y0 The start value of the property that will be changed
		 * @param {Number} yf The final value of the property that will be changed
		 * @param {Number} dur Duration of the animation
		 * @param {Number} pw Easing strengh
		 */
		easein: function (x, y0, yf, dur, pw) {
			return yf + y0 - yf * Math.pow((dur - x) / dur, pw) + y0;
		},
		/**
		 * @method EASEOUT
		 * @description An easing that's softer at the beginning and stronger at the end
		 * @param {Number} x The time variable
		 * @param {Number} y0 The start value of the property that will be changed
		 * @param {Number} yf The final value of the property that will be changed
		 * @param {Number} dur Duration of the animation
		 * @param {Number} pw Easing strengh
		 */
		easeout: function (x, y0, yf, dur, pw) {
			return yf * Math.pow(x / dur, pw) + y0;
		}
	};
	
	if (!jet.TimeFrame) {
		/**
		 * A time frame for queueing animations
		 * @class TimeFrame
		 * @uses EventTarget
		 * @static
		 */
		jet.TimeFrame = (function () {
			var tweens = [];
			var interval;
			var frameLength;
			var time = 0;
	
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
					var myself = this;
					if (interval) {
						clearInterval(interval);
					}
					var frameLength = Math.round(1000 / myself.fps);
					interval = setInterval(function () {
						time += frameLength;
						myself.fire(ENTER_FRAME, time);
					}, frameLength);
					return myself;
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
		$.mix(jet.TimeFrame, new $.EventTarget());
	}
	
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
		var playing = FALSE;
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
				writeOnce: TRUE,
				required: TRUE,
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
				value: FALSE,
				validator: notPlaying
			},
			/**
			 * @config to
			 * @description an object literal with the target properties for the animation
			 * @type Object
			 */
			to: {
				required: TRUE,
				validator: notPlaying
			},
			/**
			 * @config easing
			 * @description The easing used by the animation
			 * @type TimeFrame.easing
			 * @default TimeFrame.easing.DEFAULT
			 */
			easing: {
				value: Easing.linear
			},
			/**
			 * @config easingStrength
			 * @description The strength of the easing if applicable
			 * @default 2
			 */
			easingStrength: {
				value: 2,
				setter: function (value) {
					return Math.abs(value);
				}
			},
			/**
			 * @config startFrame
			 * @description Where in the TimeFrame to start the tween
			 * @type Number
			 * @default 0 Start inmediately
			 */
			startFrame: {
				value: 0
			},
			/**
			 * @config duration
			 * @description The duration of the animation
			 * @default 1000
			 * @type {String, Number} Allowd strings: "fast", "slow", "normal". Numbers are milliseconds
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
					/*
					 * The animation is considered finished not when the time span has finished
					 * but when all properties get to where they have to go
					 * Time is not guaranteed. This makes less "perfect" animations, but ensures
					 * things end up where they are supposed to.
					 */
					if ((val >= from[name] && go >= val) || (val <= from[name] && go <= val)) {
						++check;
					}
					node.css(name, go);
				});
				if (check == against) {
					myself.stop();
					// @TODO: investigate if this should be wrapped in a setTimeout or something similar
					// to allow chaining of animations without hanging the browser 
					myself.fire("finish");
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
			playing = TRUE;
			from = myself.get("from");
			to = myself.get("to");
			if (!from) {
				from = { css: {} };
			}
			Hash.each(to, function (name, val) {
				to[name] = pxToFloat(val);
				if (!from[name]) {
					var offset = node.offset();
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
						from[name] = pxToFloat(startStyle[name]);
					}
				} 
			});
			easing = myself.get("easing");
			easing = Lang.isFunction(easing) ? easing : Easing[easing];
			duration = myself.get("duration");
			strength = myself.get("easingStrength");
			timeframe.on(ENTER_FRAME, enterFrame);
			timeframe.addTween(myself).play();
			return myself;
		};
		/**
		 * Stops the tween
		 * @method stop
		 * @chainable
		 */
		myself.stop = function () {
			playing = FALSE;
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
			playing = FALSE;
			timeframe.removeTween(myself);
			timeframe.unbind(ENTER_FRAME, enterFrame);
			previous = (new Date()).getTime() - startTime;
			return myself;
		};
	};
	$.extend(Tween, $.Base);
	
	/**
	 * Methods added to NodeList
	 * @class NodeListAnim
	 * @static
	 */
	$.augment($.NodeList, {
		/**
		 * @method animate
		 * @description animates all members of the node list
		 * @param {Hash} props
		 * @param {Number | String} duration
		 * @param {Function} easing
		 * @param {Function} callback
		 */
		animate: function (props, duration, easing, callback) {
			var tw = new Tween({
				node: this,
				to: props,
				duration: duration,
				easing: easing
			});
			this.tw = tw.on("finish", callback).play();
			return this;
		},
		fadeIn: function (duration, callback) {
			return this.animate({
				opacity: 1 
			}, duration, null, callback);
		},
		fadeOut: function (duration, callback) {
			return this.animate({
				opacity: 0
			}, duration, null, callback);
		},
		fadeToggle: function (duration, callback) {
			return this.each(function (node) {
				node = $(node);
				if (node.css("opacity") == 1) {
					node.fadeOut(duration, callback);
				} else {
					node.fadeIn(duration, callback);
				}
			});
		},
		slideDown: function (duration, callback) {
			var myself = this;
			var overflow = myself.css("overflow");
			return myself.css("overflow", "hidden").animate({
				height: myself.oHeight
			}, duration, null, function () {
				myself.css("overflow", overflow);
				callback.call(myself);
			});
		},
		slideUp: function (duration, callback) {
			var myself = this;
			var overflow = myself.css("overflow");
			return myself.css("overflow", "hidden").animate({
				height: 0
			}, duration, null, function () {
				myself.css("overflow", overflow);
				callback.call(myself);
			});
		},
		stop: function () {
			if (this.tw) {
				this.tw.stop();
			}
			return this;
		}
	});
	
	$.add({
		Tween: Tween,
		Easing: Easing
	});
});