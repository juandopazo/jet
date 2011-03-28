
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