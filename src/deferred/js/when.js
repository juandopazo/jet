
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
	var deferred = new $.Deferred();
	return deferred.defer(fn, context);
};

/**
 * @method when
 * @description Waits for a series of asynchronous calls to be completed
 * @param {Deferred|Array} deferred Any number of Deferred instances or arrays of instances
 * @return Promise
 */
$.when = function () {
	var deferreds = $Array._spread(SLICE.call(arguments)),
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
			deferreds[i].end(done, fail);
			i++;
		}		
	});
};