
var ArrayHelper = $.Array,
	Lang = $.Lang;
	
var TRACKING = "tracking",
	HANDLERS = "handlers",
	NODE = "node",
	CURSOR = "cursor",
	PX = "px";

/**
 * Makes an element draggable
 * @class Drag
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
var Drag = function () {
	Drag.superclass.constructor.apply(this, arguments);
	var myself = this.addAttrs({
		/**
		 * @attribute node
		 * @description node to be dragged
		 * @required
		 */
		node: {
			required: true,
			setter: function (value) {
				return $(value);
			}
		},
		/**
		 * @attribute cursor
		 * @description the type of cursor that will be shown on hover
		 * @type String
		 */
		cursor: {
			value: "move"
		},
		/**
		 * @attribute tracking
		 * @description the tracking status
		 * @type Boolean
		 */
		tracking: {
			value: false
		},
		context: {
			value: $.context
		}
	});
	/**
	 * @attribute handlers
	 * @description A list of elements that will start the dragging
	 * @type Array | NodeList 
	 */
	myself.addAttr(HANDLERS, {
		setter: function (value) {
			return $(value);
		}
	});
	
	var startX, startY, startLeft, startTop;
	var currentX, currentY;
	
	var tracker = new $.Mouse({
		shim: myself.get("shim"),
		context: myself.get("context")
	});
	
	var setupHandler = function (list) {
		list.css(CURSOR, myself.get(CURSOR)).on("mousedown", function (e) {
			e.preventDefault();
			startX = e.clientX;
			startY = e.clientY;
			/**
			 * First when the dragging starts
			 * @event drag:start
			 */
			if (myself.fire("drag:start", startX, startY)) {
				var offset = $(this).offset();
				startLeft = offset.left;
				startTop = offset.top;
				tracker.set(TRACKING, true);
			}
		});
	};
	
	/**
	 * Adds a handler to the handler list
	 * @mehtod addHandler
	 * @param {HTMLElement | NodeList} handler
	 * @chainable
	 */
	myself.addHandler = function (handler) {
		setupHandler($(handler));
		return myself;
	};
	
	var handlers = myself.get(HANDLERS);
	if (handlers) {
		setupHandler(handlers);
	} else {
		setupHandler(myself.get(NODE));
	}
	
	var firstTime = true;
	tracker.on("trackingChange", function (e, value) {
		if (!firstTime && value === false) {
			/**
			 * Fires when the drag ends
			 * @event drag:end
			 */
			myself.fire("drag:end", currentX, currentY);
		}
		firstTime = false;
	});
	var node = myself.get(NODE);
	tracker.on("mousemove", function (e, clientX, clientY) {
		currentX = startLeft + clientX - startX;
		currentY = startTop + clientY - startY;
		/**
		 * Fires during the drag movement
		 * @event drag
		 */
		if (myself.fire("drag", currentX, currentY)) {
			node.css({
				left: currentX + PX,
				top: currentY + PX
			});
		}
	});
	myself.on("contextChange", function (e, newVal) {
		tracker.set("context", newVal);
	});
};
Drag.NAME = "drag";
$.extend(Drag, $.Base);