
var Class = $.Class = function Class() {
	var args = arguments;
	
	var classes = this._classes = [];
	var constructor = this.constructor;
	while (constructor !== Class) {
		classes.unshift(constructor);
		constructor = constructor.superclass.constructor;
	}
	
	$_Array.each(classes, function (constructor) {
		$_Array.each(constructor.EXTS || [], function (extension) {
			extension.apply(this, args);
		}, this);
		if (constructor.prototype.hasOwnProperty('initializer')) {
			constructor.prototype.initializer.apply(this, args);
		}
	}, this);
}

$.mix(Class, {
	
	NAME: 'Class',
	
	toString: function () {
		return 'class ' + Class.NAME;
	},
	
	create: function (name, superclass, extensions, attrs, proto) {
		extensions = extensions || [];
		
		function BuiltClass() {
			BuiltClass.superclass.constructor.apply(this, args);
		}
		$.extend(BuiltClass, superclass || Class, proto, attrs);
		
		$.mix(BuiltClass, {
			NAME: name,
			create: function (_name, _extensions, _attrs, _proto) {
				return Class.create(_name, BuiltClass, _extensions, _attrs, _proto);
			},
			mixin: function () {
				return Class.mixin(BuiltClass, Array.prototype.slice.call(arguments));
			},
			toString: function () {
				return 'class ' + BuiltClass.NAME;
			}
		}, true);
		
		return Class.mixin(BuiltClass, extensions);
	},
	
	mixin: function (constructor, extensions) {
		if (!constructor.EXTS) {
			constructor.EXTS = [];
		}
		constructor.EXTS.push.apply(constructor.EXTS, extensions);
		
		$_Array.each(extensions, function (extension) {
			//$.mix(BuiltClass.prototype, extension.prototype);
			$.Hash.each(extension, function (prop, val) {
				if (!constructor[prop]) {
					constructor[prop] = val;
				} else if ($.Lang.isObject(constructor[prop]) && $.Lang.isObject(val)) {
					$.mix(constructor[prop], val);
				}
			});
		});
		
		return constructor;
	}
	
}, true);