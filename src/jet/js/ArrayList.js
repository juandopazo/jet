var ArrayMethods,
	ArrayHelperMethods,
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
	 * Creates a new ArrayList with the results of calling a provided function on every element in this array
	 * @method map
	 * @param {Function} callback Function that produces an element of the new Array from an element of the current one
	 * @param {Object} thisp Object to use as 'this' when executing 'callback'
	 * @return ArrayList
	 */
	map: function (fn, thisp) {
		var results = [];
		_Array.forEach(this._items, function (item) {
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
	 * @method item
	 * @description Returns the nth element of the current list
	 * @param {Number} nth
	 * @return ArrayList
	 */
	item: function (index) {
		return this._items[index || 0];
	},
	/** Returns a new ArrayList combining the given ArrayList(s) 
	  * @method concat
	  * @param {ArrayList | Array} valueN Arrays/ArrayLists and/or values to
	  * concatenate to the resulting ArrayList
	  * @return {ArrayList} A new ArrayList comprised of this ArrayList joined with the input.
	  */
	concat: function () {
		var args = [],
			length = arguments.length,
			i = 0;
		
		for (; i < length; i++) {
			if (arguments[i] && arguments[i]._items) {
				args[args.length] = arguments[i]._items;
			} else {
				args[args.length] = arguments[i];
			}
		}
		
		return new this.constructor(AP.apply(this._items, args));
	}
};

ArrayMethods = {
	/** Removes the first last from the ArrayList and returns it.
	  * @method pop
	  * @return {Object} The last item in the ArrayList.
	  */
	pop: 0,
	/** Adds the given Node(s) to the end of the ArrayList. 
	  * @method push
	  * @param {Node | DOMNode} nodes One or more nodes to add to the end of the ArrayList. 
	  */
	push: 0,
	/** Removes the first item from the ArrayList and returns it.
	  * @method shift
	  * @return {Object} The first item in the ArrayList.
	  */
	shift: 0,
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
	slice: 1,
	/** Changes the content of the ArrayList, adding new elements while removing old elements.
	  * @method splice
	  * @param {Number} index Index at which to start changing the array. If negative, will begin that many elements from the end.
	  * @param {Number} howMany An integer indicating the number of old array elements to remove. If howMany is 0, no elements are removed. In this case, you should specify at least one new element. If no howMany parameter is specified (second syntax above, which is a SpiderMonkey extension), all elements after index are removed.
	  * {Node | DOMNode| element1, ..., elementN 
	  The elements to add to the array. If you don't specify any elements, splice simply removes elements from the array.
	  * @return {ArrayList} The element(s) removed.
	  */
	splice: 0,
	/** Adds the given Node(s) to the beginning of the ArrayList. 
	  * @method push
	  * @param {Object} nodes One or more nodes to add to the ArrayList. 
	  */
	unshift: 0
};

ArrayHelperMethods = {
	/**
	 * @method indexOf
	 * @description Returns the index of the searched item or -1 if it didn't find it
	 * @param {Object} item Some object
	 * @return Number
	 */
	indexOf: 2,
	/**
	 * Returns a new ArrayList with only the elements for which the provided function returns true
	 * @method filter
	 * @param {Function} fn
	 * @return ArrayList
	 */
	filter: 1,
	/**
	 * Iterates through the ArrayList
	 * The callback is passed a reference to the element and an iteration index. 
	 * @method forEach
	 * @param {Function} callback
	 * @chainable
	 */
	forEach: 0
};

Hash.each(ArrayMethods, function (method, returnArrayList) {
	
	ARRAYLIST_PROTO[method] = function () {
		var ret = AP[method].apply(this._items, arguments);
		return returnArrayList ? new (this.constructor)(ret) : ret;
	};
	
});

Hash.each(ArrayHelperMethods, function (method, returnType) {
	
	ARRAYLIST_PROTO[method] = function () {
		var result = _Array[method].apply(null, [this._items].concat(AP.slice.call(arguments)));
		return returnType === 0 ? this :
				returnType === 1 ? new (this.constructor)(result) :
				result;
	};
	
});

ARRAYLIST_PROTO.each = ARRAYLIST_PROTO.forEach;
