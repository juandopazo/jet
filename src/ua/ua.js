/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Browser sniffing
 * @module ua
 */
jet().add("ua", function ($) {
	/**
	 * Browser sniffing
	 * @class UA
	 * @static
	 */
	$.UA = (function () {
		var nav = $.win.navigator,
			ua = nav.userAgent.toLowerCase(),
			p = nav.platform.toLowerCase();

		var webkit = /KHTML/.test(ua) || /webkit/i.test(ua),
			opera = /opera/i.test(ua),
			ie = /(msie) ([\w.]+)/.exec(ua);
			
		ie = ie && ie[1] && ie[2] ? parseFloat(ie[2]) : false;
		
        return {
			/**
			 * true if the browser uses the Webkit rendering engine (ie: Safari, Chrome)
			 * @property webkit
			 */
			webkit: webkit,
			/**
			 * If the browser is Internet Explorer, this property is equal to the IE version. If not, it is false
			 * @property ie
			 */
			ie: ie, // ie is false, 6, 7 or 8
			/**
			 * true if the browser is Opera
			 * @property opera
			 */
			opera: opera,
			/**
			 * true if the browser is based on the Gecko rendering engine (ie: Firefox)
			 * @property gecko
			 */
			gecko: !webkit && !opera && !ie && /Gecko/i.test(ua),
			/**
			 * true if the operating system is Windows
			 * @property win
			 */
			win: p ? /win/.test(p) : /win/.test(ua), 
			/**
			 * true if the operating system is Apple OSX
			 * @property mac
			 */
			mac: p ? /mac/.test(p) : /mac/.test(ua),
			
			support: {
				fixed: !ie || (ie > 7 && document.documentMode > 6)
			}
		};
    }());
});