
var createNode = function (name, attrs, s, docum) {
	docum = docum || doc;
	var node = docum.createElement(name);
	Hash.each(attrs, function (attr, val) {
		node[attr] = val;
	});
	Hash.each(s, function (name, val) {
		node.style[name] = val;
	});
	return node;
};

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

var getCurrentStyle = function (node, _win) {
	_win = _win || window;
	return _win.getComputedStyle ? _win.getComputedStyle(node, null) : 
					node.currentStyle ? node.currentStyle : {};
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
var GetFactory = function (conf) {
	
	this._doc = conf.doc;
	this._head = conf.doc.getElementsByTagName('head')[0];
	this._before = conf.before ? conf.doc.getElementById(conf.before) : null;
	this._before = this._before || conf.before;
	
};
GetFactory.prototype = {
	/**
	 * Loads a script asynchronously
	 * @method script
	 * @param {String} url
	 */
	script: function (url, keep) {
		this._refresh();
		var script = createNode("script", {
			type: "text/javascript",
			asyng: true,
			src: url
		}, {}, this._doc);
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
	},
	/**
	 * Loads a CSS file
	 * @method css
	 * @param {String} url
	 */
	css: function (url) {
		this._refresh();
		var node = createNode("link", {
			type: "text/css",
			rel: "stylesheet",
			href: url
		}, {}, this._doc);
		this._insert(node);
		return this;
	},
	
	_insert: function (node) {
		var before = this._before;
		if (before && !Lang.isString(before)) {
			before.parentNode.insertBefore(node, before);
		} else {
			this._head.appendChild(node);
		}
	},
	
	_refresh: function () {
		this._head = this._head || this._doc.getElementsByTagName('head')[0];
		if (Lang.isString(this._before)) {
			this._before = this._doc.getElementById(this._before) || this._before;
		}
	}
}