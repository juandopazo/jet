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
		
	/**
	 * Creates a time frame for queueing animations
	 * @class TimeFrame
	 * @extends Base
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var TimeFrame = function () {
		TimeFrame.superclass.constructor.apply(this, arguments);
		
		var paused = FALSE;
		var playing = FALSE;
		var tweens = [];
		
		var myself = this.addAttrs({
			/**
			 * @config paused
			 * @description Whether the timeframe is paused or not
			 * @type Boolean
			 * @readOnly
			 */
			paused: {
				readOnly: TRUE,
				getter: function () {
					return !!paused;
				}
			},
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
					return $.clone(tweens);
				}
			},
			/**
			 * @config fps
			 * @description Refresh speed in frames per second
			 * @default 35
			 */
			fps: {
				validator: function () {
					return !playing;
				},
				value: 35
			}
		});
		
		var interval;
		var time = 0;
		var frameLength = Math.round(1000 / myself.get("fps"));
		
		/**
		 * @method play
		 * @description Starts the playback
		 * @chainable
		 */
		myself.play = function () {
			paused = FALSE;
			playing = TRUE;
			if (interval) {
				clearInterval(interval);
			}
			ArrayHelper.each(tweens, function (tween) {
				tween.play(0, frameLength);
			});
			time = 0;
			interval = setInterval(function () {
				time += frameLength;
				myself.fire(ENTER_FRAME, time);
			}, frameLength);
			return myself;
		};
		/**
		 * @method stop
		 * @description Stops the playback
		 * @chainable
		 */
		myself.stop = function () {
			paused = playing = FALSE;
			if (interval) {
				clearInterval(interval);
			}
			return myself;
		};
		/**
		 * @method pause
		 * @description Pauses the playback
		 * @chainable
		 */
		myself.pause = function () {
			playing = FALSE;
			paused = TRUE;
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
			myself.on(ENTER_FRAME, tween.frame);
			tween.on("stop", myself.stop);
			return myself;
		};
		/**
		 * @method removeTween
		 * @description Removes a Tween from the queue
		 * @param {Tween} tween
		 * @chainable
		 */
		myself.removeTween = function (tween) {
			myself.unbind(ENTER_FRAME, tween.frame);
			ArrayHelper.remove(tween, tweens);
			return myself;
		};
	};
	$.extend(TimeFrame, $.Base);
	
	/**
	 * Easing modes
	 * @class easing
	 * @static
	 * @namespace TimeFrame
	 */
	TimeFrame.easing = {
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
		
		var playing = FALSE;
		var isPlaying = function () {
			return !!playing;
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
				value: {},
				validator: isPlaying
			},
			/**
			 * @config to
			 * @description an object literal with the target properties for the animation
			 * @type Object
			 */
			to: {
				required: TRUE,
				validator: isPlaying
			},
			/**
			 * @config easing
			 * @description The easing used by the animation
			 * @type TimeFrame.easing
			 * @default TimeFrame.easing.DEFAULT
			 */
			easing: {
				value: TimeFrame.easing.DEFAULT
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
		var height = myself.get("height");
		if (height) {
			node.height(height);
		}
		var width = myself.get("width");
		if (width) {
			node.height(width);
		}
		var currentStyle = node.currentStyle();
		var time = 0;
		var from, to, dur;
		var timeFrame;
		
		/**
		 * Play the tween's animation
		 * @method play
		 * @param {Number} startTime
		 * @param {Number} frameLength
		 * @chainable
		 */
		myself.play = function (startTime, frameLength) {
			playing = TRUE;
			time = 0;
			from = myself.get("from");
            to = myself.get("to");
            dur = myself.get("duration");
			timeFrame = {};
            Hash.each(to, function (name, end) {
                from[name] = Lang.isNumber(from[name]) ? from[name] : $.pxToFloat(currentStyle[name]);
            });
			var strength = myself.get("easingStrength");
			var easing = myself.get("easing");
			for (var i = 0; i <= dur; i += frameLength) {
				timeFrame[i] = {};
				Hash.each(to, function (name, end) {
					timeFrame[i][name] = easing(i, from[name], end, dur, strength);
				});
			}
			return myself;
		};
		/**
		 * Stops the tween
		 * @method stop
		 * @chainable
		 */
		myself.stop = function () {
			playing = FALSE;
			return myself;
		};
		/**
		 * Pauses the tween
		 * @method pause
		 * @chainable
		 */
		myself.pause = function () {
			return myself;
		};
		/**
		 * Executes a frame. Used as a lister for the timeframe onenterframe event
		 * @method frame
		 * @param {EventFacade} event
		 * @param {Number} Time The curent time
		 * @chainable
		 */
		myself.frame = function (e, time) {
			if (time > dur) {
				playing = FALSE;
				myself.fire("stop");
			}
			if (playing) {
                node.css(timeFrame[time]);
			}
			return myself;
		};
	};
	$.extend(Tween, $.Base);
	
	$.add({
		TimeFrame: TimeFrame,
		Tween: Tween
	});
});