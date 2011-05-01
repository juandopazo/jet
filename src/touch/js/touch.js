jet().add('touch', function ($) {
	
	var x1, x2, y1, y2;
	var TOUCH = 'touch';
	var FLICK = 'flick';
	var LEFT = 'left';
	var RIGHT = 'right';
	var UP = 'up';
	var DOWN = 'down';
	
	var fireFlick = function (target, direction) {
		target.trigger(FLICK, {
			direction: direction
		}).trigger(FLICK + ":" + direction);
	};
	
	$(document).on(TOUCH + 'start', function (e) {
		
		var touches = e.touches[0];
		x1 = touches.clientX;
		y1 = touches.clientY;
		
	}).on(TOUCH + 'move', function (e) {
		
		var touches = e.touches[0];
		x2 = touches.clientX;
		y2 = touches.clientY;
		
	}).on(TOUCH + 'end', function (e) {
		
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
		
	});
	
	
});