
if (!jet.IO) {
	jet.IO = {};
}
if (!jet.IO.jsonpCallbacks) {
	jet.IO.jsonpCallbacks = [];
}

$.jsonp = function (settings) {
	settings = settings || {};
	var jsonCallbackParam = settings.jsonCallbackParam || "p";
	var success = function (result) {
		if (settings.success) {
			settings.success(result);
		}
		if (settings.complete) {
			settings.complete(result);
		}
	};
	var error = function (result) {
		if (settings.error) {
			settings.error(result);
		}
		if (settings.complete) {
			settings.complete(result);
		}
	};
	var callbacks = jet.IO.jsonpCallbacks;
	var index = callbacks.length;
	var loaded = false;
	var url = settings.url;
	if (url) {
		callbacks[index] = function (data) {
			loaded = true;
			success(data);
		};
		if (url.substr(url.length - 1) != "?") {
			url += "?";
		}
		if (!settings.data) {
			settings.data = {};
		}
		settings.data[jsonCallbackParam] = "jet.IO.jsonpCallbacks[" + index + "]";
		
		//Added a timeout of 0 as suggested by Google in 
		//http://googlecode.blogspot.com/2010/11/instant-previews-under-hood.html
		setTimeout(function () {
			$.Get.script(url + hashToURI(settings.data));
		}, 0);
		setTimeout(function () {
			if (!loaded) {
				error({
					message: "Request failed",
					reason: "Timeout"
				});
			}
		}, settings.timeout || 10000);
	}
};