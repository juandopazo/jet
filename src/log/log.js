/**
 * Base structure for logging
 * @module log
 */
jet().add("log", function ($) {
	
	$.error = function (msg) {
		throw new Error(msg);
	};

});