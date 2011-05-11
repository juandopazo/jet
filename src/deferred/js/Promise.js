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
	},
	
	then: function (doneCallbacks, failCallbacks) {
		PUSH.apply(this._done, this._spread(doneCallbacks));
		PUSH.apply(this._fail, this._spread(failCallbacks));
		return this;
	},
	
	done: function () {
		return this.then(arguments);
	},
	
	fail: function () {
		return this.then(null, arguments);
	},
	
	resolve: function () {
		return this.resolveWith(this, arguments);
	},
	
	reject: function () {
		return this.rejectWith(this, arguments);
	},
	
	resolveWith: function (context, args) {
		return this._notify(true, args, context);
	},
	
	rejectWith: function (context, args) {
		return this._notify(false, args, context);
	},
	
	_notify: function (success, args, thisp) {
		var callbacks = success ? this._done : this._fail,
			length = callbacks.length,
			i = 0;
		for (; i < length; i++) {
			callbacks[i].apply(thisp, args);
		}
		return this;
	}
	
};