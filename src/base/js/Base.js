
/**
 * Base class for all widgets and utilities.
 * @class Base
 * @extends Attribute
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function Base(config) {
	config = config || {};
	Base.superclass.constructor.call(this, config);
	
	var classes = this._classes;
	var i, events = this.get('on');
	var attachEvent = function (name, fn) {
		this.on(name, Lang.isString(fn) ? this[fn] : fn);
	};

	this._handlers = [$($.config.win).on(UNLOAD, this.destroy, this)];

	Hash.each(events, attachEvent, this);

	for (i = 0; i < classes.length; i++) {
		if (classes[i].EVENTS) {
			Hash.each(classes[i].EVENTS, attachEvent, this);
		}
		if (classes[i][PROTO].hasOwnProperty('initializer')) {
			classes[i][PROTO].initializer.call(this, config);
		}
	}
}
$.extend(Base, Attribute, {
	
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
			$Array.each(this._classes, function (constructor) {
				if (constructor.prototype.hasOwnProperty('destructor')) {
					constructor.prototype.destructor.call(this);
				}
			}, this);

			$Array.each(this._handlers, function (handler) {
				if (handler.detach) {
					handler.detach();
				}
			});
			
			this.unbind();
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
			//writeOnce: true,
			getter: function (val) {
				return val || {};
			}
		}
	},
	
	create: function (name, superclass, extensions, attrs, proto) {
		extensions = extensions || [];
		function BuiltClass() {
			var args = arguments;
			var self = this;
			BuiltClass.superclass.constructor.apply(this, args);
			$Array.each(BuiltClass.EXTS, function (extension) {
				extension.apply(self, args);
				Hash.each(extension.EVENTS || {}, function (type, fn) {
					self.on(type, fn);
				});
			});
		}
		extend(BuiltClass, superclass || Base, proto, attrs || {});
		$.mix(BuiltClass, {
			NAME: name,
			EXTS: extensions
		}, true);
		$Array.each(extensions, function (extension) {
			$.mix(BuiltClass[PROTO], extension[PROTO]);
			Hash.each(extension, function (prop, val) {
				if (!BuiltClass[prop]) {
					BuiltClass[prop] = val;
				} else if (Lang.isObject(BuiltClass[prop]) && Lang.isObject(val)) {
					$.mix(BuiltClass[prop], val);
				}
			});
		});
		return BuiltClass;
	}
	
});

$.Base = Base;
