
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
	error: function (msg) {
		Log.errors.push(msg);
	},
	warning: function (msg) {
		Log.warnings.push(msg);
	},
	log: function (msg) {
		Log.logs.push(msg);
	}
});