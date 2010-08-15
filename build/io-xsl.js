/**
 * Cross-browser XSL Transformations support
 * @module xsl
 */
jet().add('io-xsl', function ($) {
	var win = $.win;
	var Lang = $.Lang;
	var IO = $.IO;

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
		
	$.IO.xsl = function (settings) {
		var xml = settings.xml;
		var xsl = settings.xsl;
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
			if (settings.error) {
				settings.error(data);
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
	};
});