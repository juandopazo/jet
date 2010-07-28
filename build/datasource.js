jet().add('datasource', function ($) {
	
	if (!jet.DataSource) {
		jet.DataSource = {};
	}
	if (!jet.DataSource.jsonp) {
		jet.DataSource.jsonp = {};
	}
	if (!jet.DataSource.jsonp.callbacks) {
		jet.DataSource.jsonp.callbacks = [];
	}
	
	var FALSE = false,
		TRUE = true;
	
	var Lang = $.Lang,
		Hash = $.Hash,
		ArrayHelper = $.Array;

	var RESPONSE_TYPE_JSON		= 1,
		RESPONSE_TYPE_XML		= 2,
		RESPONSE_TYPE_JSARRAY	= 3;
	
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

	/**
	 * @extends Utility
	 */
	var DataSource = function () {
		DataSource.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			responseType: {
				required: TRUE
			},
			responseSchema: {
				required: TRUE
			},
			schema: {
				required: TRUE
			},
			parser: {
				writeOnce: TRUE
			},
			requestLogic: {
				writeOnce: TRUE
			},
			internalEvents: {
				readOnly: TRUE,
				value: new $.EventTarget()
			}
		});
		
		/**
		 * 
		 * @param {Object} request
		 * @param {BOOLEAN} ignoreCache
		 */
		myself.sendRequest = function (request, ignoreCache) {
			myself.get(REQUEST_LOGIC)(request, function (rawData) {
				myself.set(TEMP_DATA, rawData);
				var tempData = rawData;
				if (internal.fire("beforeParse", rawData)) {
					tempData = myself.get(PARSER)(myself.get(TEMP_DATA));
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
	
	var XHR = function () {
		XHR.superclass.constructor.apply(this, arguments);
		
		var recordSet = {};
		var myself = this.addAttrs({
			recordSet: {
				readOnly: TRUE,
				getter: function () {
					return recordSet;
				}
			},
			responseType: {
				value: RESPONSE_TYPE_XML
			},
			url: {
				required: TRUE
			}
		});
		
		myself.set(REQUEST_LOGIC, function (request, success, failure) {
			$.ajax({
				url: myself.get(URL),
				data: request,
				dataType: myself.get(RESPONSE_TYPE) == RESPONSE_TYPE_XML ? "xml" : "json",
				success: success,
				failure: failure
			});
		});
		
		myself.set(PARSER, function (rawData) {
			switch (myself.get(RESPONSE_TYPE)) {
				case RESPONSE_TYPE_JSON:
					break;
				case RESPONSE_TYPE_XML:
					break; 
			}
		});
		
	};
	$.extend(XHR, DataSource);
	
	var JSONP = function () {
		JSONP.superclass.constructor.apply(this, arguments);
		
		var recordSet = {};
		var myself = this.addAttrs({
			recordSet: {
				readOnly: TRUE,
				getter: function () {
					return recordSet;
				}
			},
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
			var index = jet.DataSource.jsonp.callbacks.length;
			var loaded = FALSE;
			jet.DataSource.jsonp.callbacks[index] = function (data) {
				loaded = TRUE;
				success(data)
			};
			$.Get.script(myself.get(URL) + prepareRequest(request) + AMPERSAND + myself.get("jsonCallbackParam") + EQUAL_SIGN + "jet.DataSource.jsonp.callbacks[" + index + "]");
			setTimeout(function () {
				if (!loaded) {
					myself.fire(ERROR, {
						message: REQUEST_FAILED_MSG,
						reason: TIMEOUT
					});
				}
			}, myself.get(TIMEOUT));
		});
		
		myself.set(PARSER, function (rawData) {
			
		});
	};
	$.extend(JSONP, DataSource);
	
	var Local = function () {
		Local.superclass.constructor.apply(this, arguments);
		
		var recordSet = {};
		var myself = this.addAttrs({
			recordSet: {
				readOnly: TRUE,
				getter: function () {
					return recordSet;
				}
			},
			localData: {
				required: TRUE
			},
			responseType: {
				value: RESPONSE_TYPE_JSARRAY
			}
		});
		
		myself.set(REQUEST_LOGIC, function (request, success, failure) {
			success(recordSet);
		});
		
		myself.set(PARSER, function (rawData) {
			
		});
	};
	$.extend(Local, DataSource);
	
	$.DataSource = {
		sourceType: {
			XHR: SOURCE_TYPE_XHR,
			JSONP: SOURCE_TYPE_JSONP,
			LOCAL: SOURCE_TYPE_LOCAL 
		},
		responseType: {
			JSON: RESPONSE_TYPE_JSON,
			XML: RESPONSE_TYPE_XML,
			JSARRAY: RESPONSE_TYPE_JSARRAY
		},
		XHR: XHR,
		JSONP: JSONP,
		Local: Local
	};
});