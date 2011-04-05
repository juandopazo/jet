/**
 * Provides functionality for dragging and dropping elements
 * @module dragdrop
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('dragdrop', function ($) {

			
var ArrayHelper = $.Array,
	Base = $.Base,
	Lang = $.Lang;
	
var TRACKING = 'tracking',
	HANDLERS = 'handlers',
	NODE = 'node',
	CURSOR = 'cursor',
	PX = 'px';

/**
 * Makes an element draggable
 * @class Drag
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Drag = Base.create('drag', Base, [], {
	
	ATTRS: {
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
			value: 'move'
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
		},
		/**
		 * @attribute handlers
		 * @description A list of elements that will start the dragging
		 * @type Array | NodeList 
		 */
		handlers: {
			value: false,
			setter: $
		},
		
		currentX: {
			value: 0
		},
		currentY: {
			value: 0
		},
		startX: {
			value: 0
		},
		startY: {
			value: 0
		},
		startLeft: {
			value: 0
		},
		startTop: {
			value: 0
		}
	},
	
	EVENTS: {
		afterContextChange: function (e, newVal) {
			this.tracker.set('context', newVal);
		}
	}
	
}, {
	
	_firstTime: true,
	
	_onHandlerDown: function (e) {
		e.preventDefault();
		this.set('startX', e.clientX);
		this.set('startY', e.clientY);
		/**
		 * First when the dragging starts
		 * @event drag:start
		 */
		if (this.fire('drag:start', e.clientX, e.clientY)) {
			var offset = $(this).offset();
			this.set('startLeft', offset.left);
			this.set('startTop', offset.top);
			tracker.set(TRACKING, true);
		}
	},
	
	_onTrackerMove: function (e, clientX, clientY) {
		var currentX = this.get('startLeft') + clientX - this.get('startX');
		var currentY = this.get('startTop') + clientY - this.get('startY');
		
		this.set('currentX', currentX);
		this.set('currentY', currentY);
		/**
		 * Fires during the drag movement
		 * @event drag
		 */
		if (this.fire('drag', currentX, currentY)) {
			node.css({
				left: currentX + PX,
				top: currentY + PX
			});
		}
	},
	
	_onTrackingChange: function (e, value) {
		if (!this._firstTime && value === false) {
			/**
			 * Fires when the drag ends
			 * @event drag:end
			 */
			this.fire('drag:end', this.get('currentX'), this.get('currentY'));
		}
		this._firstTime = false;
	},
	
	_setupHandler: function (list) {
		list.css(CURSOR, this.get(CURSOR)).on('mousedown', this._onHandlerDown, this);
	},
	
	/**
	 * Adds a handler to the handler list
	 * @mehtod addHandler
	 * @param {HTMLElement | NodeList} handler
	 * @chainable
	 */
	addHandler: function (handler) {
		this._setupHandler($(handler));
		return this;
	},
	
	_setupTracker: function () {
		var node = myself.get(NODE);
		var tracker = this.tracker = new $.Mouse({
			shim: this.get('shim'),
			context: this.get('context')
		});
		
		tracker.on('trackingChange', this._onTrackingChange, this);
		tracker.on('mousemove', this._onTrackerMove, this);
	},
	
	initializer: function () {
		this.set(HANDLERS, this.get(HANDLERS) || [this.get(NODE)]);
		
		this._setupHandler(this.get(HANDLERS));
		this._setupTracker();
	}

});
/**
 * DragDrop class
 * @class DragDrop
 * @extends Drag
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.DragDrop = Base.create('dragdrop', $.Drag, [], {
	
	ATTRS: {
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
	}
	
}, {
	
	_insideOffset: function (x, y, offset) {
		return x > offset.left && x < (offset.left + offset.width) && y > offset.top && y < (offset.top + offset.height);
	},
	
	/**
	 * Adds a drop target
	 * @method addTarget
	 * @param {HTMLElement | NodeList} target
	 * @chainable
	 */
	addTarget: function (target) {
		this.set('targets', this.get('targets').link($(target)));
		return this;
	},
	
	_checkHits: function (e, clientX, clientY) {
		var hit = false;
		ArrayHelper.each(this.get('targets'), function (target) {
			if (this._insideOffset(clientX, clientY, target.offset())) {
				/**
				 * Fires when a draggable object is drop into a target
				 * @event drop:hit
				 */
				this.fire('drop:hit', target);
				hit = true;
			}
		}, this);
		if (!hit) {
			/**
			 * Fires when a draggable object is release but not over any target
			 * @event drop:miss
			 */
			this.fire('drop:miss');
		}
	},
	
	initializer: function () {
		this.on('drag:end', this._checkHits);
	}
	
});
			
});