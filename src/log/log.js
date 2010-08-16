/**
 * Base structure for logging
 * @module log
 */
jet().add("log", function ($) {
	
	$.error = function (msg) {
		throw new Error(msg);
	};

});
/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/

		