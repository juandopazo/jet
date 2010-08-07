jet().add('xsl', function ($) {
	var win = $.win;
	var Lang = $.Lang;
    $.xsl = (function () {
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
                    intnode = document.createElement("div");
                    intnode.appendChild(xsltProcessor.transformToFragment(xml, document));
                    return intnode.innerHTML;
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
                    return xsltProc.output;
                };
            }
            return transform(xml, xsl, parameters);
        },
        
        transformAction = function (xml, xsl, parameters, target) {
            var xmlDoc, xslDoc;
            
            var checkReady = function () {
                if (xmlDoc && xslDoc) {
                    target.innerHTML = transform(xmlDoc, xslDoc, parameters);
                }
            };
            if (target) {
                if (Lang.isString(xml) || Lang.isString(xsl)) {
                    if (Lang.isString(xml)) {
                        $.ajax({
                            url: xml,
                            dataType: 'xml',
                            success: function (result) {
                                xmlDoc = result;
                                checkReady();
                            }
                        });
                    } else {
                        xmlDoc = xml;
                    }
                    if (Lang.isString(xsl)) {
                        $.ajax({
                            url: xsl,
                            dataType: 'xml',
                            success: function (result) {
                                xslDoc = result;
                                checkReady();
                            }
                        });
                    } else {
                        xslDoc = xsl;
                    }
                } else {
                    xmlDoc = xml;
                    xslDoc = xml;
                    checkReady();
                }
                /* @TODO: debug when parameters are wrong */
            } else {
                return transform(xml, xml, parameters);
            }
        };
        
        return {
            transform: transformAction
        };
    }());
});