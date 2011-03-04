
/**
 * Basic class for all utilities
 * @class Utility
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function Utility() {
	Utility.superclass.constructor.apply(this, arguments);
}
extend(Utility, Base, {
	
	initializer: function () {
		this._handlers = [$(this.get('win')).on(UNLOAD, this.destroy, this)];
	},
	
	/**
	 * Calls itself when the window unloads. Allows for easier memory cleanup
	 * @method destroy
	 */
	destroy: function () {
		var self = this;
		if (this.fire(DESTROY)) {
			A.each(this._handlers, function (handler) {
				handler.detach();
			});
		}
	},
	
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join(DASH);
	}
}, {
	
	CSS_PREFIX: 'jet',
	
	ATTRS: {
		cssPrefix: {
			value: Utility.CSS_PREFIX,
			writeOnce: true
		},
		win: {
			value: $.win
		},
		
		doc: {
			getter: function () {
				return this.get('win').document;
			},
			setter: function (val) {
				this.set('win', val.parentWindow || val.defaultView);
				return val;
			}
		}
	}
	
});