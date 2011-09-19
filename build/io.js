/**
 * Handles AJAX, JSONP and XSLT requests
 * @module io
 * @requires deferred
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('io', function ($) {

			
var win = $.config.win,
	Lang = $.Lang,
	$Object = $.Object;

var XML = "xml",
XSL = "xsl",
TYPE_JSON = "json",
GET = "GET";

var HAS_AXO = !!win.ActiveXObject;
var HAS_XHR = !!win.XMLHttpRequest;

var newAXO = function (t) {
	return new win.ActiveXObject(t);
};

var hashToURI = function (hash) {
	var result = [];
	$Object.each(hash, function (key, value) {
		result.push(key + "=" + value);
	});
	return result.join("&");
};

var getActiveXParser = function (type) {
	var freeThreadedDOM = "Msxml2.FreeThreadedDOMDocument.",
		domDocument = "Msxml2.DOMDocument.",
		test,
	/* La eleccion de versiones 6.0 y 3.0 es adrede.
	   La version 4.0 es especifica de windows 2000 y la 5.0 viene unicamente con Microsoft Office
	   La version 6 viene con Windows Vista y uno de los service pack de XP, por lo que el usuario quizas no la tenga
	   Se la usa porque es considerablemente mas rapida */
		v6 = "6.0",
		v3 = "3.0";
	try {
		test = newAXO(domDocument + v6);
		getActiveXParser = function (type) {
			if (type == XSL) {
				return newAXO(freeThreadedDOM + v6);
			} else {
				return newAXO(domDocument + v6);
			}
		};
	} catch (e) {
		try {
			test = newAXO(domDocument + v3);
			getActiveXParser = function (type) {
				if (type == XSL) {
					return newAXO(freeThreadedDOM + v3);
				} else {
					return newAXO(domDocument + v3);
				}
			};
		} catch (ex) {
			
		}
	}
	return getActiveXParser(type);
},

getAjaxObject = function () {
	var hostname = location.host,
		msxml = "Microsoft.XMLHTTP",
		test;
	if (HAS_AXO && (!HAS_XHR || (location.protocol == "file:" || hostname == "localhost" || hostname == "127.0.0.1"))) {
		getAjaxObject = function () {
			return newAXO(msxml);
		};
	} else {
		getAjaxObject = function () {
			return new XMLHttpRequest();
		};
	}
	return getAjaxObject();
};

var timeoutError = "timeout",
noObjectError = "Can't create object",
noStatusError = "Bad status",
notFoundError = "File not found";

/* Parsea un XML
En Internet Explorer instancia un objeto ActiveX llamado MSXML. En el resto usa XMLHttpRequest.responseXML */
var parseXML = function (xmlFile, type, errorHandler) {
	var xmlDoc = null;
	if (xmlFile.responseXML) {
		xmlDoc = xmlFile.responseXML;
	} else if (win.DOMParser) {
		xmlDoc = new win.DOMParser();
		xmlDoc = xmlDoc.parseFromString(xmlFile.responseText || xmlFile, "text/xml");
	} else if (HAS_AXO) {
		xmlDoc = getActiveXParser(type);
		xmlDoc.async = false;
		xmlDoc.loadXML(xmlFile.responseText || xmlFile);
		if (xmlDoc.parseError.errorCode !== 0) {
			errorHandler(noStatusError, xmlDoc.parseError);
		}
	} else {
		errorHandler(0, {
			reason: "Can't find a suitable XML parser",
			srcText: xmlFile
		});
	}
	return xmlDoc;
};
			
var getResultByContentType = function (xhr, dataType, onError) {
	var contentType = dataType || xhr.getResponseHeader('Content-type');
	switch (contentType) {
	case 'application/xml':
	case XML:
	case XSL:
		return parseXML(xhr, contentType, onError);
	case TYPE_JSON:
		try {
			return $.JSON.parse(xhr.responseText);
		} catch (e) {
			$.error(e);
		}
		break;
	default:					
		return xhr.responseText;
	}
};


/**
 * Handles AJAX and JSONP requests
 * @class IO
 * @static
 */
/**
 * Makes an ajax request
 * @method ajax
 * @param {Object} settings
 */
function ajax(url, settings) {
	var xhr = getAjaxObject();
   
	var success = settings.success,

	result = null;
	
	var dataType		= settings.dataType;
	var timeout			= settings.timeout || 10000; /* Tiempo que tarda en cancelarse la transaccion */
	var method			= settings.method || "GET"; /* Metodo para enviar informacion al servidor */
	var async			= settings.async || true;
	var complete		= settings.complete || function () {};
	var onSuccess		= function () {
		if (success) {
			success.apply($, arguments);
		}
		complete.apply($, arguments);
	};
	var onError			= function (a, b, c) {
		if (settings.failure) {
			settings.failure(a, b, c);
		}
		complete.apply($, arguments);
	};

	if (xhr) {
		/* Esto corrije el problema de ausencia de tipos mime solo si existe el metodo overrideMimeType (no existe en IE) */
		if (dataType && (dataType === XML || dataType === XSL) && xhr.overrideMimeType) {
			xhr.overrideMimeType('text/xml');
		}
		if (url) {
			if (url.substr(url.length - 1) != "?") {
				url += "?";
			}
			if (settings.data) {
				url += hashToURI(settings.data);
			}
			if (async === true) {
				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4) {
						/* Normalmente deberia chequearse unicamente el status == 200, pero cuando se hace una transaccion local el status en IE termina siendo 0
						 por lo que con revisar que exista la respuesta alcanza */
						if (xhr.status === 404) {
							onError(notFoundError, xhr.status, xhr);
						} else if (xhr.status === 408) {
							onError(timeoutError, xhr.status, xhr);
						} else if (xhr.status === 200 || xhr.responseText || xhr.responseXML) { 
							onSuccess(getResultByContentType(xhr, dataType, onError), xhr);
						} else {
							onError(noStatusError, xhr.status, xhr); 
						}
					}
				};
			}
			/* Cuando la transaccion se hace en un filesystem local y el archivo de destino no existe,
			   no se llega a pasar por el evento onreadystatechange sino que puede lanzar una excepcion en algunos navegadores */
			try {
				xhr.open(method, url, async);
				xhr.send(null);
			} catch (e) {
				onError(noStatusError, 404, xhr); 
			}
			if (async === false) {
				result = getResultByContentType(xhr, dataType, onError);
			} else {
				setTimeout(function () {
					if (xhr.readyState !== 4) {
						xhr.abort();
						onError(timeoutError, 408, xhr);
					}
				}, timeout);
			}
		}
	}
	return result || $;
}
var ioNS = jet.namespace('IO');
if (!ioNS.jsonpCallbacks) {
	ioNS.jsonpCallbacks = [];
}

function jsonp(url, settings) {
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
		if (settings.failure) {
			settings.failure(result);
		}
		if (settings.complete) {
			settings.complete(result);
		}
	};
	var callbacks = ioNS.jsonpCallbacks;
	var index = callbacks.length;
	var loaded = false;
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
var transform = function (xml, xsl, parameters) {
	parameters = parameters || {};
	if (win.XSLTProcessor) {
		transform = function (xml, xsl, parameters) {
			var xsltProcessor = new window.XSLTProcessor(),
				intnode,
				paramName;
			xsltProcessor.importStylesheet(xsl);
			for (paramName in parameters) {
				if (parameters.hasOwnProperty(paramName)) {
					xsltProcessor.setParameter(null, paramName, parameters[paramName]);
				}
			}
			return $(xsltProcessor.transformToFragment(xml, $.context));
		};
	} else if (win.ActiveXObject) {
		transform = function (xml, xsl, parameters) {
			var xsltThread = new window.ActiveXObject("Msxml2.XSLTemplate.6.0"),
				xsltProc,
				paramName;
			xsltThread.stylesheet = xsl;
			xsltProc = xsltThread.createProcessor();
			xsltProc.input = xml;
			for (paramName in parameters) {
				if (parameters.hasOwnProperty(paramName)) {
					xsltProc.addParameter(paramName, parameters[paramName]);
				}
			}
			xsltProc.transform();
			return $(xsltProc.output);
		};
	}
	return transform(xml, xsl, parameters);
};
	
/**
 * @method xsl
 * @description Makes a XSL transformation. Loads the files with Ajax if needed. <strong>Requires the io-xsl submodule</strong>
 * @param {Object} settings
 */
function xslt(xml, xsl, settings) {
	var parameters = settings.params;
	var xmlDoc, xslDoc;
	
	var success = function (data) {
		if (settings.success) {
			settings.success(data);
		}
		if (settings.complete) {
			settings.complete(data);
		}
	};
	var error = function (data) {
		if (settings.failure) {
			settings.failure(data);
		}
		if (settings.complete) {
			settings.complete(data);
		}
	};
	
	var checkReady = function () {
		if (xmlDoc && xslDoc) {
			success(transform(xmlDoc, xslDoc, parameters));
		}
	};
	if (Lang.isString(xml) || Lang.isString(xsl)) {
		if (Lang.isString(xml)) {
			$.ajax({
				url: xml,
				dataType: 'xml',
				success: function (result) {
					xmlDoc = result;
					checkReady();
				},
				error: error
			});
		} else {
			xmlDoc = xml;
		}
		if (Lang.isString(xsl)) {
			$.ajax({
				url: xsl,
				dataType: 'xsl',
				success: function (result) {
					xslDoc = result;
					checkReady();
				},
				error: error
			});
		} else {
			xslDoc = xsl;
		}
	} else {
		xmlDoc = xml;
		xslDoc = xml;
		checkReady();
	}
};/**
 * Represents the promise of an IO request being completed.
 * Can also be aborted
 * @class Request
 * @constructor
 * @extends Promise
 */
function Request() {
	Request.superclass.constructor.apply(this, arguments);
}
$.extend(Request, $.Promise, {
	
	/**
	 * @method abort
	 * @description Aborts the request if available (doesn't work on JSONP transactions)
	 * @chainable
	 */
	abort: function () {
		if (this._request && this._request.abort) {
			this._request.abort();
		}
		return this.reject();
	}
	
	/**
	 * @method ajax
	 * @description Calls $.ajax and returns a new Request
	 * @param {String} url The url for the io request
	 * @param {Object} config Config options for the io request (see $.io)
	 * @return Request
	 */
	
	/**
	 * @method jsonp
	 * @description Calls $.jsonp and returns a new Request
	 * @param {String} url The url for the jsonp request
	 * @param {Object} config Config options for the jsonp request (see $.io)
	 * @return Request
	 */
	
}, {
	
	addMethod: function (name, fn) {
		Request.prototype[name] = function (url, opts) {
			var config = (!Lang.isObject(opts) || Lang.isFunction(opts)) ? {} : opts,
				on = config.on || (config.on = {}),
				success = on.success,
				failure = on.failure;
			if (Lang.isFunction(opts)) {
				success = opts;
			}
			return this.defer(function (promise) {
				on.success = $.bind(promise.resolve, promise);
				on.failure = $.bind(promise.reject, promise);
				this._request = fn(url, config);
			}).then(success, failure);
		};
	}
	
});

$.Request = Request;

var TRANSACTION_METHODS = {
	ajax: ajax,
	jsonp: jsonp,
	xslt: xslt
};

$Object.each(TRANSACTION_METHODS, Request.addMethod);

$Object.each(TRANSACTION_METHODS, function (method) {
	
	$[method] = function () {
		var transaction = new $.Request();
		return transaction[method].apply(transaction, arguments);
	};
	
});
			
});
