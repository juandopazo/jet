
/**
 * Adds the following methods to the $ object
 * @class Log
 * @static
 */
var Log = jet.namspace('Log');
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