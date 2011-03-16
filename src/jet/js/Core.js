
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
					if (c && ArrayHelper.indexOf(className, c.split(" ")) > -1) {
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
		if (Lang.isString(query)) {
			root = query.substr(0, 1) == '#' && root.ownerDocument ? root.ownerDocument : root;
			query = $.parseQuery(query, root);
			query = !Lang.isValue(query) ? new $.NodeList([]) : new $.NodeList(query);
		} else {
			query = new $.NodeList(query);
		}
		return query;
	};
	
	var add = function (o) {
		mix($, o, true);
	};
	
	if (config.win.JSON) {
		$.JSON = config.win.JSON;
	}
	
	add({
		bind: bind,
		
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
		parseQuery: function (query, root) {
			root = root || $.context;
			var c = query.substr(0, 1), test, node;
			if (c == "<") {
				if (query.match(/</g).length == 1) {
					return root.createElement(query.substr(1, query.length - 3));
				} else {
					/*
					 * Check for strings like "<div><span><a/></span></div>"
					 */
					test = query.match(new RegExp("<([a-z]+)>(.+)<\/([a-z]+)>", "i"));
					node = null;
					if (test.length == 4 && test[1] == test[3]) {
						node = root.createElement(test[1]);
						node.innerHTML = test[2];
					} else {
						$.error("Wrong element creation string");
					}
					return node;
				}
			} else {
				return c == "#" ? root.getElementById(query.substr(1)) : 
					   c == "." ? getByClass(query.substr(1), root) :
					   root.getElementsByTagName(query);
			}
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
		 * @param {Hash} key/value pairs of class/function names and definitions
		 */
		add: add,
		
		walkTheDOM: walkTheDOM,
		
		Lang: Lang,
		
		"Array": ArrayHelper,
		
		Hash: Hash,
		
		config: config,
		
		UA: UA
		
	});
	
	$.Get = new Get(config);
	
	return $;
};