function Transaction(started) {
	Transaction.superclass.constructor.apply(this, arguments);
	this.resolved = !started;
}
$.Transaction = $.extend(Transaction, Promise, {
	
	abort: function () {
		if (this._request && this._request.abort) {
			this._request.abort();
		}
		this.reject();
	}
	
}, {
	
	addMethod: function (name, fn) {
		
		Transaction.prototype[name] = function (url, config) {
			
			var success = config.success;
			var failure = config.failure;
			
			return this.defer(function (promise) {
				config.success = $.bind(promise.resolve, promise);
				config.failure = $.bind(promise.reject, promise);
				this._request = fn(url, opts);
			}).then(success, failure);
		};
		
	}
	
});

var TRANSACTION_METHODS = {
	ajax: ajax,
	jsonp: jsonp,
	xslt: xslt
};

$Object.each(TRANSACTION_METHODS, Transaction.addMethod);

$Object.each(TRANSACTION_METHODS, function (method) {
	
	$[method] = function () {
		var transaction = new $.Transaction(true);
		return transaction[method].apply(transaction, arguments);
	};
	
});