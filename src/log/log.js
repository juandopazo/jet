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
		jet.Log = [];
	}
	
	$.error = function (msg) {
		jet.Log.push(msg);
	};

});