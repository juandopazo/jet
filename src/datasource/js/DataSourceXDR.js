
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
		 * @config url
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