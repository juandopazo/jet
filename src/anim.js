jet().add('anim', function ($) {
	
	var TRUE = true,
		FALSE = false;
	
	var PLAYING = "playing",
		ENTER_FRAME = "enterFrame";
		
	var TimeFrame = function () {
		TimeFrame.superclass.constructor.apply(this, arguments);
		
		var paused = FALSE;
		var playing = FALSE;
		var tweens = [];
		
		var myself = this.addAttrs({
			node: {
				writeOnce: TRUE,
				setter: function (value) {
					return $(value);
				},
				value: "<canvas/>"
			},
			paused: {
				readOnly: TRUE,
				getter: function () {
					return !!paused;
				}
			},
			playing: {
				readOnly: TRUE,
				getter: function () {
					return !!playing;
				}
			},
			tweens: {
				readOnly: TRUE,
				getter: function () {
					return $.clone(tweens);
				}
			},
			fps: {
				validator: function () {
					return !playing;
				},
				value: 50
			}
		});
		
		var interval;
		var time = 0;
		var frameLength = Math.round(1000 / myself.get("fps"));
		
		myself.play = function() {
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
		myself.stop = function () {
			paused = playing = FALSE;
			if (interval) {
				clearInterval(interval);
			}
			return myself;
		};
		myself.pause = function () {
			playing = FALSE;
			paused = TRUE;
			return myself;
		};
		
		myself.addTween = function (tween) {
			tweens[tweens.length] = tween;
			myself.on(ENTER_FRAME, tween.frame);
			tween.on("stop", myself.stop);
			return myself;
		};
		myself.removeTween = function (tween) {
			myself.unbind(ENTER_FRAME, tween.frame);
			ArrayHelper.remove(tween, tweens);
			return myself;
		};
	};
	$.extend(TimeFrame, $.Base);
	
	TimeFrame.easing = {
        DEFAULT: function (x, y0, yf, dur) {
            return (yf - y0) * x / dur + y0;
        },
        EASEIN: function (x, y0, yf, dur, pw) {
            return yf + y0 - yf * Math.pow((dur - x) / dur, pw) + y0;
        },
        EASEOUT: function (x, y0, yf, dur, pw) {
            return yf * Math.pow(x / dur, pw) + y0;
        }
    };
	
	var Tween = function () {
		Tween.superclass.constructor.apply(this, arguments);
		
		var playing = FALSE;
		var isPlaying = function () {
			return !!playing;
		};
		
		var myself = this.addAttrs({
			node: {
				required: TRUE,
				setter: function (value) {
					return $(value);
				}
			},
			from: {
				value: {},
				validator: isPlaying
			},
			to: {
				required: TRUE,
				validator: isPlaying
			},
			easing: {
				value: TimeFrame.easing.DEFAULT
			},
			easingStrength: {
				value: 2,
				setter: function (value) {
					return Math.abs(value);
				}
			},
			startFrame: {
				value: 0
			},
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
				})
			}
			return myself;
		};
		myself.stop = function () {
			playing = FALSE;
			return myself;
		};
		myself.pause = function () {
			return myself;
		};
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