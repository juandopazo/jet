
/**
 * Core methods
 * @class $
 * @static
 */
function buildJet(config) {
	
	/**
	 * Walks through the DOM tree starting in th branch that derives from node
	 * @method walkTheDOM
	 * @param {HTMLElement} node
	 * @param {Function} fn
	 */
	function walkTheDOM(node, fn) {
		fn(node);
		node = node.firstChild;
		while (node) {
			if (node.nodeType != 3 && walkTheDOM(node, fn) === false) {
				return;
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
		root = !root ? $.config.doc :
				root instanceof $.NodeList ? root.getDOMNode() :
				root;
		if (Lang.isString(query)) {
			query = $.find(query, root);
			query = new $.NodeList(Lang.isValue(query) ? query : []);
		} else {
			query = new $.NodeList(query);
		}
		return query;
	};
	
	var Env = namespace(jet, 'Env');
	
	function add(o) {
		mix($, o, true);
	}
	
	if (config.win.JSON) {
		$.JSON = config.win.JSON;
	}
	
	function guid() {
		return ['jet', Lang.now(), Env.guidCount++].join('_');
	}
	Env.guidCount = 0;
	
	add({
		/**
		 * A wrapper for setTimeout that allows you to optionally set a context to the callback
		 * @method wait
		 * @param {Number} ms Milliseconds to wait
		 * @param {Object} [context] Context to apply to the callback
		 * @param {Function} callback
		 * @chainable
		 */
		wait: function (ms, context, callback) {
			if (arguments.length === 2) {
				callback = context;
				context = null;
			}
			var args = Array.prototype.slice.call(arguments, 3);
			setTimeout(function () {
				callback.apply(context, args);
			}, ms);
			return this;
		},
		
		/**
		 * Returns a unique id with the following signature: 'jet_' + Date.now() + '_' + counter
		 * @return {String}
		 */
		guid: guid,
		
		/**
		 * Checks if a certain object is an instance of a certain constructor
		 * Wrapper for the instanceof operator which leaks when used on the global object
		 * @param {Object} obj Object to check
		 * @param {Function} constructor
		 * @return {Boolean}
		 */
		instanceOf: function(o, type) {
			return !!(o && o.hasOwnProperty && (o instanceof type));
		},
		
		/**
		 * Returns a new function bounded to the provided context
		 * See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
		 * @param {Object} context
		 * @param {Any} [extraArgs...] Extra arguments to pass to the resulting function
		 */
		bind: bind,
		
		/**
		 * Checks if a certain object exists as a property of $ and if not, it creates it
		 * @param {String} ns A property name or multiple properties separated by dots. ie: some.inner.namespace
		 * @return {Object}
		 */
		namespace: function (ns) {
			return namespace($, ns);
		},
		
		/**
		 * Does all the work behind the $() function
		 * You shouldn't overwrite it unless you know what you're doing
		 * @protected 
		 * @param {String} query
		 * @param {HTMLElement|Document} root
		 */
		find: function (query, root) {
			root = root || $.config.doc;
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

			if (!s || !r) {
				throw new Error("extend failed, verify dependencies");
			}
		
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
		
		/**
		 * Creates a copy of the provided object
		 * @method clone
		 * @param {Object} o
		 * @param {Boolean} deep. If true, all properties are cloned recursively
		 */
		clone: clone,
		
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
		
		/**
		 * Parsed Jet configuration object
		 * @property config
		 * @type {Object}
		 */
		config: config,
		
		UA: UA
		
	});
	
	$.Get = new Get(config);
	
	return $;
};