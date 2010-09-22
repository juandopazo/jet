/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * A progressbar for informing the user of the status of loading resources.
 * Other uses include equalizers, ratings, etc
 * @module progressbar
 * @requires jet, lang, node, base
 */
jet().add('progressbar', function ($) {
	
	var CLASS_PREFIX = "jet-pbar-",
		BOUNDING_BOX = "boundingBox",
		WIDTH = "width",
		HEIGHT = "height",
		BAR = "bar",
		PROGRESS = "progress",
		END = "end";
		
	var A = $.Array;
	
	/**
	 * A progressbar for informing the user of the status of loading resources.
	 * Other uses include equalizers, ratings, etc
	 * @class ProgressBar 
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var ProgressBar = function () {
		ProgressBar.superclass.constructor.apply(this, arguments);
		
		var myself = this;
		var update = function (value) {
			var min = myself.get("minValue");
			var newSize = (value - min) / (myself.get("maxValue") - min);
			var bar = myself.get(BAR);
			var width = myself.get(WIDTH), height = myself.get(HEIGHT);
			var direction = myself.get("direction");
			var easing = myself.get("easing");
			var duration = myself.get("duration");
			if (myself.get("animate")) {
				var tween = new $.Tween({
					node: bar,
					duration: duration,
					easing: easing,
					on: {
						tween: function (e, value) {
							if (!myself.fire(PROGRESS, value)) {
								e.preventDefault();
							}
						},
						end: function () {
							myself.fire(END);
						}
					}
				});
				switch (direction) {
					case "ttb":
					case "btt":
						tween.set("to", {
							height: height * newSize
						});
						break;
					default:
						tween.set("to", {
							width: width * newSize
						});
				}
				tween.play();
			} else {
				switch (direction) {
					case "ttb":
					case "btt":
						newSize *= height;
						bar.height(newSize);
						break;
					default:
						newSize *= width;
						bar.width(newSize);
				}
				myself.fire(PROGRESS, newSize);
				myself.fire(END);
			}
		};
		
		this.addAttrs({
			/**
			 * @config minMvalue
			 * @description Minimum value that the progressbar data will take
			 * @default 0
			 */
			minValue: {
				value: 0
			},
			/**
			 * @config maxMvalue
			 * @description Maximum value that the progressbar data will take
			 * @default 100
			 */
			maxValue: {
				value: 100
			},
			/**
			 * @config value
			 * @description Current value the progressbar is taking
			 * @default 0
			 */
			value: {
				value: 0
			},
			/**
			 * @config width
			 * @description Width of the progressbar
			 * @default 200
			 */
			width: {
				value: 200
			},
			/**
			 * @config height
			 * @description Height of the progressbar
			 * @default 20
			 */
			height: {
				value: 20
			},
			/**
			 * @config direction
			 * @description Direction in which the progressbar increases its size. May be "ltr", "ttb" or "btt"
			 * @default "ltr"
			 */
			direction: {
				value: "ltr"
			},
			/**
			 * @config animate
			 * @description Whether to animate the progressbar progress. The Anim module must be present
			 * @default false
			 */
			animate: {
				value: false,
				validator: function () {
					return !!$.Tween;
				}
			},
			/**
			 * @config easing
			 * @description Easing to use when animating
			 * @default linear
			 */
			easing: {
			},
			/**
			 * @config duration
			 * @description Duration of the animation in case it is being used
			 * @default 500 ms
			 */
			duration: {
				value: 500
			},
			/**
			 * @config bar
			 * @description The DOM element that represents the bar in the progressbar
			 * @readOnly
			 */
			bar: {
				readOnly: true,
				value: $("<span/>")
			}
		}).on("valueChange", function (e, newVal, oldVal) {
			if (myself.fire(PROGRESS, newVal)) {
				update(newVal);
			} else {
				e.preventDefault();
			}
			
		}).on("directionChange", function (e, newVal, oldVal) {
			myself.get(BOUNDING_BOX).removeClass(CLASS_PREFOX + oldVal).addClass(CLASS_PREFIX + newVal);
			
		}).on("render", function () {
			
			var boundingBox = this.get(BOUNDING_BOX).addClass(CLASS_PREFIX + "container").width(this.get("width")).height(this.get("height"));
			var bar = this.get(BAR).appendTo(boundingBox).addClass(CLASS_PREFIX + BAR);
			if (this.get("direction") == "ltr") {
				bar.height(this.get(HEIGHT));
			} else {
				bar.width(this.get(WIDTH));
			}
			
		});
		A.each([WIDTH, HEIGHT], function (attr) {
			myself.on(attr + "Change", function (e, newVal, oldVal) {
				myself.get(BOUNDING_BOX)[attr](newVal);
			});
		});
	};
	$.extend(ProgressBar, $.Widget);
	
	$.ProgressBar = ProgressBar;
	
});