
/**
 * Methods for working with asynchronous calls
 * @class jet~deferred
 * @static
 */

/**
 * Returns a promise for a (possibly) asynchronous call.
 * Calls a given function that receives the new promise as parameter and must call resolve()
 * or reject() at a certain point
 * @method defer
 * @param {Function} fn A function that encloses an async call.
 * @return Promise
 */
$.defer = function (fn, context) {
	var promise = new $.Promise();
	fn.call($, promise);
	return promise;
};

$.wait = $.Promise.prototype.wait = function (ms) {
	return this.defer(function (promise) {
		setTimeout(function () {
			promise.resolve();
		}, ms);
	});
};

$.queue = function (fns, ms) {
	ms = ms || 10;
	if (!Lang.isArray(fns)) {
		fns = [fns];
	}
	var promise = this;
	$Array.forEach(fns, function (fn) {
		promise = promise.wait(ms).then(fn);
	});
	return promise;
};

/**
 * @method when
 * @description Waits for a series of asynchronous calls to be completed
 * @param {Deferred|Array} deferred Any number of Deferred instances or arrays of instances
 * @return Promise
 */
$.when = $.Promise.prototype.when = function () {
	var deferreds = $Array.flatten(SLICE.call(arguments)),
		args = [],
		i = 0,
		resolved = 0,
		rejected = 0;
			
	return this.defer(function (promise) {
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
			deferreds[i].end(done, fail);
			i++;
		}		
	});
};