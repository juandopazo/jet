/**
 * Provides an extension that makes a class deferrable
 * @module deferred
 * @requires 
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('deferred', function ($) {

			var Lang = $.Lang,
	$_Array = $.Array,
	AP = Array.prototype,
	SLICE = AP.slice,
	PUSH = AP.push;
	
function Promise(doneCallbacks, failCallbacks) {
	this._done = this._spread(doneCallbacks);
	this._fail = this._spread(failCallbacks);
}
Promise.prototype = {
	
	_spread: function (args) {
		args = Lang.isArray(args) ? args : [args];
		var i = 0;
		while (i < args.length) {
			if (Lang.isArray(args[i])) {
				PUSH.apply(args, args[i]);
				args.splice(i, 1);
			} else if (!Lang.isValue(args[i])) {
				args.splice(i, 1);
			} else {
				i++;
			}
		}
		return args;
	},
	
	then: function (doneCallbacks, failCallbacks) {
		PUSH.apply(this._done, this._spread(doneCallbacks));
		PUSH.apply(this._fail, this._spread(failCallbacks));
		return this;
	},
	
	done: function () {
		return this.then(SLICE.call(arguments));
	},
	
	fail: function () {
		return this.then(null, SLICE.call(arguments));
	},
	
	resolve: function () {
		return this._notify(this._done, SLICE.call(arguments));
	},
	
	reject: function () {
		return this._notify(this._fail, SLICE.call(arguments));
	},
	
	resolveWith: function (thisp) {
		return this._notify(this._done, SLICE.call(arguments, 1), thisp);
	},
	
	rejectWith: function (thisp) {
		return this._notify(this._fail, SLICE.call(arguments, 1), thisp);
	},
	
	_notify: function (callbacks, args, thisp) {
		thisp = thisp || this;
		for (var i = 0, length = callbacks.length; i < length; i++) {
			callbacks[i].apply(thisp, args);
		}
		return this;
	}
	
};
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
		function switchPromise() {
			self._currPromise = promise;
		}
		if (this._promise) {
			this._promise.then([$.bind(fn, promise, promise), switchPromise], switchPromise);
		} else {
			fn.call(promise, promise);
			this._currPromise = promise;
		}
		this._promise = promise;
		return this;
	},
	
	resolve: function () {
		var promise = this._currPromise;
		if (promise) {
			promise.resolve.apply(promise, arguments);
		}
	},

	reject: function () {
		var promise = this._currPromise;
		if (promise) {
			promise.reject.apply(promise, arguments);
		}
	},
	
	_notify: Promise.prototype._notify
	
};

function TimeOut() {
	TimeOut.superclass.constructor.apply(this, arguments);
}
$.extend(TimeOut, Deferred, {
	
	set: function (time) {
		return this.promise(function (promise) {
			var timeout = setTimeout(function () {
				promise.resolve();
			}, time || 0);
			promise.fail(function () {
				clearTimeout(timeout);
			});
		});
	},
	
	abort: function () {
		this.reject();
	}
	
});
			
});
