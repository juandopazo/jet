/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Base structure for logging
 * @module log
 */
jet().add("log", function ($) {
	
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
	
});