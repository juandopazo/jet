
var $Array = $.Array,
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
var Drag = $.Drag = $.Base.create('drag', $.Base, [], {
	
	ATTRS: {
		/**
		 * @attribute node
		 * @description node to be dragged
		 * @required
		 */
		node: {
			required: true,
			setter: $
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
		/**
		 * @attribute handlers
		 * @description A list of elements that will start the dragging
		 * @type Array | NodeList 
		 */
		handlers: {
			setter: $
		},
		
		startX: { value: 0 },
		startY: { value: 0 },
		startLeft: { value: 0 },
		startTop: { value: 0 },
		currentX: { value: 0 },
		currentY: { value: 0 }
	}
	
}, {
	
	initializer: function () {
		var mouse = this.mouse = new $.Mouse({
			shim: this.get('shim'),
			on: {
				trackingChange: $.bind(this._onMouseStatusChange, this),
				mousemove: $.bind(this._onMouseMove, this)
			}
		});
		var handlers = this.get(HANDLERS);
		if (handlers) {
			this._setupHandler(handlers);
		} else {
			this._setupHandler(this.get(NODE));
		}

		mouse.firstTime = true;
	},
	
	_onMouseMove: function (e) {
		var currentX = this.get('startLeft') + e.clientX - this.get('startX');
		var currentY = this.get('startTop') + e.clientY - this.get('startY');
		
		this.set({
			currentX: currentX,
			currentY: currentY
		});
		/**
		 * Fires during the drag movement
		 * @event drag
		 */
		if (this.fire('drag', { x: currentX, y: currentY })) {
			this.get(NODE).css({
				left: currentX + PX,
				top: currentY + PX
			});
		}
	},
	
	_onMouseStatusChange: function (e) {
		if (!this.mouse.firstTime && e.newVal === false) {
			/**
			 * Fires when the drag ends
			 * @event drag:end
			 */
			this.fire('drag:end', { x: this.get('currentX'), y: this.get('currentY') });
		}
		this.mouse.firstTime = false;
	},
	
	_onHandlerMouseDown: function (e) {
		e.preventDefault();
		this.set({
			startX: e.clientX,
			startY: e.clientY
		});
		/**
		 * First when the dragging starts
		 * @event drag:start
		 */
		if (this.fire('drag:start', { x: e.clientX, y: e.clientY })) {
			var offset = $(e.target).offset();
			this.set({
				startLeft: offset.left,
				startTop: offset.top
			});
			this.mouse.down();
		}
	},
	
	_setupHandler: function (list) {
		list.css(CURSOR, this.get(CURSOR)).on('mousedown', this._onHandlerMouseDown, this);
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
	}
	
});
