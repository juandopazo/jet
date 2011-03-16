
var domReady = function (fn, lib, _doc) {
	_doc = _doc || doc;
	if (_doc.body) {
		fn.call(doc, lib);
	} else {
		setTimeout(function () {
			domReady(fn, lib, _doc);
		}, 13);
	}
};

var mix = function (a, b, overwrite) {
	a = a || {};
	b = b || {};
	for (var x in b) {
		if (b.hasOwnProperty(x) && (!a[x] || overwrite)) {
			a[x] = b[x];
		}
	}
	return a;
};

/**
 * Loads scripts and CSS files.
 * Included in the jet() core
 * @class Get
 * @static
 */
var Get = function (conf) {
	
	var doc = this._doc = conf.doc;
	var before = Lang.isString(conf.before) ? doc.getElementById(conf.before) : conf.before;
	this._head = doc.getElementsByTagName('head')[0];
	this._before = before || conf.before;
	
};
Get.prototype = {
	/**
	 * Loads a script asynchronously
	 * @method script
	 * @param {String} url
	 * @chainable
	 */
	script: function (url, keep) {
		var script = this._create('script', {
			type: 'text/javascript',
			asyng: true,
			src: url
		});
		this._insert(script);
		if (!keep) {
			setTimeout(function () {
				
				//Added src = null as suggested by Google in 
				//http://googlecode.blogspot.com/2010/11/instant-previews-under-hood.html
				script.src = null;
				if (script.parentNode) {
					script.parentNode.removeChild(script);
				}
			}, 10000);
		}
		return this;
	},
	/**
	 * Loads a CSS file
	 * @method css
	 * @param {String} url
	 * @chainable
	 */
	css: function (url, callback) {
		callback = callback || function() {};
		var node = this._create('link', {
			type: 'text/css',
			rel: 'stylesheet',
			href: url
		});
		var interval, count = 0, stylesheets = this._doc.styleSheets;
		this._insert(node);
		if (UA.ie) {
			node.onreadystatechange = function () {
				var readyState = this.readyState;
				if (readyState === 'loaded' || readyState === 'complete') {
					this.onreadystatechange = null;
					callback(node);
				}
			};
		} else if (UA.webkit) {
			url = node.href;
			interval = setInterval(function () {
				for (var i = 0, length = stylesheets.length; i < length; i++) {
					if (stylesheets[i].href == url) {
						clearInterval(interval);
						callback(node);
						break;
					}
				}
				if (++count == 100) {
					clearInterval(interval);
					callback(node);
				}
			}, 50);
		} else {
			if (Lang.isFunction(callback)) {
				setTimeout(callback, 80);
			}
		}
		return this;
	},
	
	_create: function (name, attrs) {
		var node = this._doc.createElement(name);
		Hash.each(attrs, function (attr, val) {
			node[attr] = val;
		});
		return node;
	},
	
	_insert: function (node) {
		this._refresh();
		var before = this._before;
		if (before && !Lang.isString(before)) {
			before.parentNode.insertBefore(node, before);
		} else {
			this._head.appendChild(node);
		}
	},
	
	_refresh: function () {
		var doc = this._doc;
		var before = this._before;
		if (!this._head) {
			this._head = doc.getElementsByTagName('head')[0];
		}
		if (Lang.isString(before)) {
			this._before = doc.getElementById(before) || before;
		}
	}
};
