function IO() {
	IO.superclass.constructor.apply(this, arguments);
	this.resolved = true;
}
$.IO = $.extend(IO, Promise, {
	
	abort: function () {
		this.reject();
	}
	
}, {
	
	addMethod: function (name, fn) {
		IO.prototype[name] = function (url, config) {
			var success = config.success;
			var failure = config.failure;
			return this.defer(function (promise) {
				config.success = $.bind(promise.resolve, promise);
				config.failure = $.bind(promise.reject, promise);
				fn(url, opts);
			}).then(success, failure);
		};
	}
	
});

Hash.each({
	ajax: ajax,
	jsonp: jsonp,
	xslt: xslt
}, IO.addMethod);

$.Array.forEach(['ajax', 'jsonp', 'xslt'], function (method) {
	
	$[method] = function (url, opts) {
		var io = new $.IO();
		return io[method](url, opts);
	};
	
});