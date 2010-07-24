jet().add('anim', function ($) {
	
	var TRUE = true,
		FALSE = false;
		
	var Lang = $.Lang,
		Hash = $.Hash;
	
	var Anim = function () {
		Anim.superclass.constructor.apply(this, arguments);
		
		var running = FALSE, paused = FALSE;
		var interval;
		var time = 0;
		var iterationCount = 0;
				
		var myself = this.addAttrs({
			direction: {
				value: "normal",
				validator: function (value) {
					return value == "normal" || value == "alternate";
				}
			},
			node: {
				required: TRUE,
				setter: function (value) {
					return $(value);
				}
			},
			duration: {
				value: 1000,
				getter: function (value) {
					return value == "fast" ? 500 :
						   value == "slow" ? 4000 :
						   Lang.isNumber(value) ? value :
						   1000;
				}
			},
			interations: {
				value: 1
			},
			iterationCount: {
				readOnly: TRUE,
				getter: function () {
					return iterationCount;
				}
			},
			interval: {
				value: 20,
				readOnly: TRUE
			},
			from: {
				value: {},
				validator: Lang.isHash
			},
			to: {
				value: {},
				validator: Lang.isHash
			},
			easing: {
				value: Anim.easing.DEFAULT
			},
			running: {
				readOnly: TRUE,
				getter: function () {
					return !!running;
				}
			},
			paused: {
				readOnly: TRUE,
				getter: function () {
					return !!paused;
				}
			}
		});
		var node = myself.get("node");
		var currentStyle = $.clone(node.currentStyle());
		
		var frameLength = myself.get("interval");
		var doAnim = function () {
			var from = myself.get("from");
			var to = myself.get("to");
			var dur = myself.get("duration");
			var tweenStyles = {};
			Hash.each(to, function (name, end) {
				from[name] = Lang.isNumber(from[name]) ? from[name] : $.pxToFloat(currentStyle[name]);
				tweenStyles[name] = myself.get("easing")(time, from[name], end, dur);
			});
			myself.fire("tween", tweenStyles);
			node.css(tweenStyles);
			if (time >= dur) {
				iterationCount++;
				var iterations = myself.get("iterations");
				if (iterationCount < iterations || iterations < 0) {
					time = 0;
					if (myself.get("direction") == "alternate") {
						var oldFrom = $.clone(from);
						myself.set("from", myself.get("to")).set("to", oldFrom);
					}
				} else {
					myself.stop();
				}
			}
		};
		
		myself.start = function () {
			if (myself.fire("start")) {
				running = TRUE;
				paused = FALSE;
				time = 0;
				interval = setInterval(function () {
					time += frameLength;
					doAnim();
				}, frameLength);
				doAnim(time);
			}
			return myself;
		};
		myself.stop = function () {
			running = FALSE;
			paused = FALSE;
			time = 0;
			clearInterval(interval);
			myself.fire("stop");
			return myself;
		};
		myself.pause = function () {
			running = FALSE;
			paused = TRUE;
			clearInterval(interval);
			return myself;
		};
		myself.resume = function () {
			running = TRUE;
			paused = FALSE;
			interval = setInterval(function () {
				time += frameLength;
				doAnim(time);
			}, frameLength);
			return myself;
		};
	};
	$.extend(Anim, $.Utility);
	
	Anim.easing = {
		DEFAULT: function (x, y0, yf, dur) {
			return (yf - y0) * x / dur + y0;
		},
		EASEIN: function (x, y0, yf, dur) {
			return (y0 - yf) * (x * x - 2 * dur * x) / (dur * dur) + y0;
		},
		EASEOUT: function (x, y0, yf, dur) {
			y0 += yf;
			return y0 * (1 - x * x / (dur * dur));
		}
	};
	
	$.Anim = Anim;
	
	var storeDisplayOverflow = function (node) {
		var currentStyle = node.currentStyle();
		return {
			display: currentStyle.display,
			overflow: currentStyle.overflow
		};
	};
	var blockHidden = {
		display: "block",
		overflow: "hidden"
	};
	
	$.mix($.NodeList.prototype, {
		fadeIn: function (duration, callback) {
			var myself = this;
			var anim = new Anim({
				node: myself,
				duration: duration,
				from: {
					opacity: 0
				},
				to: {
					opacity: 1
				}
			});
			if (callback) {
				anim.on("stop", function () {
					callback.apply(myself, arguments);
				});
			}
			anim.start();
			return myself;
		},
		fadeOut: function (duration, callback) {
			var myself = this;
			var anim = new Anim({
				node: myself,
				duration: duration,
				to: {
					opacity: 0
				}
			});
			if (callback) {
				anim.on("stop", function () {
					callback.apply(myself, arguments);
				});
			}
			anim.start();
			return myself.hide();
		},
		slideDown: function (duration, callback) {
			var myself = this;
			var oStyle = storeDisplayOverflow(myself);
			myself.css(blockHidden);
			var anim = new Anim({
				node: myself,
				duration: duration,
				to: {
					height: myself.getNode().originalHeight
				}
			});
			if (callback) {
				anim.on("stop", function () {
					myself.css(oStyle);
					callback.apply(myself, arguments);
				});
			}
			anim.start();
			return myself;
		},
		slideUp: function (duration, callback) {
			var myself = this;
			var oStyle = storeDisplayOverflow(myself);
			myself.css(blockHidden);
			myself.getNode().originalHeight = myself.height();
			var anim = new Anim({
				node: myself,
				duration: duration,
				to: {
					height: 0
				}
			});
			if (callback) {
				anim.on("stop", function () {
					myself.css(oStyle);
					callback.apply(myself, arguments);
				});
			}
			anim.start();
			return myself;
		},
		animate: function (config, duration, callback) {
			var myself = this;
			var anim = new Anim({
				node: myself,
				duration: duration,
				to: config
			});
			if (callback) {
				anim.on("stop", function () {
					callback.apply(myself, arguments);
				});
			}
			anim.start();
			return myself;
		}
	});
	
});