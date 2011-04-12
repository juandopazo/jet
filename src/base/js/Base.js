
/**
 * Base class for all widgets and utilities.
 * @class Base
 * @extends Attribute
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
Base = function (config) {
	/*
	 * Base should hold basic logic shared among a lot of classes, 
	 * to avoid having to extend the Attribute class which is very specific in what it does
	 */
	Base.superclass.constructor.apply(this, arguments);
	
	var constrct = this.constructor;
	var classes = this._classes = [];
	var i;
	function attachEvent(name, fn) {
		this.on(name, Lang.isString(fn) ? this[fn] : fn);
	}
	while (constrct != Base) {
		classes.unshift(constrct);
		constrct = constrct.superclass.constructor;
	}
	for (i = 0; i < classes.length; i++) {
		if (classes[i].ATTRS) {
			this.addAttrs(classes[i].ATTRS);
		}
		if (classes[i].EVENTS) {
			Hash.each(classes[i].EVENTS, attachEvent, this);
		}
		if (classes[i][PROTO].hasOwnProperty('initializer')) {
			classes[i][PROTO].initializer.call(this, config);
		}
	}
	Hash.each(this.get("on"), attachEvent, this);
};
extend(Base, Attribute, {}, {
	
	ATTRS: {
		/**
		 * Allows quick setting of custom events in the constructor
		 * @attribute on
		 * @writeOnce
		 */
		on: {
			writeOnce: true,
			value: {}
		}
	},
	
	/**
	 * @method create
	 * @description creates a new base class
	 * @static
	 * @param {String} name Name of the base class to create
	 * @param {Function} superclass [Optional] The superclass for this new class. Defaults to Base
	 * @param {Array} extensions [Optional] A list of extensions to apply to the created class
	 * @param {Hash} attrs [Optional] Static properties of the class. Recommended order: ATTRS, EVENTS, HTML_PARSER
	 * @param {Hash} proto [Optional] Prototype properties to add to the class
	 */
	create: function (name, superclass, extensions, attrs, proto) {
		extensions = extensions || [];
		function BuiltClass() {
			var args = arguments;
			var self = this;
			BuiltClass.superclass.constructor.apply(this, args);
			$_Array.each(BuiltClass.exts, function (extension) {
				extension.apply(self, args);
				Hash.each(extension.EVENTS || {}, function (type, fn) {
					self.on(type, fn);
				});
			});
		}
		extend(BuiltClass, superclass || Base, proto, attrs || {});
		$.mix(BuiltClass, {
			NAME: name,
			exts: extensions
		}, true);
		$_Array.each(extensions, function (extension) {
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