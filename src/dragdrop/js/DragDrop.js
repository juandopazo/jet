
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