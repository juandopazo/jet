jet().add('dragdrop', function ($) {
	
	var FALSE = false,
		TRUE = true;
	
	var ArrayHelper = $.Array,
		Lang = $.Lang;
		
	var TRACKING = "tracking",
		HANDLERS = "handlers",
		NODE = "node",
		CURSOR = "cursor",
		PX = "px";
	
	var Drag = function () {
		Drag.superclass.constructor.apply(this, arguments);
		var myself = this.addAttrs({
			node: {
				required: TRUE,
				setter: function (value) {
					return $(value);
				}
			},
			cursor: {
				value: "move"
			},
			tracking: {
				value: FALSE
			}
		});
		myself.addAttr(HANDLERS, {
			setter: function (value) {
				return $(value);
			}
		});
		
		var startX, startY, startLeft, startTop;
		var currentX, currentY;
		
		var tracker = new $.utils.MouseTracker();
		
		var setupHandler = function (list) {
			list.css(CURSOR, myself.get(CURSOR)).on("mousedown", function (e) {
				e.preventDefault();
				startX = e.clientX;
				startY = e.clientY;
				if (myself.fire("start", startX, startY)) {
					var offset = $(this).offset();
					startLeft = offset.left;
					startTop = offset.top;
					tracker.set(TRACKING, TRUE);
				}
			});
		};
		
		myself.addHandler = function (handler) {
			setupHandler($(handler));
		};
		
		var handlers = myself.get(HANDLERS);
		if (handlers) {
			setupHandler(handlers);
		} else {
			setupHandler(myself.get(NODE));
		}
		
		$($.context).on("mouseup", function () {
			tracker.set(TRACKING, FALSE);
		});
		var firstTime = TRUE;
		tracker.on("trackingChange", function (e, value) {
			if (!firstTime && value === FALSE) {
				myself.fire("end", currentX, currentY);
			}
			firstTime = FALSE;
		});
		var node = myself.get(NODE);
		tracker.on("mousemove", function (e, clientX, clientY) {
			currentX = startLeft + clientX - startX;
			currentY = startTop + clientY - startY;
			if (myself.fire("drag", currentX, currentY)) {
				node.css({
					left: currentX + PX,
					top: currentY + PX
				});
			}
		});
	};
	Drag.NAME = "drag";
	$.extend(Drag, $.Base);
	
	var DragDrop = function () {
		DragDrop.superclass.constructor.apply(this, arguments);
		var myself = this.addAttrs({
			targets: {
				validator: Lang.isArray,
				value: [],
				setter: function (value) {
					ArrayHelper.each(value, function (target, i) {
						value[i] = $(target);
					});
					return value;
				}
			}
		});
		
		var insideOffset = function (x, y, offset) {
			return x > offset.left && x < (offset.left + offset.width) && y > offset.top && y < (offset.top + offset.height);
		};
		
		var myTargets = [];
		
		myself.addTarget = function (target) {
			myTargets[myTargets.length] = $(target);
		};
		
		myself.on("end", function (e, clientX, clientY) {
			var targets = myself.get("targets").concat(myTargets);
			var hit = FALSE;
			ArrayHelper.each(targets, function (target) {
				if (insideOffset(clientX, clientY, target.offset())) {
					myself.fire("drop:hit", target);
					hit = TRUE;
				}
			});
			if (!hit) {
				myself.fire("drop:miss");
			}
		});
	};
	$.extend(DragDrop, Drag);
	
	var DDPlugin = function () {
		
	};
	
	$.add({
		Drag: Drag,
		DragDrop: DragDrop
	});
	
});