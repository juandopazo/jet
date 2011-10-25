
/**
 * Returns a promise for a (possibly) asynchronous call.
 * Calls a given function that receives the new promise as parameter and must call resolve()
 * or reject() at a certain point
 * @method defer
 * @for $
 * @param {Function} fn A function that encloses an async call.
 * @return Promise
 */
$.defer = function (fn, context) {
	var promise = new $.Promise();
	fn.call($, promise);
	return promise;
};

/**
 * Returns a promise that will be resolved a number of milliseconds later
 * @method delay
 * @for $
 * @param {Number} ms Milliseconds to wait
 * @return {Promise}
 */
/**
 * Returns a promise that will be resolved a number of milliseconds later
 * @method delay
 * @for Promise
 * @param {Number} ms Milliseconds to wait
 * @return {Promise}
 */
$.delay = $.Promise.prototype.delay = function (ms) {
	return this.defer(function (promise) {
		setTimeout(function () {
			promise.resolve();
		}, ms);
	});
};

/**
 * Calls a number of functions separated by a certain time
 * @method queue
 * @for $
 * @param {Array} fns Array of functions to add to the queue
 * @param {Number} ms Milliseconds to wait between each function call
 * @return {Promise}
 */
$.queue = function (fns, ms) {
	ms = ms || 10;
	if (!Lang.isArray(fns)) {
		fns = [fns];
	}
	var promise = this;
	$Array.forEach(fns, function (fn) {
		promise = promise.delay(ms).then(fn);
	});
	return promise;
};

/**
 * @method when
 * @for $
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