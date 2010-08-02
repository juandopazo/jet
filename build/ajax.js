jet().add('ajax', function ($) {
	var win = $.win;
	
	var TRUE = true,
	FALSE = false,

	XML = "xml",
	XSL = "xsl",
	TYPE_JSON = "json";
	
	var newAXO = function (t) {
		return new win.ActiveXObject(t);
	};
	
	var getActiveXParser = function (type) {
		var freeThreadedDOM = "Msxml2.FreeThreadedDOMDocument.",
			domDocument = "Msxml2.DOMDocument.",
			test,
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
		if ((location.protocol == "file:" || hostname == "localhost" || hostname == "127.0.0.1") && win.ActiveXObject) {
			getAjaxObject = function () {
				return newAXO(msxml);
			};
		} else if (XMLHttpRequest) {
			getAjaxObject = function () {
				return new XMLHttpRequest();
			};
		} else if (win.ActiveXObject) {
			getAjaxObject = function () {
				return newAXO(msxml);
			};
		}
		return getAjaxObject();
	};
	
	$.ajax = (function () {
		var xhr = getAjaxObject(),
		   
		timeoutError = 'timeout',
		noObjectError = 'Can\'t create object',
		noStatusError = 'Bad status',
					
		checkTimeout = function (errorHandler) {
			if (xhr.readyState !== 4) {
				xhr.abort();
				errorHandler(timeoutError, 408, xhr);
			}
		},
		
	  /* Parsea un XML
		En Internet Explorer instancia un objeto ActiveX llamado MSXML. En el resto usa XMLHttpRequest.responseXML */
		parseXML = function (xmlFile, type, errorHandler) {
			var xmlDoc = null;
			/* La eleccion de versiones 6.0 y 3.0 es adrede.
			   La version 4.0 es especifica de windows 2000 y la 5.0 viene unicamente con Microsoft Office
			   La version 6 viene con Windows Vista y uno de los service pack de XP, por lo que el usuario quizas no la tenga
			   Se la usa porque es considerablemente mas rapida */
			if (!XMLHttpRequest) {
				xmlDoc = getActiveXParser(type);
				xmlDoc.async = FALSE;
				xmlDoc.loadXML(xmlFile.responseText);
				if (xmlDoc.parseError.errorCode !== 0) {
					errorHandler(noStatusError, xmlDoc.parseError, xhr);
				}
			} else {
				xmlDoc = xmlFile.responseXML;
			}
			return xmlDoc;
		};
		
		return function (settings) {
			var success = settings.success,
	
			result = null;
			
			settings.timeout	= settings.timeout || 10000; /* Tiempo que tarda en cancelarse la transaccion */
			settings.method		= settings.method || "GET"; /* Metodo para enviar informacion al servidor */
			settings.async		= settings.async || TRUE;
			settings.complete	= settings.complete || function () {};
			settings.success	= function () {
				if (success) {
					success.apply(this, arguments);
				}
				settings.complete.apply(this, arguments);
			};
			settings.error		= function (a, b, c) {
				settings.error(a, b, c);
				settings.complete();
			};
		
			var getResultByContentType = function () {
				var contentType = settings.dataType || xhr.getResponseHeader('Content-type');
				switch (contentType) {
				case 'application/xml':
				case XML:
				case XSL:
					return parseXML(xhr, contentType, settings.error);
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
	
			if (xhr) {
				/* Esto corrije el problema de ausencia de tipos mime solo si existe el metodo overrideMimeType (no existe en IE) */
				if (settings.dataType && (settings.dataType === XML || settings.dataType === XSL) && xhr.overrideMimeType) {
					xhr.overrideMimeType('text/xml');
				}
				if (settings.url) {
					if (settings.async === TRUE) {
						xhr.onreadystatechange = function () {
							if (xhr.readyState === 4) {
								/* Normalmente deberia chequearse unicamente el status == 200, pero cuando se hace una transaccion local el status en IE termina siendo 0
								 por lo que con revisar que exista la respuesta alcanza */
								if (xhr.status === 200 || xhr.responseText || xhr.responseXML) { 
									settings.success(getResultByContentType(), xhr);
								} else if (xhr.status === 408) {
									settings.error(timeoutError, xhr.status, xhr);
								} else {
									settings.error(noStatusError, xhr.status, xhr); 
								}
							}
						};
					}
					/* Cuando la transaccion se hace en un filesystem local y el archivo de destino no existe,
					   no se llega a pasar por el evento onreadystatechange sino que puede lanzar una excepcion en algunos navegadores */
					try {
						xhr.open(settings.method, settings.url, settings.async);
						xhr.send(null);
					} catch (e) {
						settings.error(noStatusError, 404, xhr); 
					}
					if (settings.async === FALSE) {
						result = getResultByContentType();
					} else {
						setTimeout(function () {
							checkTimeout(settings.error);
						}, settings.timeout);
					}
				}
			}
			return result || $;
		};
	}());
});