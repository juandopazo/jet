
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
 * @constructor
 * @param {Array} data If data is passed, it is converted into several Records
 */
var RecordSet = function (data) {
	RecordSet.superclass.constructor.call(this);
	var records = [];
	var sortedBy = false;
	var order;
	
	var self = this;
	
	A.each(data, function (recordData) {
		records[records.length] = new Record(recordData);
	});
	
	/**
	 * Returns all records in the set
	 * @method getRecords
	 */
	self.getRecords = function () {
		return records;
	};
			
	/**
	 * Sorts the records based on a key of the data they hold
	 * @method sortBy
	 * @param {String} key The data key that will be sorted
	 * @param {String} order the order in which to sort. May be "asc" or "desc"
	 * @chainable
	 */
	this.sortBy = function (key, newOrder) {
		if (records.length > 1) {
			records = self._quicksortSet(records, key, newOrder);
			sortedBy = key;
			order = newOrder;
		}
		return self;
	};
	
	var toData = function (data) {
		if (RecordSet.hasInstance(data)) {
			data = data.getRecords();
		} else if (!Lang.isArray(data)) {
			data = [data];
		}
		return data;
	};
	
	/**
	 * Replaces all records with new data
	 * @method replace
	 * @param {Array} data
	 * @chainable
	 */
	this.replace = function (data) {
		data = toData(data);
		self.fire("replace", data);
		return sortedBy ? self.sortBy(sortedBy, order) : self;
	};
	
	/**
	 * Adds data to the set, creating new Records
	 * @method push
	 * @param {Array} data
	 * @chainable
	 */
	this.push = function (data) {
		records = records.concat(toData(data));
		self.fire("push", records, data);
		return sortedBy ? self.sortBy(sortedBy, order) : self;
	};
};
$.extend(RecordSet, $.EventTarget, {
	
	_quicksortSet: function (set, key, order) {
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
		return this._quicksortSet(lesser, key, order).concat([pivot]).concat(this._quicksortSet(greater, key, order));
	},
	
	/**
	 * Returns the number of records in the set
	 * @method getCount
	 * @return Number
	 */
	getCount: function () {
		return this.getRecords().length;
	},
	
	getRecordById: function (id) {
		var requiredRecord;
		var records = this.getRecords();
		A.each(records, function (record) {
			if (record.getId() == id) {
				requiredRecord = record;
				return false;
			}
		});
		return requiredRecord;
	}
});
/**
 * Returns whether an object is a RecordSet
 * @method hasInstance
 * @static
 * @param {object} o The object to check
 */
RecordSet.hasInstance = function (o) {
	return o instanceof RecordSet;
};