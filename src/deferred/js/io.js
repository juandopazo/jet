
if ($.ajax) {
	var oldAjax = $.ajax;

	function XHR(opts) {
		this.promise(function (promise) {
			opts.success = $.bind(promise.resolve, promise);
			opts.failure = $.bind(promise.reject, promise);
			oldAjax(opts);
		});
	}
	$.extend(XHR, Deferred, {
		
		abort: function () {
			this.reject();
		}
		
	});
	
	$.ajax = function (opts) {
		opts = opts || {};
		var success = opts.success;
		var failure = opts.failure;
		var xhr = new XHR(opts);
		xhr.then(success, failure);
		return xhr;
	};
}
