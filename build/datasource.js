/**
 * DataSources are different ways of accessing data and parsing it into an schema
 * @module datasource
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('datasource', function ($) {
"use strict";

			
var Lang = $.Lang,
	Hash = $.Hash,
	A = $.Array,
	Base = $.Base;

var RESPONSE_TYPE_JSON		= 'json',
	RESPONSE_TYPE_XML		= 'xml',
	RESPONSE_TYPE_JSARRAY	= 'jsarray',
	RESPONSE_TYPE_TEXT		= 'text';

var SOURCE_TYPE_XHR			= 'xhr',
	SOURCE_TYPE_JSONP		= 'jsonp',
	SOURCE_TYPE_LOCAL		= 'local';
	
var PARSER = "parser",
	REQUEST_LOGIC = "requestLogic",
	RESPONSE_TYPE = "responseType",
	URL = "url",
	ERROR = "error",
	REQUEST_FAILED_MSG = "Request failed",
	AMPERSAND = "&",
	EQUAL_SIGN = "=",
	TIMEOUT = "timeout",
	TEMP_DATA = "tempData",
	INITIAL_REQUEST = "initialRequest";
	
var RecordNS = jet.namespace('Record');

if (!RecordNS.ids) {
	RecordNS.ids = 0;
}

/**
 * A record is a Hash width a unique id
 * @class Record
 * @constructor
 * @param {Object} An object literal
 */
var Record = function (data) {
	var id = RecordNS.ids++;
	
	/**
	 * Returns the id of the record. Each record has a unique id globally.alert
	 * This allows for easy filtering, ordering, etc of records.alert
	 * @method getId
	 * @return Number
	 */
	this.getId = function () {
		return id;
	};
	/**
	 * Returns the data of the record. Must be an object literal
	 * @method getData
	 */
	this.getData = function () {
		return data;
	};
	/**
	 * Shortcut for getting a value from the record's data
	 * @method get
	 * @param {String} key
	 */
	this.get = function (key) {
		return data[key];
	};
};
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

/**
 * Base class for all data sources. The DataSource class shouldn't be used directly
 * @class DataSource
 * @extends Utility
 * @protected
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
var DataSource = Base.create('datasource', $.Utility, [], {
	ATTRS: {
		/**
		 * @attribute recordSet
		 * @description This datasource's associated recordset
		 * @type RecordSet
		 * @writeOnce
		 */
		recordSet: {
			writeOnce: true
		},
		/**
		 * @attribute responseType
		 * @description The expected response type ('xml', 'jsarray', 'json', 'text')
		 * @required
		 */
		responseType: {
			required: true
		},
		/**
		 * @attribute responseSchema
		 * @description <p>The schema by which to parse the response data. May be:</p>
		 * <p><strong>DataSource.responseType.JSARRAY schema</strong><br/>
		 * A JSARRAY response type assumes the following response shape:</p>
		 * <code>//All records are listed as an array<br/>
		 * [<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;['value1', 'value2', 'value3'], //one record<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;['another1', 'another2', 'another3'] //another record<br/>
		 * ]</code>
		 * <p></p>
		 * <p><strong>DataSource.responseType.TEXT schema</strong><br/>
		 * This schema essentially splits the string and then acts as if it where a DataSource.responseType.JSARRAY.<br/>
		 * Must define a <strong>fieldDelim</strong> property. Example (comma separated value):</p>
		 * <code>responseSchema: {<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;fieldDelim: ","<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;fields: ["firstField", "secondField"]<br/>
		 * }</code>
		 * <p></p>
		 * <p><strong>DataSource.responseType.JSON schema</strong><br/>
		 * Example:</p>
		 * <code>responseSchema = {<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;resultList : "Response.Results", // String pointer to result data<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;// Field order doesn't matter and not all data is required to have a field<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;fields : [<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ key: "id" },                    // simple location<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ key: "obj" }<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;]<br/>
		 * }</code>
		 * <p></p>
		 * <p><strong>DataSource.responseType.XML schema</strong><br/>
		 * Example:</p> 
		 * <code>responseSchema: {<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;resultNode: "rootNode", // every result field will be looked for between this node's children<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;fields: [<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ key: "keyName", node: "nodeName" }, // in this case, the value of the field will be the node's value<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ key: "otherKey", node: "otherNode", attr: "type" }, // in this other case, the field value will be the "type" attribute<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ key: "aNumber", node: "someNode", parser: "parseFloat" } // this value will be parsed as a Float<br/>
		 * &nbsp;&nbsp;&nbsp;&nbsp;]<br/>
		 * }</code>
		 * @type Hash
		 * @required
		 */
		responseSchema: {
			required: true
		},
		/**
		 * @attribute initialRequest
		 * @description Data to send in the automatic initial request
		 * @type Object
		 */
		initialRequest: {
			value: {}
		}
	}
}, {
	_parser: function (rawData) {
		var responseType = this.get(RESPONSE_TYPE);
		var responseSchema = this.get("responseSchema");
		
		var data = [];
		
		/*
		 * Text schema, ie: a comma separated value file.
		 * This essentially splits the string and then acts as if it where a RESPONSE_TYPE_ARRAY
		 */
		if (responseType == RESPONSE_TYPE_TEXT) {
			rawData = rawData.split(responseSchema.recordDelim);
			A.each(rawData, function (str, i) {
				rawData[i] = str.split(responseSchema.fieldDelim);
			});
			responseType = RESPONSE_TYPE_JSARRAY;
		}
		/*
		 * A JSARRAY response type assumes the following response shape:
		 * 
		 * //All records are listed as an array
		 * [
		 *     ['value1', 'value2', 'value3'], //one record
		 *     ['another1', 'another2', 'another3'] //another record
		 * ]
		 */
		if (responseType == RESPONSE_TYPE_JSARRAY) {
			var fields = responseSchema.fields;
			A.each(rawData, function (val, i) {
				data[i] = {};
				A.each(fields, function (fieldName, j) {
					data[i][fieldName] = rawData[i][j];
				});
			});
			
		/*
		 * A JSON Schema
		 * Example:
		 * 
		 *	responseSchema = {
			    resultsList : "Response.Results", // String pointer to result data
			    // Field order doesn't matter and not all data is required to have a field
			    fields : [
			        { key: "id" },                    // simple location
			        { key: "obj.nested" },            // dot notation works
			        { key: "['arr'][1]['nested 2']" } // bracket notation works
			    ]
			}
		 */
		} else if (responseType == RESPONSE_TYPE_JSON) {
			var found = true;
			var root = rawData;
			if (responseSchema.resultList) {
				var resultList = responseSchema.resultList.split(".");
				A.each(resultList, function (key) {
					if (!root[key]) {
						found = false;
					} else {
						root = root[key];
					}
				});
			}
			if (found) {
				A.each(root, function (record, i) {
					data[i] = {};
					A.each(responseSchema.fields, function (field) {
						/*
						 * A field key can be defined with dot notation
						 */
						var nested = field.key.split(".");
						var value = null;
						A.each(nested, function (key) {
							if (Lang.isValue(record[key])) {
								value = record[key];
							}
						});
						data[i][field.key] = value;
					});
				});
			} else {
				this.fire("parserError", { message: "Result list not found" });
			}
		}
		/*
		 * XML Schema.
		 * Example: 
		 * 
		 * responseSchema: {
		 *     resultNode: "rootNode", // every result field will be looked for between this node's children
		 *     fields: [
		 *         { key: "keyName", node: "nodeName" }, // in this case, the value of the field will be the node's value
		 *         { key: "otherKey", node: "otherNode", attr: "type" }, // in this other case, the field value will be the "type" attribute
		 *         { key: "aNumber", node: "someNode", parser: "Float" } // this value will be parsed as a Float
		 *     ]
		 * }
		 */
		else if (responseType == RESPONSE_TYPE_XML) {
			var doc = $.config.doc;
			var de = rawData.documentElement; 
			var resultNode = de.nodeName == responseSchema.resultNode ? $(de) : $(de).find(responseSchema.resultNode).eq(0);
			resultNode.children().each(function (node) {
				var record = {};
				A.each(responseSchema.fields, function (field) {
					var value = node.nodeName != field.node ? $(node).find(field.node)[0] : node;
					var tmp;
					if (value) {
						if (field.attr) {
							value = value.getAttribute(field.attr);
						} else if (field.children) {
							tmp = [];
							$(value).children().each(function (child) {
								if (child.firstChild) {
									tmp.push(child.firstChild.nodeValue);
								}
							});
							value = tmp;
						} else {
							value = value.firstChild ? value.firstChild.nodeValue : "";
						}
						if (field.parser) {
							switch (field.parser.toLowerCase()) {
							case "float":
								value = parseFloat(value);
								break;
							case "10":
								value = parseInt(value, 10);
								break; 
							}
						}
					}
					record[field.key] = value;
				});
				data[data.length] = record;
			});
			$.config.doc = doc;
		}
		return new RecordSet(data);
	},
	
	/**
	 * Sends a request
	 * @method sendRequest
	 * @param {Object} request
	 * @param {Boolean} ignoreCache
	 * @chainable
	 */
	sendRequest: function (request, ignoreCache) {
		var self = this;
		var internalEvents = this._dsEvents;
		this.handleRequest(request, function (rawData) {
			self.set(TEMP_DATA, rawData);
			var tempData = rawData;
			if (internalEvents.fire('beforeParse', { data: rawData })) {
				tempData = self._parser(self.get(TEMP_DATA));
			}
			self.set('recordSet', tempData);
			self.fire('update', { data: tempData, request: request });
			/*Hash.each(tempData, function (key, val) {
				if (!recordSet[key]) {
					recordSet[key] = val;
					self.fire("recordAdded", key, val);
				} else if (recordSet[key] != val || ignoreCache) {
					recordSet[key] = val;
					self.fire("recordUpdate", key, val);
				}
			});*/
			
		}, function (reason) {
			self.fire(ERROR, {
				message: REQUEST_FAILED_MSG,
				reason: reason
			});
		});
		return this;
	},
	
	/**
	 * @method handleRequest
	 * @description The logic for the chosen source type. Should be overwritten when extending the DataSourceClass
	 */
	handleRequest: function (request, success) {
		success(request);
	},
	
	/**
	 * Adds an event listener to the "beforeParse" event
	 * @method onBeforeParse
	 * @param {Function} callback
	 * @chainable
	 */
	onBeforeParse: function (callback) {
		var self = this;
		this._dsEvents.on("beforeParse", function (e) {
			self.set(TEMP_DATA, callback(e.data));
		});
		return this;
	},
	
	initializer: function () {
		this._dsEvents = new $.EventTarget();
		this.sendRequest(this.get(INITIAL_REQUEST));
	}
});
/**
 * A Get DataSource that uses JSON for getting data across domains
 * @class DataSource.Get
 * @extends DataSource
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
DataSource.Get = Base.create('datasource-get', DataSource, [], {
	ATTRS: {
		/**
		 * @attribute jsonCallbackParam
		 * @description Name of the URL parameter that defines the name of the JSONP callback
		 * @type String
		 * @default "p"
		 */
		jsonCallbackParam: {
			value: "p"
		},
		/**
		 * @attribute timeout
		 * @description Ms after which the request is considered to have timed out
		 * @type Number
		 * @default 10000
		 */
		timeout: {
			value: 10000
		},
		/**
		 * @attribute url
		 * @description Url from which to fetch the data
		 * @type String
		 * @required
		 */
		url: {
			required: true,
			setter: function (val) {
				return val.substr(val.length - 1) == "?" ? val : val + "?";
			}
		}
	}
}, {
	handleRequest: function (request, success, failure) {
		$.jsonp({
			url: this.get(URL),
			data: request,
			success: success,
			jsonCallbackParam: this.get("jsonCallbackParam"),
			error: failure,
			timeout: this.get(TIMEOUT)
		});
	}
});
/**
 * An AJAX DataSource
 * @class DataSource.Ajax
 * @extends DataSource
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
DataSource.Ajax = Base.create('datasource-ajax', DataSource, [], {
	ATTRS: {
		/**
		 * @attribute url
		 * @description Url from which to fetch the data
		 * @type String
		 * @required
		 */
		url: {
			required: true
		}
	}
}, {
	handleRequest: function (request, success, failure) {
		$.ajax({
			url: this.get(URL),
			data: request,
			dataType: this.get(RESPONSE_TYPE),
			success: success,
			error: failure
		});
	}
});
/**
 * Cross-domain data source
 * @class DataSource.XDR
 * @extends DataSource
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
DataSource.XDR = Base.create('datasource-xdr', DataSource, [], {
	ATTRS: {
		/**
		 * @attribute url
		 * @description Url from which to fetch the data
		 * @type String
		 * @required
		 */
		url: {
			required: true
		}
	}
}, {
	handleRequest: function (request, success, failure) {
		var type = this.get(RESPONSE_TYPE);
		$.flajax({
			url: this.get(URL),
			data: request,
			dataType: this.get(RESPONSE_TYPE),
			success: success,
			error: failure
		});
	}
});
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
		 * @attribute localData
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
			
});
