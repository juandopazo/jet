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
	
	var CONTENT_BOX = 'contentBox',
		BOUNDING_BOX = 'boundingBox',
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
	$.ProgressBar = $.Widget.create('progressbar', Widget, [], {
		
		ATTRS: {
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
			width: {
				value: 200
			},
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
		},
		
		EVENTS: {
			valueChange: function (e, newVal, oldVal) {
				if (this.fire(PROGRESS, newVal)) {
					this._update(newVal);
				} else {
					e.preventDefault();
				}
				
			},
			
			directionChange: function (e, newVal, oldVal) {
				this.get(BOUNDING_BOX).removeClass(this.getClassName(oldVal)).addClass(this.getClassName(newVal));
			},
			
			render: function () {
				var direction = this.get('direction');
				var bar = this.get(BAR).appendTo(this.get(CONTENT_BOX)).addClass(this.getClassName(BAR));
				this.get(BOUNDING_BOX).addClass(this.getClassName(direction));
				if (direction == "ltr") {
					bar.height(this.get(HEIGHT));
				} else {
					bar.width(this.get(WIDTH));
				}
				
			}
		}
		
	}, {
		_update: function (value) {
			var self = this;
			var min = this.get("minValue");
			var newSize = (value - min) / (this.get("maxValue") - min);
			var bar = this.get(BAR);
			var width = this.get(WIDTH), height = this.get(HEIGHT);
			var direction = this.get("direction");
			var easing = this.get("easing");
			var duration = this.get("duration");
			if (this.get("animate")) {
				var tween = new $.Tween({
					node: bar,
					duration: duration,
					easing: easing,
					on: {
						tween: function (e, value) {
							if (!this.fire(PROGRESS, value)) {
								e.preventDefault();
							}
						},
						end: function () {
							this.fire(END);
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
				this.fire(PROGRESS, newSize);
				this.fire(END);
			}
		}
	});
	
});