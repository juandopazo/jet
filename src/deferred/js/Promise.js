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