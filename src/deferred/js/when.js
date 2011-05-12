
/**
 * A method to wait for a series of asynchronous calls to be completed
 * @class jet~when
 * @static
 */
$.defer = function (fn) {
	var deferred = new Deferred();
	return deferred.promise(fn);
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
				promise.reject.apply(promise, args);
			} else {
				promise.resolve.apply(promise, args);
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