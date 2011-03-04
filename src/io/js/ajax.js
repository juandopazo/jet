
var win = $.win;
var Lang = $.Lang,
	Hash = $.Hash;

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
	Hash.each(hash, function (key, value) {
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
	if ((location.protocol == "file:" || hostname == "localhost" || hostname == "127.0.0.1") && HAS_AXO) {
		getAjaxObject = function () {
			return newAXO(msxml);
		};
	} else if (HAS_XHR) {
		getAjaxObject = function () {
			return new XMLHttpRequest();
		};
	} else if (HAS_AXO) {
		getAjaxObject = function () {
			return newAXO(msxml);
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
 * @param {Hash} settings
 */
$.ajax = function (settings) {
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
		if (settings.error) {
			settings.error(a, b, c);
		}
		complete.apply($, arguments);
	};
	var url = settings.url;

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
};

$.IO = {
	utils: {
		parseXML: parseXML
	}
};