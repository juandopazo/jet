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
		ArrayHelper = $.Array;
	
	var PLAYING = "playing",
		ENTER_FRAME = "enterFrame";
		
	var pxToFloat = function(str){
		return !Lang.isString(str) ? str :
		    str.substr(-2, str.length) == "px" ? parseFloat(str.substr(0, str.length - 2)) : parseFloat(str);
	};
		
	/**
	 * Creates a time frame for queueing animations
	 * @class TimeFrame
	 * @extends Base
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var TimeFrame = function () {
		TimeFrame.superclass.constructor.apply(this, arguments);
		
		var playing = FALSE;
		var tweens = [];
		
		var myself = this.addAttrs({
			/**
			 * @config readOnly
			 * @description Whether the timeframe is readOnly or not
			 * @type Boolean
			 * @readOnly
			 */
			playing: {
				readOnly: TRUE,
				getter: function () {
					return !!playing;
				}
			},
			/**
			 * @config tweens
			 * @descriptinn a list of the tweens running in the timeframe
			 * @type Array
			 * @readOnly
			 */
			tweens: {
				readOnly: TRUE,
				getter: function () {
					return Lang.clone(tweens);
				}
			},
			/**
			 * @config fps
			 * @description Refresh speed in frames per second.
			 * Can't be changed during playback
			 * @default 35
			 */
			fps: {
				validator: function () {
					return !playing;
				},
				value: 50
			}
		});
		
		var interval;
		var frameLength = Math.round(1000 / myself.get("fps"));
		
		myself.on("fpsChange", function (val) {
			frameLength = Math.round(1000 / val);
		});
		
		/**
		 * @method play
		 * @description Starts the playback
		 * @chainable
		 */
		myself.play = function () {
			playing = TRUE;
			if (interval) {
				clearInterval(interval);
			}
			interval = setInterval(function () {
				myself.fire(ENTER_FRAME, (new Date()).getTime());
			}, frameLength);
			console.log(frameLength);
			return myself;
		};
		/**
		 * @method stop
		 * @description Stops the playback
		 * @chainable
		 */
		myself.stop = function () {
			playing = FALSE;
			if (interval) {
				clearInterval(interval);
			}
			return myself;
		};

		/**
		 * @method addTween
		 * @description Adds a Tween to the queue
		 * @param {Tween} tween
		 * @chainable
		 */
		myself.addTween = function (tween) {
			tweens[tweens.length] = tween;
			return !playing ? myself.play() : myself;
		};
		/**
		 * @method removeTween
		 * @description Removes a Tween from the queue
		 * @param {Tween} tween
		 * @chainable
		 */
		myself.removeTween = function (tween) {
			ArrayHelper.remove(tween, tweens);
			return tweens.length === 0 ? myself.stop() : myself;
		};
	};
	$.extend(TimeFrame, $.Base);
	
	if (!jet.timeframe) {
		jet.timeframe = new TimeFrame();
	}
	
	/**
	 * A Tween is a variation of a property during a laps of time that has a certain easing associated
	 * @class Tween
	 * @extends Base
	 * @constructor
	 * @namespace
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var Tween = function () {
		Tween.superclass.constructor.apply(this, arguments);
		
		var timeframe = jet.timeframe;
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
				value: Tween.easing.DEFAULT
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
		var previous = 0;
		var easing, duration, strength;
		
		var enterFrame = function (e, time) {
			if (playing) {
				var elapsed = time - startTime + previous;
				var check = 0;
				var against = Hash.keys(to.css).length + Hash.keys(to.attr).length;
				Hash.each(to.css, function (name, val) {
					var go = easing(elapsed, from.css[name], val, duration, strength);
					if (go >= val) {
						++check;
					}
					node.css(name, go);
				});
				Hash.each(to.attr, function (name, val) {
					var go = easing(elapsed, from.attr[name], val, duration, strength);
					if (go >= val) {
						++check;
					}
					node.attr(name, go);
				});
				if (check == against) {
					myself.stop();
				}
			}
		};
		timeframe.on(ENTER_FRAME, enterFrame);
		timeframe.on(ENTER_FRAME, function () {
			console.log(ENTER_FRAME);
		});		
		/**
		 * Play the tween's animation
		 * @method play
		 * @param {Number} startTime
		 * @param {Number} frameLength
		 * @chainable
		 */
		myself.play = function () {
			var startStyle = node.currentStyle();
			startTime = (new Date()).getTime();
			playing = TRUE;
			from = myself.get("from");
			to = myself.get("to");
			if (!from) {
				from = { css: {} };
			}
			Hash.each(to.css, function (name, val) {
				to.css[name] = pxToFloat(val);
				if (!from.css[name]) {
					var offset = node.offset();
					switch (name) {
						case "left":
							from.css[name] = offset.left;
							break;
						case "top":
							from.css[name] = offset.top;
							break;
						case "width":
							from.css[name] = offset.width;
							break;
						case "height":
							from.css[name] = offset.height;
							break;
						default:
							from.css[name] = pxToFloat(startStyle[name]);
					}
				} 
			});
			easing = myself.get("easing");
			duration = myself.get("duration");
			strength = myself.get("easingStrength");
			timeframe.addTween(myself);
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
			previous = 0;
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
	 * Easing modes
	 * @class easing
	 * @static
	 * @namespace Tween
	 */
	Tween.easing = {
		/**
		 * @method DEFAULT
		 * @description Linear easing
		 * @param {Number} x The time variable
		 * @param {Number} y0 The start value of the property that will be changed
		 * @param {Number} yf The final value of the property that will be changed
		 * @param {Number} dur Duration of the animation
		 */
        DEFAULT: function (x, y0, yf, dur) {
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
        EASEIN: function (x, y0, yf, dur, pw) {
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
        EASEOUT: function (x, y0, yf, dur, pw) {
            return yf * Math.pow(x / dur, pw) + y0;
        }
    };
	
	$.add({
		Tween: Tween
	});
});