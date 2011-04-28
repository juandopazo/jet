
var Class = $.Class = function Class() {
	var args = arguments;
	var self = this;
	
	$_Array.each(Class.getClasses(this), function (constructor) {
		$_Array.each(constructor.EXTS || [], function (extension) {
			extension.apply(self, args);
		});
		if (constructor.prototype.hasOwnProperty('initializer')) {
			constructor.prototype.initializer.apply(self, args);
		}
	});
}

$.mix(Class, {
	
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
	
	getClasses: function (instance) {
		var classes = [];
		var constructor = instance.constructor;
		while (constructor && constructor !== Class) {
			classes.unshift(constructor);
			constructor = constructor.superclass.constructor;
		}
		return classes;
	},
	
	walk: function (instance, fn, thisp) {
		$.Array.each(Class.getClasses(instance), fn, thisp || instance);
	}
	
}, true);