
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
		 * @config recordSet
		 * @description This datasource's associated recordset
		 * @type RecordSet
		 * @writeOnce
		 */
		recordSet: {
			writeOnce: true
		},
		/**
		 * @config responseType
		 * @description The expected response type ('xml', 'jsarray', 'json', 'text')
		 * @required
		 */
		responseType: {
			required: true
		},
		/**
		 * @config responseSchema
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
		 * @config initialRequest
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
				this.fire("parserError", "Result list not found");
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
			var doc = $.context;
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
			$.context = doc;
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
		var internalEvents = this._events;
		this.handleRequest(request, function (rawData) {
			self.set(TEMP_DATA, rawData);
			var tempData = rawData;
			if (internalEvents.fire("beforeParse", rawData)) {
				tempData = self._parser(self.get(TEMP_DATA));
			}
			self.set('recordSet', tempData);
			self.fire("update", tempData);
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
		this._events.on("beforeParse", function (e, rawData) {
			self.set(TEMP_DATA, callback(rawData));
		});
		return this;
	},
	
	initializer: function () {
		this._events = new $.EventTarget();
		this.sendRequest(this.get(INITIAL_REQUEST));
	}
});