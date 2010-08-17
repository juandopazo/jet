/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
jet().add("io-xdr", function ($) {
	
	var IO = $.IO;
	
	if (!jet.IO) {
		jet.IO = {};
	}
	var flajax = jet.IO.flajax;
	if (!flajax) {
		jet.IO.xdrWaitList = [];
		window.flajaxLoad = function () {
			jet.IO.xdrReady = true;
			for (var i = 0; i < jet.IO.xdrWaitList.length; i++) {
				IO.flajax(jet.IO.xdrWaitList[i]);
			}
			jet.IO.xdrWaitList = [];
		};
		$("<div/>").attr("id", "flajax").appendTo($("#jet-tracker"));
		$.swfobject.embedSWF("/jet/src/io/flajax.swf", "flajax", "1", "1", "9.0.0", "expressInstall.swf", {}, {}, {}, function (e) {
			flajax = jet.IO.flajax = e.ref;
		});
	}
	if (!jet.IO.xdrCallbacks) {
		jet.IO.xdrCallbacks = {};
	}
	if (!jet.IO.xdrCount) {
		jet.IO.xdrCount = 1;
	}
	
	IO.flajax = function (settings) {
		if (jet.IO.xdrReady) {
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
			var callbackId = ++jet.IO.xdrCount;
			jet.IO.xdrCallbacks["flajax" + callbackId] = success;
			jet.IO.xdrCallbacks["flajax" + callbackId + "Error"] = error;
			jet.IO.flajax.call(settings.url, "jet.IO.xdrCallbacks.flajax" + callbackId, method, settings.data);
		} else {
			jet.IO.xdrWaitList.push(settings);
		}
	};
	
});	