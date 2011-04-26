
$.Class = function Class() {
	var args = arguments;
	
	var classes = this._classes = [];
	var constructor = this.constructor;
	while (constructor !== Class) {
		classes.unshift(constructor);
		constructor = constructor.superclass.constructor;
	}
	
	$_Array.each(classes, function (constructor) {
		if (constructor.prototype.hasOwnProperty('initializer')) {
			constructor.prototype.initializer.apply(this, args);
		}
	}, this);
}

function mixinExtensions(constructor, extensions) {
	$_Array.each(extensions, function (extension) {
		//$.mix(BuiltClass.prototype, extension.prototype);
		$.Hash.each(extension, function (prop, val) {
			if (!constructor[prop]) {
				constructor[prop] = val;
			} else if (Lang.isObject(constructor[prop]) && Lang.isObject(val)) {
				$.mix(constructor[prop], val);
			}
		});
	});
}

$.Class.create = function (name, superclass, extensions, attrs, proto) {
	extensions = extensions || [];
	
	function BuiltClass() {
		var args = arguments;
		BuiltClass.superclass.constructor.apply(this, args);
		$_Array.each(BuiltClass.EXTS || [], function (extension) {
			extension.apply(this, args);
		}, this);
	}
	$.extend(BuiltClass, superclass || Class, proto, attrs);
	
	$.mix(BuiltClass, {
		NAME: name,
		EXTS: extensions,
		extend: function (_name, _extensions, _attrs, _proto) {
			return $.Class.create(_name, BuiltClass, _extensions, _attrs, _proto);
		},
		mixin: function () {
			mixinExtensions(BuiltClass, Array.prototype.slice.call(arguments));
			return BuiltClass;
		}
	}, true);
	
	mixinExtensions(BuiltClass, extensions);
	
	return BuiltClass;
};