var ArrayMethods,
	ARRAYLIST_PROTO;

/**
 * A collection of elements
 * @class ArrayList
 * @constructor
 * @param {Array|Object} items An element or an array of elements 
 */
function ArrayList(items) {
	this._items = !Lang.isValue(items) ? [] : Lang.isArray(items) ? items : [items];
}
ARRAYLIST_PROTO = ArrayList.prototype = {
	/**
	 * Iterates through the ArrayList
	 * The callback is passed a reference to the element and an iteration index. 
	 * The "this" keyword also refers to the node. ie:<br/>
	 * <code>$("div").each(function (node, i) {<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;if (i % 2 == 1) {<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$(node).addClass("even");<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;} else {<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$(node).addClass("odd");<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;}<br/>
	 * });</code>
	 * @method each
	 * @param {Function} callback
	 * @chainable
	 */
	forEach: function (fn, thisp) {
		_Array.forEach(this._items, fn, thisp);
		return this;
	},
	/**
	 * Creates a new ArrayList with the results of calling a provided function on every element in this array
	 * @method map
	 * @param {Function} callback Function that produces an element of the new Array from an element of the current one
	 * @param {Object} thisp Object to use as 'this' when executing 'callback'
	 * @return ArrayList
	 */
	map: function (arr, fn, thisp) {
		var results = [];
		_Array.forEach(arr || [], function (item) {
			var output = fn.call(thisp, item);
			if (Lang.isValue(output)) {
				if (Lang.isArray(output)) {
					results.push.apply(results, output);
				} else if (output instanceof ArrayList) {
					output.forEach(function (item) {
						if (_Array.indexOf(results, item) == -1) {
							results[results.length] = item;
						}
					});
				} else if (_Array.indexOf(results, output) == -1){
					results[results.length] = output;
				}
			}
		});
		return new (this.constructor)(results);
	},
	/**
	 * Returns the length of this ArrayList
	 * @method size
	 * @return Number
	 */
	size: function () {
		return this._items.length;
	},
	/**
	 * Returns a new ArrayList with only the elements for which the provided function returns true
	 * @method filter
	 * @param {Function} fn
	 * @return ArrayList
	 */
	filter: function (fn, thisp) {
		var results = [];
		this.each(function (node) {
			if (fn.call(thisp || this, node)) {
				results[results.length] = node;
			}
		});
		return new (this.constructor)(results);
	},
	/**
	 * @method item
	 * @description Returns a new ArrayList with the nth element of the current list
	 * @param {Number} nth
	 * @return ArrayList
	 */
	item: function (index) {
		return new (this.constructor)([this._items[index]]);
	},
	/**
	 * @method indexOf
	 * @description Returns the index of the searched item or -1 if it didn't find it
	 * @param {Object} item Some object
	 * @return Number
	 */
	indexOf: function (o) {
		return _Array.indexOf(this._items, o);
	}
};

ArrayMethods = {
	/** Returns a new ArrayList combining the given ArrayList(s) 
	  * @method concat
	  * @param {ArrayList | Array} valueN Arrays/ArrayLists and/or values to
	  * concatenate to the resulting ArrayList
	  * @return {ArrayList} A new ArrayList comprised of this ArrayList joined with the input.
	  */
	'concat': 1,
	/** Removes the first last from the ArrayList and returns it.
	  * @method pop
	  * @return {Object} The last item in the ArrayList.
	  */
	'pop': 0,
	/** Adds the given Node(s) to the end of the ArrayList. 
	  * @method push
	  * @param {Node | DOMNode} nodes One or more nodes to add to the end of the ArrayList. 
	  */
	'push': 0,
	/** Removes the first item from the ArrayList and returns it.
	  * @method shift
	  * @return {Object} The first item in the ArrayList.
	  */
	'shift': 0,
	/** Returns a new ArrayList comprising the Nodes in the given range. 
	  * @method slice
	  * @param {Number} begin Zero-based index at which to begin extraction.
	  As a negative index, start indicates an offset from the end of the sequence. slice(-2) extracts the second-to-last element and the last element in the sequence.
	  * @param {Number} end Zero-based index at which to end extraction. slice extracts up to but not including end.
	  slice(1,4) extracts the second element through the fourth element (elements indexed 1, 2, and 3).
	  As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence.
	  If end is omitted, slice extracts to the end of the sequence.
	  * @return {ArrayList} A new ArrayList comprised of this ArrayList joined with the input.
	  */
	'slice': 1,
	/** Changes the content of the ArrayList, adding new elements while removing old elements.
	  * @method splice
	  * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end.
	  * @param {Number} howMany An integer indicating the number of old array elements to remove. If howMany is 0, no elements are removed. In this case, you should specify at least one new element. If no howMany parameter is specified (second syntax above, which is a SpiderMonkey extension), all elements after index are removed.
	  * {Node | DOMNode| element1, ..., elementN 
	  The elements to add to the array. If you don't specify any elements, splice simply removes elements from the array.
	  * @return {ArrayList} The element(s) removed.
	  */
	'splice': 1,
	/** Adds the given Node(s) to the beginning of the ArrayList. 
	  * @method push
	  * @param {Object} nodes One or more nodes to add to the ArrayList. 
	  */
	'unshift': 0
};

Hash.each(ArrayMethods, function (method, returnArrayList) {
	
	ARRAYLIST_PROTO[method] = function () {
		var args = [],
			i = 0,
			arg,
			ret;

		while (typeof (arg = arguments[i++]) != 'undefined') { // use arraylists 
			args.push(arg._items || arg);
		}

		ret = Array.prototype[name].apply(this._items, args);

		return returnArrayList ? new (this.constructor)(ret) : ret;
	};
	
});

ARRAYLIST_PROTO.each = ARRAYLIST_PROTO.forEach;
