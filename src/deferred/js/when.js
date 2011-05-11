
/**
 * A method to wait for a series of asynchronous calls to be completed
 * @class jet~when
 * @static
 */
/**
 * @method when
 * @description Waits for a series of asynchronous calls to be completed
 * @param {Deferred, Array} deferred Any number of Deferred instances or arrays of instances
 * @return {Deferred} deferred A Deferred instance
 */
$.when = function () {
	var deferreds = $_Array.spread(arguments),
		args = [],
		i = 0,
		resolved = 0,
		rejected = 0,
		deferred = new Deferred();
			
	return deferred.promise(function (promise) {
		function notify() {
			if (rejected > 0) {
				promise.reject(args);
			} else {
				promise.resolve(args);
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