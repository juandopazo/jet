/**
 * Base structure for logging
 * @module log
 * @requires jet
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('log', function ($) {

			
/**
 * Adds the following methods to the $ object
 * @class Log
 * @static
 */
if (!jet.Log) {
	jet.Log = {};
}
var Log = jet.Log;
if (!Log.errors) {
	Log.errors = [];
}
if (!Log.warnings) {
	Log.warnings = [];
}
if (!Log.logs) {
	Log.logs = [];
}

$.add({
	/**
	 * @method error
	 * @description Logs an error
	 */
	error: function (msg) {
		Log.errors.push(msg);
	},
	/**
	 * @method warning
	 * @description Logs a warning
	 */
	warning: function (msg) {
		Log.warnings.push(msg);
	},
	/**
	 * @method log
	 * @description Logs a message
	 */
	log: function (msg) {
		Log.logs.push(msg);
	}
});
			
});
