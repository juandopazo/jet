/**
 * Adds functionality to make cross-domain ajax calls
 * @module io-xdr
 * @requires base,io
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('io-xdr', function ($) {

			
var IO = $.IO;
var ioNS = jet.namespace('IO');

var flajax = ioNS.flajax;
if (!flajax) {
	ioNS.xdrWaitList = [];
	window.flajaxLoad = function () {
		ioNS.xdrReady = true;
		for (var i = 0; i < ioNS.xdrWaitList.length; i++) {
			IO.flajax(ioNS.xdrWaitList[i]);
		}
		ioNS.xdrWaitList = [];
	};
	$("<div/>").attr("id", "flajax").appendTo($("#jet-tracker"));
	$.swfobject.embedSWF("/jet/src/io/flajax.swf", "flajax", "1", "1", "9.0.0", "expressInstall.swf", {}, {}, {}, function (e) {
		flajax = ioNS.flajax = e.ref;
	});
}
jet.namespace('IO.xdrCallbacks');
if (!ioNS.xdrCount) {
	ioNS.xdrCount = 1;
}

/**
 * @method flajax
 * @for IO
 * @description Makes a cross-domain ajax call based on a Flash engine. <strong>Requires the io-xsl submodule</strong>
 * @param {Hash} settings
 */
IO.flajax = function (settings) {
	if (ioNS.xdrReady) {
		settings = settings || {};
		var method = settings.method || "GET";
		var success = function (data) {
			switch (settings.dataType) {
			case "xml":
				data = IO.utils.parseXML(data);
				break;
			case "json":
				data = $.JSON.parse(data);
				break;
			}
			if (settings.success) {
				settings.success(data);
			}
			if (settings.complete) {
				settings.complete(data);
			}
		};
		var error = function (data) {
			if (settings.error) {
				settings.error(data);
			}
			if (settings.complete) {
				settings.complete(data);
			}
		};
		var callbackId = ++ioNS.xdrCount;
		ioNS.xdrCallbacks["flajax" + callbackId] = success;
		ioNS.xdrCallbacks["flajax" + callbackId + "Error"] = error;
		ioNS.flajax.call(settings.url, "jet.IO.xdrCallbacks.flajax" + callbackId, method, settings.data);
	} else {
		ioNS.xdrWaitList.push(settings);
	}
};
			
});
