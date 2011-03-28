
/**
 * A Local DataSource uses local variables
 * @class DataSource.Local
 * @extends DataSource
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
DataSource.Local = Base.create('datasource-local', DataSource, [], {
	ATTRS: {
		/**
		 * @config localData
		 * @description The object to use as a datasource
		 * @required
		 */
		localData: {
			required: true
		}
	}
}, {
	handleRequest: function (request, success, failure) {
		var localData = this.get('localData');
		if (Lang.isFunction(localData)) {
			success(localData(request));
		} else {
			success(localData);
		}
	}
});

$.mix(DataSource, {
	responseType: {
		JSON: RESPONSE_TYPE_JSON,
		XML: RESPONSE_TYPE_XML,
		TEXT: RESPONSE_TYPE_TEXT,
		JSARRAY: RESPONSE_TYPE_JSARRAY
	}
});

$.add({
	DataSource: DataSource,
	Record: Record,
	RecordSet: RecordSet
});