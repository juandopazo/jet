/**
 * A collection of elements
 * @class ArrayList
 * @constructor
 * @param {Array|Object} items An element or an array of elements 
 */
var ArrayList = function (items) {
	this._items = !Lang.isValue(items) ? [] : Lang.isArray(items) ? items : [items];
}
ArrayList.prototype = {
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
		ArrayHelper.forEach(this._items, fn, thisp);
		return this;
	},
	/**
	 * Creates a new ArrayList with the results of calling a provided function on every element in this array
	 * @method map
	 * @param {Function} callback Function that produces an element of the new Array from an element of the current one
	 * @param {Object} thisp Object to use as 'this' when executing 'callback'
	 * @return ArrayList
	 */
	map: function (fn, thisp) {
		return new (this.constructor)(ArrayHelper.map(this._items, fn, thisp));
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
	 * @method eq
	 * @description Returns a new ArrayList with the nth element of the current list
	 * @param {Number} nth
	 * @return ArrayList
	 */
	item: function (index) {
		return new (this.constructor)([this._items[index]]);
	}
};

ArrayList.prototype.each = ArrayList.prototype.forEach;
