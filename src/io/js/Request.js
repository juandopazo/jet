/**
 * Represents the promise of an IO request being completed.
 * Can also be aborted
 * @class Request
 * @constructor
 * @extends Promise
 */
function Request() {
	Request.superclass.constructor.apply(this, arguments);
}
$.extend(Request, $.Promise, {
	
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
	 * @description Calls $.ajax and returns a new Request
	 * @param {String} url The url for the io request
	 * @param {Object} config Config options for the io request (see $.io)
	 * @return Request
	 */
	
	/**
	 * @method jsonp
	 * @description Calls $.jsonp and returns a new Request
	 * @param {String} url The url for the jsonp request
	 * @param {Object} config Config options for the jsonp request (see $.io)
	 * @return Request
	 */
	
}, {
	
	addMethod: function (name, fn) {
		Request.prototype[name] = function (url, opts) {
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

$.Request = Request;

var TRANSACTION_METHODS = {
	ajax: ajax,
	jsonp: jsonp,
	xslt: xslt
};

$Object.each(TRANSACTION_METHODS, Request.addMethod);

$Object.each(TRANSACTION_METHODS, function (method) {
	
	$[method] = function () {
		var transaction = new $.Request();
		return transaction[method].apply(transaction, arguments);
	};
	
});