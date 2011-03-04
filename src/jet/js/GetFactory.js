
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
	
	/**
	 * Loads a script asynchronously
	 * @method script
	 * @param {String} url
	 */
	this.script = function (url, keep) {
		domReady(function () {
			var head = conf.doc.getElementsByTagName('head')[0];
			var script = createNode("script", {
				type: "text/javascript",
				asyng: true,
				src: url
			}, {}, conf.doc);
			head.appendChild(script);
			if (!keep) {
				setTimeout(function () {
					
					//Added src = null as suggested by Google in 
					//http://googlecode.blogspot.com/2010/11/instant-previews-under-hood.html
					script.src = null;
					head.removeChild(script);
				}, 10000);
			}
		}, null, conf.doc);
	};
	/**
	 * Loads a CSS file
	 * @method css
	 * @param {String} url
	 */
	this.css = function (url) {
		domReady(function () {
			conf.doc.getElementsByTagName('head')[0].appendChild(createNode("link", {
				type: "text/css",
				rel: "stylesheet",
				href: url
			}, {}, conf.doc));
		}, null, conf.doc);
	};
};