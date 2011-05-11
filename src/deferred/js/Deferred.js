
/**
 * Deferred is a class designed to serve as extension for other classes, allowing them to
 * declare methods that run asynchronously and keep track of its promise
 * @class Deferred
 * @constructor
 */
function Deferred() {}
Deferred.prototype = {
	
	/**
	 * @method then
	 * @description Adds callbacks to the last promise made. If no promise was made it calls the success callbacks immediately
	 * @param {Function, Array} doneCallbacks A function or array of functions to run when the promise is resolved
	 * @param {Function, Array} failCallbacks A function or array of functions to run when the promise is rejected
	 * @chainable
	 */
	then: function (doneCallbacks, failCallbacks) {
		if (this._promise) {
			this._promise.then(doneCallbacks, failCallbacks);
		} else {
			this._notify(doneCallbacks);
		}
		return this;
	},

	/**
	 * @method done
	 * @description Adds callbacks to the success list
	 * @param {Function, Array} doneCallbacks Takes any number of functions or arrays of functions to run when the promise is resolved
	 * @chainable 
	 */
	done: Promise.prototype.done,

	/**
	 * @method fail
	 * @description Adds callbacks to the failure list
	 * @param {Function, Array} failCallbacks Takes any number of functions or arrays of functions to run when the promise is rejected
	 * @chainable 
	 */
	fail: Promise.prototype.fail,
	
	promise: function (fn) {
		var promise = new Promise();
		var self = this;
		var switchPromise = $.bind(function () {
			this._currPromise = promise;
		}, this);
		if (fn) {
			if (this._promise) {
				this._promise.then([$.bind(fn, promise, this), switchPromise], switchPromise);
			} else {
				fn.call(promise, promise);
				this._currPromise = promise;
			}
		}
		this._promise = promise;
		return this;
	},
	
	/**
	 * @method resolve
	 * @description Resolves the <strong>current</strong> promise and notifies all callbacks
	 * @param {Object} o Any number of arguments that will be passed to the success callbacks
	 * @chainable
	 */
	resolve: function () {
		return this.resolveWith(this, arguments);
	},

	/**
	 * @method reject
	 * @description Rejects the <strong>current</strong> promise and notifies all callbacks
	 * @param {Object} o Any number of arguments that will be passed to the failure callbacks
	 * @chainable
	 */
	reject: function () {
		return this.rejectWith(this, arguments);
	},
	
	/**
	 * @method resolveWith
	 * @description Resolves the promise and notifies all callbacks
	 * @param {Object} context The object to use as context for the callbacks
	 * @param {Array} args A list of arguments that will be passed to the success callbacks
	 * @chainable
	 */
	resolveWith: function (context, args) {
		var promise = this._currPromise;
		if (promise) {
			promise.resolve.apply(context, args);
		}
		return this;
	},
	
	/**
	 * @method rejectWith
	 * @description Rejects the promise and notifies all callbacks
	 * @param {Object} context The object to use as context for the callbacks
	 * @param {Array} args A list of arguments that will be passed to the failure callbacks
	 * @chainable
	 */
	rejectWith: function (context, args) {
		var promise = this._currPromise;
		if (promise) {
			promise.reject.apply(context, args);
		}
		return this;
	},
	/**
	 * @method notify
	 * @description Notifies the success or failure callbacks
	 * @param {Boolean} success Whether to notify the success or failure callbacks
	 * @param {Array} args A list of arguments to pass to the callbacks
	 * @param {Object} thisp Context to apply to the callbacks
	 * @chainable
	 * @private
	 */
	_notify: Promise.prototype.notify
	
};

$.Deferred = Deferred;