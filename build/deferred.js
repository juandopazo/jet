/**
 * Provides an extension that makes a class deferrable
 * @module deferred
 * @requires oop
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

/*
 * Turns a value into an array with the value as its first element, or takes an array and spreads
 * each array element into elements of the parent array
 * @param {Object|Array} args The value or array to spread
 * @return Array
 * @private
 */
$_Array.spread = function (args) {
	args = !args ? [] :
			args.length ? SLICE.call(args) :
			[args];
	var i = 0;
	while (i < args.length) {
		if (Lang.isArray(args[i])) {
			AP.splice.apply(args, [i, 1].concat(args[i]));
		} else if (!Lang.isValue(args[i])) {
			args.splice(i, 1);
		} else {
			i++;
		}
	}
	return args;
};

	
/**
 * A promise keeps two lists of callbacks, one for the success scenario and another for the failure case.
 * It runs these callbacks once a call to resolve() or reject() is made
 * @class Promise
 * @constructor
 * @param {Function|Array} doneCallbacks A function or array of functions to run when the promise is resolved
 * @param {Function|Array} failCallbacks A function or array of functions to run when the promise is rejected
 */
function Promise(config) {
	config = config || {};
	this._config = config;
	this._done = [];
	this._fail = [];
	this.resolved = false;
	this.rejected = false;
}
Promise.prototype = {
	
	/**
	 * @method then
	 * @description Adds callbacks to the list of callbacks tracked by the promise
	 * @param {Function|Array} doneCallbacks A function or array of functions to run when the promise is resolved
	 * @param {Function|Array} failCallbacks A function or array of functions to run when the promise is rejected
	 * @chainable
	 */
	then: function (doneCallbacks, failCallbacks) {
		doneCallbacks = $_Array.spread(doneCallbacks);
		failCallbacks = $_Array.spread(failCallbacks);
		var resolved = this.resolved,
			rejected = this.rejected;
		if (resolved) {
			this._notify(doneCallbacks, this._args || [], this);
		} else if (!rejected){
			PUSH.apply(this._done, doneCallbacks);
		}
		if (rejected) {
			this._notify(failCallbacks, this._args || [], this);
		} else if (!resolved){
			PUSH.apply(this._fail, failCallbacks);
		}
		return this;
	},
	
	/**
	 * @method done
	 * @description Adds callbacks to the success list
	 * @param {Function|Array} doneCallbacks Takes any number of functions or arrays of functions to run when the promise is resolved
	 * @chainable 
	 */
	done: function () {
		return this.then(arguments);
	},
	
	/**
	 * @method fail
	 * @description Adds callbacks to the failure list
	 * @param {Function|Array} failCallbacks Takes any number of functions or arrays of functions to run when the promise is rejected
	 * @chainable 
	 */
	fail: function () {
		return this.then(null, arguments);
	},
	
	/**
	 * @method always
	 * @description Adds callbacks to both the failure and the success lists
	 * @param {Function|Array} callbacks Takes any number of functions or arrays of functions to run when the promise is rejected or resolved
	 * @chainable 
	 */
	always: function () {
		return this.then(arguments, arguments);
	},
	
	/**
	 * @method resolve
	 * @description Resolves the promise and notifies all callbacks
	 * @param {Object} o Any number of arguments that will be passed to the success callbacks
	 * @chainable
	 */
	resolve: function () {
		return this.resolveWith(this, arguments);
	},
	
	/**
	 * @method reject
	 * @description Rejects the promise and notifies all callbacks
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
		this.resolved = true;
		this._args = args;
		return this._notify(this._done, args, context);
	},
	
	/**
	 * @method rejectWith
	 * @description Rejects the promise and notifies all callbacks
	 * @param {Object} context The object to use as context for the callbacks
	 * @param {Array} args A list of arguments that will be passed to the failure callbacks
	 * @chainable
	 */
	rejectWith: function (context, args) {
		this.rejected = true;
		this._args = args;
		return this.notify(this._fail, args, context);
	},
	
	/**
	 * @method notify
	 * @description Notifies the success or failure callbacks
	 * @param {Boolean} success Whether to notify the success or failure callbacks
	 * @param {Array} args A list of arguments to pass to the callbacks
	 * @param {Object} thisp Context to apply to the callbacks
	 * @chainable
	 */
	_notify: function (callbacks, args, thisp) {
		var length = callbacks.length,
			i = 0;
		for (; i < length; i++) {
			callbacks[i].apply(thisp, args);
		}
		return this;
	},
	
	defer: function (callback, context) {
		var promise = new this.constructor(this._config, true);
		this.then($.bind(callback, context || this, promise));
		return promise;
	}
	
};/**
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
	 * @param {Function|Array} doneCallbacks A function or array of functions to run when the promise is resolved
	 * @param {Function|Array} failCallbacks A function or array of functions to run when the promise is rejected
	 * @chainable
	 */
	then: function (doneCallbacks, failCallbacks) {
		if (doneCallbacks || failCallbacks) {
			if (this._promise) {
				this._promise.then(doneCallbacks, failCallbacks);
			} else {
				this._notify(doneCallbacks);
			}
		}
		return this;
	},

	/**
	 * @method done
	 * @description Adds callbacks to the success list
	 * @param {Function|Array} doneCallbacks Takes any number of functions or arrays of functions to run when the promise is resolved
	 * @chainable 
	 */
	done: PROMISE_PROTO.done,

	/**
	 * @method fail
	 * @description Adds callbacks to the failure list
	 * @param {Function|Array} failCallbacks Takes any number of functions or arrays of functions to run when the promise is rejected
	 * @chainable 
	 */
	fail: PROMISE_PROTO.fail,
	
	/**
	 * @method always
	 * @description Adds callbacks to both the failure and the success lists
	 * @param {Function|Array} callbacks Takes any number of functions or arrays of functions to run when the promise is rejected or resolved
	 * @chainable 
	 */
	always: PROMISE_PROTO.always,
	
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
	_notify: PROMISE_PROTO.notify,
	
	isResolved: function () {
		return this._currPromise.isResolved();
	},
	
	isRejected: function () {
		return this._currPromise.isRejected();
	}
	
};

$.Deferred = Deferred;
/**
 * A method to wait for a series of asynchronous calls to be completed
 * @class jet~when
 * @static
 */
$.defer = function (fn, context) {
	var promise = new Promise();
	fn.call(context, promise);
	return promise;
};
/**
 * @method when
 * @description Waits for a series of asynchronous calls to be completed
 * @param {Deferred|Array} deferred Any number of Deferred instances or arrays of instances
 * @return {Deferred} deferred A Deferred instance
 */
$.when = function () {
	var deferreds = $_Array.spread(arguments),
		args = [],
		i = 0,
		resolved = 0,
		rejected = 0;
			
	return $.defer(function (promise) {
		function notify() {
			if (rejected > 0) {
				promise.rejectWith(promise, args);
			} else {
				promise.resolveWith(promise, args);
			}
		}
			
		function done() {
			args.push(SLICE.call(arguments));
			resolved++;
			if (resolved + rejected == deferreds.length) {
				notify();
			}
		}
		
		function fail() {
			args.push(SLICE.call(arguments));
			rejected++;
			if (resolved + rejected == deferreds.length) {
				notify();
			}
		}

		while (i < deferreds.length) {
			deferreds[i].then(done, fail);
			i++;
		}		
	});
};
			
});
