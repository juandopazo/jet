jet().add('forms', function ($) {
	
	var OPTION = "option"; // for better minification
	var FALSE = false;
	var TRUE = true;
	var doc = $.context;
	
	var addOption = function (combo, text, value) {
		/* Note by jdopazo:
		 Lazy initialization for the function _add()
		 I create a <select> element that I never attach to the dom
		 and try to attach an <OPTION> element to it with try...catch
		 This way I avoid using try...catch every time this function is called */
		var testSelect = doc.createElement("select"),
			testOption = doc.createElement(OPTION),
			standards = FALSE;
		try {
			testSelect.add(testOption, null); //standards compliant
			standards = TRUE;
		} catch (ex) {
			testSelect.add(testOption); // IE only
		}
		if (standards) {
			addOption = function (combo, text, value) {
				var newOption = doc.createElement(OPTION);
				newOption.text = text;
				if (value) {
					newOption.text = value;
				}
				combo.add(newOption, null);
			};
		} else {
			addOption = function (combo, text, value) {
				var newOption = doc.createElement(OPTION);
				newOption.text = text;
				if (value) {
					newOption.value = value;
				}
				combo.add(newOption);
			};
		}
		addOption(combo, text, value);
	};
	
	var fillCombo = function (combo, values) {
		var valueLength,
		i,
		x;
		if (values && values.constructor == Array) {
			valueLength = values.length;
			for (i = 0; i < valueLength; i = i + 1) {
				addOption(combo, values[i]);
			}
		} else {
			for (x in values) {
				if (values.hasOwnProperty(x)) {
					addOption(combo, x, values[x]);
				}
			}
		}
	};
	
	var prepareFn = function (fn) {
		return function () {
			var args = arguments;
			return this.each(function (combo) {
				if (combo.nodeName == "SELECT") {
					fn.apply(combo, [combo].concat(args));
				}
			});
		};
	};
	
	var Select = function () {};
	Select.prototype = {
		addOption: prepareFn(addOption),
		fillCombo: prepareFn(fillCombo),
		clearCombo: prepareFn(function (combo) {
			combo.options.length = 0;
		})
	};
	
	$.augment($.NodeList, Select);
	
});
