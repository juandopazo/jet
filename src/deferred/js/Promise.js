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
function Promise(doneCallbacks, failCallbacks) {
	this._done = this._spread(doneCallbacks);
	this._fail = this._spread(failCallbacks);
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
		PUSH.apply(this._done, $_Array.spread(doneCallbacks));
		PUSH.apply(this._fail, $_Array.spread(failCallbacks));
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
		return this.notify(true, args, context);
	},
	
	/**
	 * @method rejectWith
	 * @description Rejects the promise and notifies all callbacks
	 * @param {Object} context The object to use as context for the callbacks
	 * @param {Array} args A list of arguments that will be passed to the failure callbacks
	 * @chainable
	 */
	rejectWith: function (context, args) {
		return this.notify(false, args, context);
	},
	
	/**
	 * @method notify
	 * @description Notifies the success or failure callbacks
	 * @param {Boolean} success Whether to notify the success or failure callbacks
	 * @param {Array} args A list of arguments to pass to the callbacks
	 * @param {Object} thisp Context to apply to the callbacks
	 * @chainable
	 */
	notify: function (success, args, thisp) {
		var callbacks = success ? this._done : this._fail,
			length = callbacks.length,
			i = 0;
		for (; i < length; i++) {
			callbacks[i].apply(thisp, args);
		}
		return this;
	}
	
};