
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