/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Provides functionality for dragging and dropping elements
 * @module dragdrop
 * @requires lang, base, node
 */
jet().add('dragdrop', function ($) {
	
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
			 * @config node
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
			 * @config cursor
			 * @description the type of cursor that will be shown on hover
			 * @type String
			 */
			cursor: {
				value: "move"
			},
			/**
			 * @config tracking
			 * @description the tracking status
			 * @type Boolean
			 */
			tracking: {
				value: false
			}
		});
		/**
		 * @config handlers
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
		
		var tracker = new $.utils.Mouse({
			shim: myself.get("shim")
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
		
		$($.context).on("mouseup", function () {
			tracker.set(TRACKING, false);
		});
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
	};
	Drag.NAME = "drag";
	$.extend(Drag, $.Base);
	
	/**
	 * DragDrop class
	 * @class DragDrop
	 * @extends Drag
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
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
		
		/**
		 * Adds a drop target
		 * @method addTarget
		 * @param {HTMLElement | NodeList} target
		 * @chainable
		 */
		myself.addTarget = function (target) {
			myTargets[myTargets.length] = $(target);
			return myself;
		};
		
		myself.on("end", function (e, clientX, clientY) {
			var targets = myself.get("targets").concat(myTargets);
			var hit = false;
			ArrayHelper.each(targets, function (target) {
				if (insideOffset(clientX, clientY, target.offset())) {
					/**
					 * Fires when a draggable object is drop into a target
					 * @event drop:hit
					 */
					myself.fire("drop:hit", target);
					hit = true;
				}
			});
			if (!hit) {
				/**
				 * Fires when a draggable object is release but not over any target
				 * @event drop:miss
				 */
				myself.fire("drop:miss");
			}
		});
	};
	$.extend(DragDrop, Drag);
	
	$.add({
		Drag: Drag,
		DragDrop: DragDrop
	});
	
});