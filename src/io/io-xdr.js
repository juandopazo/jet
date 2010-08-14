jet().add("io-xdr", function ($) {
	
	$.mix($.IO, new $.EventTarget());
	var IO = $.IO;
	
	if (!jet.IO) {
		jet.IO = {};
	}
	var flajax = jet.IO.flajax;
	if (!flajax) {
		window.flajaxLoad = function () {
			jet.IO.xdrReady = true;
			IO.fire("xdr:ready");
		}
		$("<div/>").attr("id", "flajax").appendTo($("#jet-tracker"));
		$.swfobject.embedSWF("../src/io/flajax.swf", "flajax", "1", "1", "9.0.0", "expressInstall.swf", {}, {}, {}, function (e) {
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
			jet.IO.xdrCallbacks["flajax" + callbackId + "_Error"] = error;
			jet.IO.flajax.call(settings.url, "jet.IO.xdrCallbacks.flajax" + callbackId, method, settings.data);
		} else {
			IO.on("xdr:ready", function () {
				IO.flajax(settings);
			});
		}
	}
	
});