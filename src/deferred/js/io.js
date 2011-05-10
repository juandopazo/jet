
if ($.ajax) {
	var oldAjax = $.ajax;

	function XHR(opts) {
		this.promise(function (promise) {
			opts.success = promise.resolve;
			opts.failure = promise.reject;
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
