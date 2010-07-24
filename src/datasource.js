jet().add('datasource', function ($) {
	
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
			sourceType: {
				required: TRUE
			},
			data: {
				readOnly: TRUE
			}
		});
		
		var internal = new $.EventTarget();
		
		var data = {};
		
		/**
		 * 
		 * @param {Object} request
		 * @param {BOOLEAN} ignoreCache
		 */
		myself.sendRequest = function (request, ignoreCache) {
			myself.requrestLogic(request, function () {
				//success
			}, function () {
				//failure
			});
		};
		
		myself.receiveRecord = function (recordName, recordData) {
			internal.fire("beforeParse", recordData);
			data[recordName] = myself.parse(recordData);
			myself.fire("update", data[recordName], data);
		};
		
		myself.onBeforeParse = function (callback) {
			internal.on("beforeParse", function (e, recordName, recordData) {
				data[recordName] = callback(recordData);
			});
		};
	};
	$.extend(DataSource, $.Utility);
	DataSource.responseType = {
		JSON: RESPONSE_TYPE_JSON,
		XML: RESPONSE_TYPE_XML,
		JSARRAY: RESPONSE_TYPE_JSARRAY
	};
	DataSource.sourceType = {
		XHR: SOURCE_TYPE_XHR,
		JSONP: SOURCE_TYPE_JSONP,
		LOCAL: SOURCE_TYPE_LOCAL 
	};
	
	$.DataSource = DataSource;
});