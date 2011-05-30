/**
 * Touch events
 * @module touch
 * @requires node
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('touch', function ($) {

			var x1, x2, y1, y2,
	FLICK = 'flick',
	LEFT = 'left',
	RIGHT = 'right',
	UP = 'up',
	DOWN = 'down';
	
var Touch = $.namespace('Event').Touch = {
	
	fireFlick: function (target, direction) {
		target.trigger(FLICK, {
			direction: direction
		}).trigger(FLICK + ':' + direction);
	},
	
	touchstart: function (e) {
		
		var touches = e.touches[0];
		x1 = touches.clientX;
		y1 = touches.clientY;
		
	},
	
	touchmove: function (e) {
	
		var touches = e.touches[0];
		x2 = touches.clientX;
		y2 = touches.clientY;
		
	},
	
	touchend: function (e) {
		
		var target = $(e.target);
		if (x2 > 0 || y2 > 0) {
			var xDiff = Math.abs(x2 - x1);
			var xDirection = x2 - x1 > 0 ? LEFT : RIGHT;
			var yDiff = Math.abs(y2 - y1);
			var yDirection = y2 - y1 < 0 ? DOWN : UP;
			var FLICK_THRESHOLD = 30;
			if (xDiff > FLICK_THRESHOLD && yDiff > FLICK_THRESHOLD) {
				if (xDiff / yDiff >= 2) {
					fireFlick(target, xDirection);
				} else if (yDiff / xDiff >= 2) {
					fireFlick(target, yDirection);
				}
			} else if (xDiff > FLICK_THRESHOLD) {
				fireFlick(target, xDirection);
			} else if (yDiff > FLICK_THRESHOLD) {
				fireFlick(target, yDirection);
			}
		}
		
	}
};

$.Object.each(Touch, $(document).on);
			
});
