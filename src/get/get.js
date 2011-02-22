/**
 * Handles AJAX requests
 * @module Get
 * @requires jet, node
 * @namespace
 */
jet().add('get', function ($) {
	
	/**
	 * Loads scripts and CSS files.
	 * Included in the jet() core
	 * @class Get
	 * @static
	 */
	$.Get = {
		/**
		 * Loads a script asynchronously
		 * @method script
		 * @param {String} url
		 */
		script: function (url, keep) {
			var script = $('<script/>').attr({
				type: "text/javascript",
				asyng: true,
				src: url
			});
			$('head').append(script);
			if (!keep) {
				setTimeout(function () {
					
					//Added src = null as suggested by Google in 
					//http://googlecode.blogspot.com/2010/11/instant-previews-under-hood.html
					script[0].src = null;
					script.remove();
				}, 10000);
			}
		},
		/**
		 * Loads a CSS file
		 * @method css
		 * @param {String} url
		 */
		css: function (url) {
			$('head').append($('<link/>').attr({
				type: "text/css",
				rel: "stylesheet",
				href: url
			}));
		}
	};
	
});