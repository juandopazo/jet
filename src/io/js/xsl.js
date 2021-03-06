
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
			return $(xsltProcessor.transformToFragment(xml, $.config.doc));
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
};