/**
 * DataSources are different ways of accessing data and parsing it into an schema
 * @module datasource
 * @namespace
 */
jet().add('datasource', function ($) {
	
	if (!jet.DataSource) {
		jet.DataSource = {};
	}
	if (!jet.DataSource.jsonpCallbacks) {
		jet.DataSource.jsonpCallbacks = [];
	}
	
	var FALSE = false,
		TRUE = true;
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array,
		IO = $.IO;

	var RESPONSE_TYPE_JSON		= 1,
		RESPONSE_TYPE_XML		= 2,
		RESPONSE_TYPE_JSARRAY	= 3,
		RESPONSE_TYPE_TEXT		= 4;
	
	var SOURCE_TYPE_XHR			= 1,
		SOURCE_TYPE_JSONP		= 2,
		SOURCE_TYPE_LOCAL		= 3;
		
	var PARSER = "parser",
		REQUEST_LOGIC = "requestLogic",
		RESPONSE_TYPE = "responseType",
		URL = "url",
		ERROR = "error",
		REQUEST_FAILED_MSG = "Request failed",
		AMPERSAND = "&",
		EQUAL_SIGN = "=",
		TIMEOUT = "timeout",
		TEMP_DATA = "tempData";

	if (!jet.Record) {
		jet.Record = {};
	}
	if (!jet.Record.ids) {
		jet.Record.ids = 0;
	}
	
	/**
	 * A record is a Hash width a unique id
	 * @class Record
	 * @constructor
	 * @param {Object} An object literal
	 */
	var Record = function (data) {
		var id = jet.Record.ids++;
		var myself = this;
		
		/**
		 * Returns the id of the record. Each record has a unique id globally.alert
		 * This allows for easy filtering, ordering, etc of records.alert
		 * @method getId
		 * @return Number
		 */
		myself.getId = function () {
			return id;
		};
		/**
		 * Returns the data of the record. Must be an object literal
		 * @method getData
		 */
		myself.getData = function () {
			return data;
		};
		/**
		 * Shortcut for getting a value from the record's data
		 * @method get
		 * @param {String} key
		 */
		myself.get = function (key) {
			return data[key];
		};
	};
	/**
	 * Returns if an object is a Record
	 * @method isRecord
	 * @for Lang
	 */
	Lang.isRecord = function (o) {
		return o instanceof Record;
	};
	
	var quicksortSet = function (set, key, order) {
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
		return quicksortSet(lesser, key, order).concat([pivot]).concat(quicksortSet(greater, key, order));
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
		var sortedBy = FALSE;
		var order;
		
		var myself = this;
		
		A.each(data, function (recordData) {
			records[records.length] = new Record(recordData);
		});
		
		/**
		 * Returns all records in the set
		 * @method getRecords
		 */
		myself.getRecords = function () {
			return records;
		};
		
		/**
		 * Returns the number of records in the set
		 * @method getCount
		 * @return Number
		 */
		myself.getCount = function () {
			return records.length;
		};
		
		/**
		 * Sorts the records based on a key of the data they hold
		 * @method sortBy
		 * @param {String} key The data key that will be sorted
		 * @param {String} order the order in which to sort. May be "asc" or "desc"
		 * @chainable
		 */
		myself.sortBy =  function (key, newOrder) {
			var myself = this;
			if (records.length > 1) {
				records = quicksortSet(records, key, newOrder);
				sortedBy = key;
				order = newOrder;
			}
			return myself;
		};
		
		var toData = function (data) {
			if (Lang.isRecordSet(data)) {
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
		myself.replace = function (data) {
			data = toData(data);
			myself.fire("replace", data);
			return sortedBy ? myself.sortBy(sortedBy, order) : myself;
		};
		
		/**
		 * Adds data to the set, creating new Records
		 * @method push
		 * @param {Array} data
		 * @chainable
		 */
		myself.push = function (data) {
			records = records.concat(toData(data));
			myself.fire("push", records, data);
			return sortedBy ? myself.sortBy(sortedBy, order) : myself;
		};
	};
	$.extend(RecordSet, $.EventTarget);
	/**
	 * Returns whether an object is a RecordSet
	 * @method isRecordSet
	 * @for Lang
	 */
	Lang.isRecordSet = function (o) {
		return o instanceof RecordSet;
	};
		
	/**
	 * Base class for all data sources. The DataSource class shouldn't be used directly
	 * @class DataSource
	 * @extends Utility
	 * @protected
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var DataSource = function () {
		DataSource.superclass.constructor.apply(this, arguments);
		
		var recordSet = new RecordSet([]);
		var myself = this.addAttrs({
			recordSet: {
				readOnly: TRUE,
				getter: function () {
					return recordSet;
				}
			},
			responseType: {
				required: TRUE
			},
			responseSchema: {
				required: TRUE
			},
			requestLogic: {
				writeOnce: TRUE
			},
			internalEvents: {
				readOnly: TRUE,
				value: new $.EventTarget()
			}
		});
		
		var parser = function (rawData) {
			var responseType = myself.get("responseType");
			var responseSchema = myself.get("responseSchema");
			
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
				var found = TRUE;
				var root = rawData;
				if (responseSchema.resultList) {
					var resultList = responseSchema.resultList.split(".");
					A.each(resultList, function (key) {
						if (!root[key]) {
							found = FALSE;
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
								if (record[key]) {
									value = record[key];
								}
							});
							data[i][field.key] = value;
						});
					});
				} else {
					myself.fire("parserError", "Result list not found");
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

				var resultNode = $(rawData).find(responseSchema.resultNode)[0];
				A.each(resultNode.children(), function (node) {
					var record = {};
					A.each(responseSchema.fields, function (field) {
						var value;
						if (node[0].nodeName != field.node) {
							value = node.find(field.node)[0];
						} else {
							value = node[0];
						}
						if (field.attr) {
							value = value.getAttribute(field.attr);
						} else {
							value = value.firstChild.nodeValue;
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
						record[field.key] = value;
					});
					data[data.length] = record;
				});
			}
			
			return new RecordSet(data);
		};
		
		/**
		 * Sends a request
		 * @method sendRequest
		 * @param {Object} request
		 * @param {Boolean} ignoreCache
		 * @chainable
		 */
		myself.sendRequest = function (request, ignoreCache) {
			myself.get(REQUEST_LOGIC)(request, function (rawData) {
				myself.set(TEMP_DATA, rawData);
				var tempData = rawData;
				if (myself.get("internalEvents").fire("beforeParse", rawData)) {
					tempData = parser(myself.get(TEMP_DATA));
				}
				recordSet = tempData;
				myself.fire("update", tempData);
				/*Hash.each(tempData, function (key, val) {
					if (!recordSet[key]) {
						recordSet[key] = val;
						myself.fire("recordAdded", key, val);
					} else if (recordSet[key] != val || ignoreCache) {
						recordSet[key] = val;
						myself.fire("recordUpdate", key, val);
					}
				});*/
				
			}, function (reason) {
				myself.fire(ERROR, {
					message: REQUEST_FAILED_MSG,
					reason: reason
				});
			});
			return myself;
		};
		
		/**
		 * Adds an event listener to the "beforeParse" event
		 * @method onBeforeParse
		 * @param {Function} callback
		 * @chainable
		 */
		myself.onBeforeParse = function (callback) {
			myself.get("internalEvents").on("beforeParse", function (e, rawData) {
				myself.set(TEMP_DATA, callback(rawData));
			});
			return myself;
		};
	};
	$.extend(DataSource, $.Utility);
	
	/**
	 * An AJAX DataSource
	 * @namespace DataSource
	 * @class Ajax
	 * @extends DataSource
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Ajax = function () {
		Ajax.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			url: {
				required: TRUE
			}
		});
		
		myself.set(REQUEST_LOGIC, function (request, success, failure) {
			var type = myself.get(RESPONSE_TYPE);
			IO.ajax({
				url: myself.get(URL),
				data: request,
				dataType: type == RESPONSE_TYPE_XML ? "xml" : type == RESPONSE_TYPE_TEXT ? "text" : "json",
				success: success,
				error: failure
			});
		});
		
		myself.sendRequest(myself.get("initialRequest"));
	};
	$.extend(Ajax, DataSource);
	
	/**
	 * A Get DataSource that uses JSON for getting data across domains
	 * @class Get
	 * @extends DataSource
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Get = function () {
		Get.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			jsonCallbackParam: {
				value: "p"
			},
			timeout: {
				value: 10000
			},
			url: {
				required: TRUE
			}
		});
		
		var prepareRequest = function (request) {
			var result = [];
			if (Lang.isHash(request)) {
				Hash.each(request, function (key, val) {
					result[result.length] = key + EQUAL_SIGN + val;
				});
				request = result.join(AMPERSAND);
			}
			return request;
		};
		
		myself.set(REQUEST_LOGIC, function (request, success, failure) {
			var index = jet.DataSource.jsonpCallbacks.length;
			var loaded = FALSE;
			jet.DataSource.jsonpCallbacks[index] = function (data) {
				loaded = TRUE;
				success(data);
			};
			$.Get.script(myself.get(URL) + prepareRequest(request) + AMPERSAND + myself.get("jsonCallbackParam") + EQUAL_SIGN + "jet.DataSource.jsonpCallbacks[" + index + "]");
			setTimeout(function () {
				if (!loaded) {
					myself.fire(ERROR, {
						message: REQUEST_FAILED_MSG,
						reason: TIMEOUT
					});
				}
			}, myself.get(TIMEOUT));
		});
		
		myself.sendRequest(myself.get("initialRequest"));
	};
	$.extend(Get, DataSource);
	
	/**
	 * A Local DataSource uses local variables
	 * @class Local
	 * @extends DataSource
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Local = function () {
		Local.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttr("localData", {
			required: TRUE
		});
		
		myself.set(REQUEST_LOGIC, function (request, success, failure) {
			var localData = myself.get("localData");
			if (Lang.isFunction(localData)) {
				success(localData(request));
			} else {
				success(localData);
			}
		});
		
		myself.sendRequest(myself.get("initialRequest"));
	};
	$.extend(Local, DataSource);
	
	$.mix(DataSource, {
		responseType: {
			JSON: RESPONSE_TYPE_JSON,
			XML: RESPONSE_TYPE_XML,
			TEXT: RESPONSE_TYPE_TEXT,
			JSARRAY: RESPONSE_TYPE_JSARRAY
		},
		Ajax: Ajax,
		Get: Get,
		Local: Local
	});
	
	$.add({
		DataSource: DataSource,
		Record: Record,
		RecordSet: RecordSet
	});
});