/**
 * Deferred is a class designed to serve as extension for other classes, allowing them to
 * declare methods that run asynchronously and keep track of its promise
 * @class Deferred
 * @constructor
 */
function Deferred() {
	this._fail = [];
}
Deferred.prototype = {
	
	/**
	 * @method then
	 * @description Adds callbacks to the last promise made. If no promise was made it calls the success callbacks immediately
	 * @param {Function|Array} doneCallbacks A function or array of functions to run when the promise is resolved
	 * @param {Function|Array} failCallbacks A function or array of functions to run when the promise is rejected
	 * @chainable
	 */
	then: function (doneCallbacks, failCallbacks) {
		var next = this._next;
		
		if (doneCallbacks || failCallbacks) {
			doneCallbacks = YArray._spread(doneCallbacks);
			if (next) {
				YArray.each(doneCallbacks, function (deferred, i) {
					if (deferred.end) {
						doneCallbacks[i] = function () {
							deferred.end();
						};
					}
				});
				next.then(doneCallbacks, failCallbacks);
			} else {
				doneCallbacks = YArray.filter(doneCallbacks, function (callback) {
					return !callback.end;
				});
				this._notify(doneCallbacks);
			}
		}
		return this;
	},
	
	_switchPromise: function (next) {
		this._current = next;
	},

	defer: function (fn, context) {
		context = context || this;
		var promise = new Promise(),
			switchPromise = $.bind(this._switchPromise, this, promise);
		
		if (fn) {
			fn = $.bind(fn, context, promise);
			
			promise.fail($.bind(this._notifyFailure, this));
			
			if (this._next) {
				this._next.then([fn, switchPromise], switchPromise);
			} else {
				this._starter = fn;
				this._current = promise;
			}
		}
		this._next = promise;
		return this;
	},
	
	end: function (doneCallbacks, failCallbacks) {
		this.then(doneCallbacks);
		this._fail.push.apply(this._fail, YArray._spread(failCallbacks));
		if (this._starter) {
			this._starter();
		}
		return this;
	},
	
	/**
	 * @method resolveWith
	 * @description Resolves the promise and notifies all callbacks
	 * @param {Object} context The object to use as context for the callbacks
	 * @param {Array} args A list of arguments that will be passed to the success callbacks
	 * @chainable
	 */
	resolveWith: function (context, args) {
		var promise = this._current;
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
		var promise = this._current;
		if (promise) {
			promise.reject.apply(context, args);
		}
		return this;
	},

	isResolved: function () {
		return this._current.isResolved();
	},
	
	isRejected: function () {
		return this._current.isRejected();
	},
	
	_notifyFailure: function () {
		var args = arguments;
		YArray.each(this._fail, function (callback) { callback.apply(this, args); }, this);
		return this;
	}
	
};

	/**
	 * @method done
	 * @description Adds callbacks to the success list
	 * @param {Function|Array} doneCallbacks Takes any number of functions or arrays of functions to run when the promise is resolved
	 * @chainable 
	 */

	/**
	 * @method fail
	 * @description Adds callbacks to the failure list
	 * @param {Function|Array} failCallbacks Takes any number of functions or arrays of functions to run when the promise is rejected
	 * @chainable 
	 */
	
	/**
	 * @method always
	 * @description Adds callbacks to both the failure and the success lists
	 * @param {Function|Array} callbacks Takes any number of functions or arrays of functions to run when the promise is rejected or resolved
	 * @chainable 
	 */
	
	/**
	 * @method resolve
	 * @description Resolves the <strong>current</strong> promise and notifies all callbacks
	 * @param {Object} o Any number of arguments that will be passed to the success callbacks
	 * @chainable
	 */

	/**
	 * @method reject
	 * @description Rejects the <strong>current</strong> promise and notifies all callbacks
	 * @param {Object} o Any number of arguments that will be passed to the failure callbacks
	 * @chainable
	 */
	/**
	 * @method _notify
	 * @description Notifies the success or failure callbacks
	 * @param {Boolean} success Whether to notify the success or failure callbacks
	 * @param {Array} args A list of arguments to pass to the callbacks
	 * @param {Object} thisp Context to apply to the callbacks
	 * @chainable
	 * @private
	 */
	
$Array.each(['done', 'fail', 'always', 'resolve', 'reject', '_notify'], function (method) {
	Deferred.prototype[method] = Promise.prototype[method];
});

$.Deferred = Deferred;