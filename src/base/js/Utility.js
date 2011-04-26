
/**
 * Basic class for all utilities
 * @class Utility
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Utility = Class.create('utility', $.Base, [], {
	
	CSS_PREFIX: 'jet',
	
	ATTRS: {
		/**
		 * @attribute cssPrefix
		 * @default Utility.CSS_PREFIX
		 * @writeOnce
		 */
		cssPrefix: {
			getter: function (val) {
				return val || $.Utility.CSS_PREFIX;
			},
			writeOnce: true
		}
	}
	
}, {
	
	initializer: function () {
		this._handlers = [$(this.get('win')).on(UNLOAD, this.destroy, this)];
	},
	
	/**
	 * Calls itself when the window unloads. Allows for easier memory cleanup
	 * @method destroy
	 */
	destroy: function () {
		var self = this;
		/**
		 * Preventing the default behavior will stop the destroy process
		 * @event destroy
		 */
		if (this.fire(DESTROY)) {
			$_Array.each(this._handlers, function (handler) {
				handler.detach();
			});
		}
	},
	
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join(DASH);
	}
});