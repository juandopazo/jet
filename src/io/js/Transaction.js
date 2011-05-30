/**
 * Represents the promise of a transaction being completed.
 * Can also be aborted
 * @class Transaction
 * @constructor
 * @extends Promise
 */
function Transaction() {
	Transaction.superclass.constructor.apply(this, arguments);
}
$.extend(Transaction, $.Deferred, {
	
	/**
	 * @method abort
	 * @description Aborts the request if available (doesn't work on JSONP transactions)
	 * @chainable
	 */
	abort: function () {
		if (this._request && this._request.abort) {
			this._request.abort();
		}
		return this.reject();
	}
	
	/**
	 * @method ajax
	 * @description Calls $.ajax and returns a new Transaction
	 * @param {String} url The url for the io request
	 * @param {Object} config Config options for the io request (see $.io)
	 * @return Transaction
	 */
	
	/**
	 * @method jsonp
	 * @description Calls $.jsonp and returns a new Transaction
	 * @param {String} url The url for the jsonp request
	 * @param {Object} config Config options for the jsonp request (see $.io)
	 * @return Transaction
	 */
	
}, {
	
	addMethod: function (name, fn) {
		Transaction.prototype[name] = function (url, opts) {
			var config = (!Lang.isObject(opts) || Lang.isFunction(opts)) ? {} : opts,
				on = config.on || (config.on = {}),
				success = on.success,
				failure = on.failure;
			if (Lang.isFunction(opts)) {
				success = opts;
			}
			return this.defer(function (promise) {
				on.success = $.bind(promise.resolve, promise);
				on.failure = $.bind(promise.reject, promise);
				this._request = fn(url, config);
			}).then(success, failure);
		};
	}
	
});

$.Transaction = Transaction;

var TRANSACTION_METHODS = {
	ajax: ajax,
	jsonp: jsonp,
	xslt: xslt
};

$Object.each(TRANSACTION_METHODS, Transaction.addMethod);

$Object.each(TRANSACTION_METHODS, function (method) {
	
	$[method] = function () {
		var transaction = new $.Transaction();
		return transaction[method].apply(transaction, arguments);
	};
	
});