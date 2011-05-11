
function Deferred() {}
Deferred.prototype = {
	
	then: function (doneCallbacks, failCallbacks) {
		if (this._promise) {
			this._promise.then(doneCallbacks, failCallbacks);
		} else {
			this._notify(doneCallbacks);
		}
		return this;
	},
	
	done: Promise.prototype.done,
	
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
	
	resolve: function () {
		var promise = this._currPromise;
		if (promise) {
			promise.resolve.apply(promise, arguments);
		}
		return this;
	},

	reject: function () {
		var promise = this._currPromise;
		if (promise) {
			promise.reject.apply(promise, arguments);
		}
		return this;
	},
	
	_notify: Promise.prototype._notify
	
};

$.Deferred = Deferred;