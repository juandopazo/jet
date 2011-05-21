
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