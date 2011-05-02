
/**
 * Base class for all widgets and utilities.
 * @class Base
 * @extends Attribute
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Base = Class.create('Base', $.Attribute, {
	
	initializer: function (config) {
		config = config || {};
		function attachEvent(name, fn) {
			this.on(name, Lang.isString(fn) ? this[fn] : fn);
		}
		
		Class.walk(this, function (constructor) {
			$_Array.each(constructor.EXTS, function (extension) {
				Hash.each(extension.EVENTS, attachEvent, this);
			}, this);
			Hash.each(constructor.EVENTS, attachEvent, this);
		});
		
		Hash.each(config.on, attachEvent, this);

		this._handlers = [$($.config.win).on(UNLOAD, this.destroy, this)];
	},
	
	/**
	 * Starts the destruction lifecycle
	 * @method destroy
	 */
	destroy: function () {
		/**
		 * Preventing the default behavior will stop the destroy process
		 * @event destroy
		 */
		if (this.fire(DESTROY)) {
			Class.walk(this, function (constructor) {
				if (constructor.prototype.hasOwnProperty('destructor')) {
					constructor.prototype.destructor.call(this);
				}
			});

			$_Array.each(this._handlers, function (handler) {
				if (handler.detach) {
					handler.detach();
				}
			});
		}
	}
	
}, {
	
	ATTRS: {
		/**
		 * Allows quick setting of custom events in the constructor
		 * @attribute on
		 * @writeOnce
		 */
		on: {
			writeOnce: true,
			getter: function (val) {
				return val || {};
			}
		}
	},
	
	create: function (name, superclass, extensions, attrs, proto) {
		return Class.create(name, superclass || $.Base, proto, attrs).mixin(extensions || []);
	}
	
});
