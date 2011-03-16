
var Lang = $.Lang,
	$_Array = $.Array;
			
var ArrayList = function (items) {
	this._items = Lang.isArray(items) ? items : Lang.isValue(items) ? [items] : [];
}
ArrayList.prototype = {
	each: function (fn, context) {
		$_Array.each(this._items, fn, context);
		return this;
	},
	add: function (val) {
		if (Lang.isValue(val) && this.indexOf(val) == -1) {
			this._items[this._items.length] = val;
		}
		return this;
	},
	indexOf: function (item) {
		return $_Array.indexOf(item, this._items);
	},
	push: function () {
		$_Array.each(SLICE.call(arguments), this.add, this);
		return this;
	},
	/**
	 * Iterates through the array list, returning a new list with all the elements
	 * return by the callback function
	 * @method map
	 * @param {Function} fn
	 * @return NodeList
	 */
	map: function (fn) {
		var construct = this.constructor;
		var results = new construct();
		var self = this;
		this.each(function (node) {
			var output = fn(node);
			if (Lang.isValue(output)) {
				if (Lang.isArray(output)) {
					results.push(output);
				} else if (output instanceof construct) {
					output.each(self.add, self);
				} else {
					results.add(output);
				}
			}
		});
		return results;
	},
	item: function (index) {
		return this._items[index];
	},
	oust: function (item) {
		$_Array.remove(item, this._items);
		return this;
	}
};			
