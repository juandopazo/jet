/*
 * Very early stages
 * 
 */
jet().add('flash', function ($) {
	
	var Lang = $.Lang;
	var Hash = $.Hash;
	
	$.MethodDelayer = function (obj) {
		var ready = false;
		var delayedMethods = {};
		var delayMethod = function (method) {
			delayedMethods[method] = {
				fn: obj[method],
				queue: []
			};
			obj[method] = function () {
				if (ready) {
					delayedMethods[method].fn.apply(obj, arguments);
				} else {
					delayedMethods[method].queue.push(arguments);
				}
			};
		};

		this.delay = function () {
			var args = arguments;
			for (var i = 0; i < args.length; i++) {
				delayMethod(args[i]);
			}
		};
		this.execute = function () {
			for (var x in delayedMethods) {
				if (delayedMethods.hasOwnProperty(x)) {
					while (delayedMethods[x].queue.length > 0) {
						delayedMethods[x].fn.apply(obj, delayedMethods[x].queue.splice(0, 1));
					}
				}
			}
			ready = true;
		};
		this.pause = function () {
			ready = false;
		};
	};
	
	var Element = $.UA.ie ? function (doc) {
		Element.superclas.constructor.call(this, "object", doc);
				
		this.param = function (name, value) {
			var params = {};
			var node = this.getNode();
			if (Lang.isHash(name)) {
				params = name;
			} else if (Lang.isValue(value)) {
				params[name] = value;
			} else {
				var result = "";
				this.children().each(function (node) {
					if (node.name == name) {
						result = node.value; 
					}
				});
				return result;
			}
			Hash.each(params, function (name, value) {
				$.create("param", doc).setAttribute({
					name: name,
					value: value
				}).appendTo(node);
			});
			return this;
		};
	} : function (doc) {
		Element.superclass.constructor.call(this, "embed", doc);
		
		this.param = function () {
			return this.attr.apply(this, arguments);
		};
	};
	$.extend(Element, $.NodeList);
	
	$.Flash = function (src, params, doc) {
		doc = doc || document;
		$.Flash.superclass.constructor.call(this, doc);
		$.EventTarget.apply(this);
		
		this.param({
			type: "application/x-shockwave-flash",
			movie: src,
			src: src
		});
		if (params) {
			this.param(params);
		}
		
		var delayer = new $.MethodDelayer(this);
		delayer.delay('clip');
		
		this.render = function () {
			delayer.execute();
		};
	};
	$.extend($.Flash, Element);
});
