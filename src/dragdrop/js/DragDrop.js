
/**
 * DragDrop class
 * @class DragDrop
 * @extends Drag
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.DragDrop = $.Base.create('dragdrop', Drag, [], {
	
	ATTRS: {
		targets: {
			validator: Lang.isArray,
			setter: function (value) {
				$Array.each(value, function (target, i) {
					value[i] = $(target);
				});
				return value;
			}
		}
	}
	
}, {
	
	initializer: function () {
		this.after('drag:end', this._ddOnDragEnd);
	},
	
	_ddOnDragEnd: function (e) {
		var hit = false;
		$Array.each(this.get('targets'), function (target) {
			if (this._insideOffset(e.clientX, e.clientY, target.offset())) {
				/**
				 * Fires when a draggable object is drop into a target
				 * @event drop:hit
				 */
				this.fire("drop:hit", { ddtarget: target });
				hit = true;
			}
		}, this);
		if (!hit) {
			/**
			 * Fires when a draggable object is release but not over any target
			 * @event drop:miss
			 */
			this.fire("drop:miss");
		}
	},
	
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
		this.get('targets').push($(target));
		return this;
	}
	
});