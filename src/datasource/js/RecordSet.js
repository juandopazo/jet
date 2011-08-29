
/**
 * Returns if an object is a Record
 * @method hasInstance
 * @static
 * @param {Object} o The object to check
 */
Record.hasInstance = function (o) {
	return o instanceof Record;
};

/**
 * A collections of Records
 * @class RecordSet
 * @extends EventTarget
 * @uses 
 * @constructor
 * @param {Array} data If data is passed, it is converted into several Records
 */
var RecordSet = function (data) {
	RecordSet.superclass.constructor.call(this);
	
	this._sortedBy = false;
	this._order = null;
	this._items = A.map($.Lang.isArray(data) ? data : data ? [data] : [], function (recordData) {
		return $.instanceOf(recordData, Record) ? recordData : new Record(recordData);
	});
};
$.extend(RecordSet, $.EventTarget, {
	
	_sort: function quicksort(key, order) {
		var set = this._items;
		if (set.length <= 1) {
			return set;
		}
		var lesser = [], greater = [];
		var pivot = set.splice(Math.round(set.length / 2), 1)[0];
		var length = set.length;
		for (var i = 0; i < length; i++) {
			if (order == "asc") {
				if (set[i].get(key) <= pivot.get(key)) {
					lesser[lesser.length] = set[i];
				} else {
					greater[greater.length] = set[i];
				}
			} else {
				if (set[i].get(key) <= pivot.get(key)) {
					greater[greater.length] = set[i];
				} else {
					lesser[lesser.length] = set[i];
				}
			}
		}
		return quicksort(lesser, key, order).concat([pivot]).concat(quicksort(greater, key, order));
	},
	
	/**
	 * Replaces all records with new data
	 * @method replace
	 * @param {Array} data
	 * @chainable
	 */
	replace: function (data) {
		if (this.fire('replace', { data: data })) {
			this._items = data._items ? data._items :
						$.Lang.isArray(data) ? data : [data];
			if (this._sortedBy) {
				this.sortBy(this._sortedBy, this._order)
			}
			this.fire('afterReplace', { data: this._items });
		}
		return this;
	},
	
	getRecords: function () {
		return this._items;
	},
	
	/**
	 * Sorts the records based on a key of the data they hold
	 * @method sortBy
	 * @param {String} key The data key that will be sorted
	 * @param {String} order the order in which to sort. May be "asc" or "desc"
	 * @chainable
	 */
	sortBy: function (key, newOrder) {
		if (this.size() > 1) {
			this._items = this._sort(key, newOrder);
			this._sortedBy = key;
			this._order = newOrder;
		}
		return this;
	},
	
	getRecordById: function (id) {
		var requiredRecord;
		this.forEach(function (record) {
			if (record.getId() === id) {
				requiredRecord = record;
			}
		});
		return requiredRecord;
	}
});
$.mix(RecordSet.prototype, $.ArrayList.prototype);
