
if ($.ajax) {
	var oldAjax = $.ajax;

	function XHR(opts) {
		this.config = opts || {};
	}
	$.extend(XHR, Deferred, {
		
		send: function () {
			var opts = this.config;
			return this.promise(function (promise) {
				opts.success = $.bind(promise.resolve, promise);
				opts.failure = $.bind(promise.reject, promise);
				oldAjax(opts);
			});
		},
		
		abort: function () {
			this.reject();
		}
		
	});
	
	$.XHR = XHR;
	
	$.ajax = function (opts) {
		opts = opts || {};
		var success = opts.success;
		var failure = opts.failure;
		var xhr = new XHR(opts);
		return xhr.send().then(success, failure);
	};
}
