
/**
 * Core methods
 * @class Core
 * @static
 */
function buildJet(config) {
	
	/**
	 * Walks through the DOM tree starting in th branch that derives from node
	 * @method walkTheDOM
	 * @param {HTMLElement} node
	 * @param {Function} fn
	 */
	var walkTheDOM = function (node, fn) {
		fn(node);
		node = node.firstChild;
		while (node) {
			if (node.nodeType != 3) {
				walkTheDOM(node, fn);
			}
			node = node.nextSibling;
		}
	};
	
	/*
	 * Rudimentary getElementsByClassName based on by Douglas Crockford's
	 * https://docs.google.com/viewer?url=http://javascript.crockford.com/hackday.ppt&pli=1
	 */
	var getByClass = function (className, root) {
		if (root.getElementsByClassName) {
			getByClass = function (className, root) {
				return root.getElementsByClassName(className);
			};
		} else {
			getByClass = function (className, root) {
				var result = [];
				walkTheDOM(root, function (node) {
					var a, c = node.className, i;
					if (c && _Array.indexOf(c.split(' '), className) > -1) {
						result[result.length] = node;
					}
				});
				return result;
			};
		}
		return getByClass(className, root);
	};
	
	/**
	 * The global object is a finder method that finds HTML elements.
	 * The query string allows for different simple searches: "#foo" (get elemnet by id), ".foo" (gets elements by class), "foo" (get elements by tag) or an array of html elements
	 * For more complex queries, take a look at the Sizzle module
	 * @method $
	 * @param {String|HTMLElement|Array} query
	 * @param {HTMLElement|Document} root
	 * @return {NodeList}
	 */
	// @TODO: consider moving this to the Node module
	var $ = function Jet(query, root) {
		root = root || $.context;
		root = root.ownerDocument || root;
		if (Lang.isString(query)) {
			query = $.find(query, root);
			query = new $.NodeList(Lang.isValue(query) ? query : []);
		} else {
			query = new $.NodeList(query);
		}
		return query;
	};
	
	function add(o) {
		mix($, o, true);
	}
	
	if (config.win.JSON) {
		$.JSON = config.win.JSON;
	}
	
	add({
		bind: bind,
		
		namespace: bind(namespace, $),
		
		/**
		 * A pointer to the last Windo that was referenced by the $() function
		 * @property win
		 */
		win: config.win,
		/**
		 * A pointer to the last Document that was referenced by the $() function.
		 * @property context
		 */
		context: config.doc,
		
		/**
		 * Does all the work behind the $() function
		 * You shouldn't overwrite it unless you know what you're doing
		 * @protected 
		 * @param {String} query
		 * @param {HTMLElement|Document} root
		 */
		find: function (query, root) {
			root = root || $.context;
			var c = query.charAt(0), test, node = null;
			if (c === '<' && query.charAt(query.length - 1) === '>') {
				if (query.match(/</g).length === 1) {
					// suport for '<div/>' and '<div>'
					return root.createElement(query.substr(1, query.length - (query.charAt(query.length - 2) === '/' ? 3 : 2)));
				} else {
					// Check for strings like "<div><span><a/></span></div>"
					test = query.match(/<([a-z]+)>(.+)<\/([a-z]+)>/i);
					if (test.length == 4 && test[1] == test[3]) {
						node = root.createElement(test[1]);
						node.innerHTML = test[2];
					}
					return node;
				}
			} else {
				return c === '#' ? root.getElementById(query.substr(1)) : 
					   c === '.' ? getByClass(query.substr(1), root) :
					   root.getElementsByTagName(query);
			}
		},
		
		/**
		 * Allows for an inheritance strategy based on prototype chaining.
		 * When exteiding a class with extend, you keep all prototypic methods from all superclasses
		 * @method extend
		 * @param {Function} subclass
		 * @param {Function} superclass
		 * @param {Hash} px optional - An object literal with methods to overwrite in the subclass' prototype
		 * @param {Hash} ax optional - An object literal with properties to add to the subclass' constructor
		 */
		extend: function (r, s, px, ax) {

			/*if (!s || !r) {
				$.error("extend failed, verify dependencies");
			}*/
		
			var sp = s.prototype, rp = $.Object(sp);
			r.prototype = rp;
		
			rp.constructor = r;
			r.superclass = sp;
		
			// assign constructor property
			if (s != Object && sp.constructor == OP.constructor) {
				sp.constructor = s;
			}
		
			// add prototype overrides
			if (px) {
				$.mix(rp, px, true);
			}
			// add attributes
			if (ax) {
				$.mix(r, ax, true);
			}
			
			return r;
		},
		
		clone: function clone(o, deep) {
			var n;
			if (Lang.isArray(o)) {
				n = [].concat(o);
				if (deep) {
					_Array.each(n, function (val, i) {
						n[i] = deep ? $.clone(val, deep) : val;
					});
				}
			} else if (o.hasOwnProperty && Lang.isObject(o, true)) {
				n = {};
				Hash.each(o, function (prop, val) {
					n[prop] = deep ? clone(val, deep) : val;
				});
			} else {
				n = o;
			}
			return n;
		},
		
		/**
		 * Copies all properties from B to A.
		 * Doesn't overwrite properties unless the overwrite parameter is true
		 * @method mix
		 * @param {Object} A
		 * @param {Object} B
		 * @param {Boolean} [overwrite]
		 */
		mix: mix,
		
		/**
		 * Adds properties to the $ object (shortcut for adding classes)
		 * @method add
		 * @param {Object} key/value pairs of class/function names and definitions
		 */
		add: add,
		
		walkTheDOM: walkTheDOM,
		
		Lang: Lang,
		
		'Array': _Array,
		
		ArrayList: ArrayList,
		
		Hash: Hash,
		
		'Object': Hash,
		
		config: config,
		
		UA: UA
		
	});
	
	$.Get = new Get(config);
	
	return $;
};