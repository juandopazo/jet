
$.when = function () {
	var deferreds = SLICE.call(arguments),
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