
/**
 * Basic class from which all classes should inherit
 * Provides the functionality for the 'initializer' method and mixins
 * @class Class
 * @constructor
 */
var Class = $.Class = function Class() {
	var args = arguments;
	var self = this;
	
	$_Array.each($.Class.getClasses(this), function (constructor) {
		$_Array.each(constructor.EXTS || [], function (extension) {
			extension.apply(self, args);
		});
		if (constructor.prototype.hasOwnProperty('initializer')) {
			constructor.prototype.initializer.apply(self, args);
		}
	});
}

$.mix(Class, {

	/**
	 * @method create
	 * @description Shortcut for creating a new class that extends Class
	 * @static
	 * @param {String} name Required. Name of the new class
	 * @param {Class} superclass Optional. Superclass to extend. Default is Class
	 * @param {Object} proto Optional. An object to map to the created class' prototype
	 * @param {Object} attrs Optional. An object to map to the created class as static properties
	 * @return {BuiltClass} built class
	 */
	create: function (name, superclass, proto, attrs) {
		
		function BuiltClass() {
			BuiltClass.superclass.constructor.apply(this, arguments);
		}
		$.extend(BuiltClass, superclass || Class, proto, attrs);
		
		return $.mix(BuiltClass, {
			NAME: name,
			inherit: function (_name, _proto, _attrs) {
				return Class.create(_name, BuiltClass, _proto, _attrs);
			},
			mixin: function (exts) {
				return Class.mixin(BuiltClass, exts);
			}
		}, true);
	},
	
	/**
	 * @method mixin
	 * @description Mixes in a number of classes into another
	 * @static
	 * @param {Class} constructor Class into which to mix the others in
	 * @param {Array} extensions A list of the classes to mix in
	 * @return {Class} the mixed class
	 */
	mixin: function (constructor, extensions) {
		if (!constructor.EXTS) {
			constructor.EXTS = [];
		}
		constructor.EXTS.push.apply(constructor.EXTS, extensions);
		
		$_Array.each(extensions, function (extension) {
			$.mix(constructor.prototype, extension.prototype);
			$.Hash.each(extension, function (prop, val) {
				if (!constructor[prop]) {
					constructor[prop] = val;
				} else if ($.Lang.isObject(constructor[prop]) && $.Lang.isObject(val)) {
					$.mix(constructor[prop], val);
				}
			});
		});
		
		return constructor;
	},
	
	/**
	 * @method getClasses
	 * @description Returns an array with all the classes in the prototype chain, from the inner most one to the outer most one
	 * @static
	 * @param {Object} instance The instance from which to get all constructors
	 * @return {Array}
	 */
	getClasses: function (instance) {
		var classes = [];
		var constructor = instance.constructor;
		while (constructor && constructor !== Class) {
			classes.unshift(constructor);
			constructor = constructor.superclass.constructor;
		}
		return classes;
	},
	
	/**
	 * @method walk
	 * @description Runs a function through all the classes returned by Class.getClasses()
	 * @static
	 * @param {Object} instance The instance from which to get all constructors
	 * @param {Function} fn The function to execute on these constructors
	 * @param {Object} thisp The object to use as context. Default is the instance 
	 */
	walk: function (instance, fn, thisp) {
		$.Array.each(Class.getClasses(instance), fn, thisp || instance);
	}
	
}, true);

/**
 * Every class created with Class.create() shares this properties
 * @class BuiltClass
 * @constructor
 */
/**
 * @method inherit
 * @description Creates a new class that inherits from this one
 * @param {String} name Required. The name of the new class
 * @param {Object} proto Optional. Prototype properties of the new class
 * @param {Object} attrs Optional. Static properties of the new class
 * @return BuiltClass
 */
/**
 * @method mixin
 * @description Mixes other classes into this one
 * @param {Array} exts A list of classes to mix in
 * @return BuiltClass
 */