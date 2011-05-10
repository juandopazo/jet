
$.when = function () {
	var deferreds = SLICE.call(arguments),
		args = [],
		i = 0,
		resolved = 0,
		rejected = 0,
		deferred = new Deferred();
		
	function notify() {
		if (rejected > 0) {
			deferred.reject(args);
		} else {
			deferred.resolve(args);
		}
	}
		
	function resolve() {
		resolved++;
		if (resolved + rejected == deferreds.length) {
			notify();
		}
	}
	
	function fail() {
		rejected++;
		if (resolved + rejected == deferreds.length) {
			notify();
		}
	}

	while (i < deferreds.length) {
		if (args[i] && Lang.isFunction(args[i].then)) {
			args[i].then(resolve, fail);
			i++;
		} else {
			args.splice(i, 1);
		}
	}		
	
	return deferred;
};