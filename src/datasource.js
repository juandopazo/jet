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
		A = $.Array;

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

	/*
	 * @DRAFT
	 */
	var Record = function () {
		
	};
	
	/*
	 * @DRAFT
	 */
	var RecordSet = function () {
		RecordSet.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			data: {
				value: []
			}
		});
		
	};
	$.extend(RecordSet, $.Base);
		
	/**
	 * @extends Utility
	 */
	var DataSource = function () {
		DataSource.superclass.constructor.apply(this, arguments);
		
		var recordSet = [];
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
			 */
			} else if (responseType == RESPONSE_TYPE_JSON) {
				var resultList = responseSchema.resultList.split(".");
				var found = TRUE;
				var root = rawData;
				A.each(resultList, function (key) {
					if (!root[key]) {
						found = FALSE;
					} else {
						root = root[key];
					}
				});
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

				var resultNode = $(rawData).find(responseSchema.resultNode)._nodes[0];
				A.each(resultNode.children()._nodes, function (node) {
					var record = {};
					A.each(responseSchema.fields, function (field) {
						var value;
						if (node._node.nodeName != field.node) {
							value = node.find(field.node)._DOMNodes[0];
						} else {
							value = node._node
						}
						if (field.attr) {
							value = value.getAttribute(field.attr)
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
			
			return data;
		};
		
		/**
		 * 
		 * @param {Object} request
		 * @param {BOOLEAN} ignoreCache
		 */
		myself.sendRequest = function (request, ignoreCache) {
			myself.get(REQUEST_LOGIC)(request, function (rawData) {
				myself.set(TEMP_DATA, rawData);
				var tempData = rawData;
				if (myself.get("internalEvents").fire("beforeParse", rawData)) {
					tempData = parser(myself.get(TEMP_DATA));
				}
				myself.fire("update", tempData);
				Hash.each(tempData, function (key, val) {
					if (!recordSet[key]) {
						recordSet[key] = val;
						myself.fire("recordAdded", key, val);
					} else if (recordSet[key] != val || ignoreCache) {
						recordSet[key] = val;
						myself.fire("recordUpdate", key, val);
					}
				});
				
			}, function (reason) {
				myself.fire(ERROR, {
					message: REQUEST_FAILED_MSG,
					reason: reason
				});
			});
		};
		
		myself.onBeforeParse = function (callback) {
			myself.get("internalEvents").on("beforeParse", function (e, rawData) {
				myself.set(TEMP_DATA, callback(rawData));
			});
		};
	};
	$.extend(DataSource, $.Utility);
	
	var Ajax = function () {
		Ajax.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			url: {
				required: TRUE
			}
		});
		
		myself.set(REQUEST_LOGIC, function (request, success, failure) {
			var type = myself.get(RESPONSE_TYPE);
			$.ajax({
				url: myself.get(URL),
				data: request,
				dataType: type == RESPONSE_TYPE_XML ? "xml" : type == RESPONSE_TYPE_TEXT ? "text" : "json",
				success: success,
				error: failure
			});
		});
		
	};
	$.extend(Ajax, DataSource);
	
	var JSONP = function () {
		JSONP.superclass.constructor.apply(this, arguments);
		
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
				success(data)
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
		
	};
	$.extend(JSONP, DataSource);
	
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
		
	};
	$.extend(Local, DataSource);
	
	$.DataSource = {
		responseType: {
			JSON: RESPONSE_TYPE_JSON,
			XML: RESPONSE_TYPE_XML,
			TEXT: RESPONSE_TYPE_TEXT,
			JSARRAY: RESPONSE_TYPE_JSARRAY
		},
		Ajax: Ajax,
		JSONP: JSONP,
		Local: Local
	};
});