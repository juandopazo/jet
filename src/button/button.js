/**
 * Different kinds of buttons and form elements
 * @module button
 * @require jet, node, base
 */
jet().add('button', function ($) {
	
	var A = $.Array,
		Hash = $.Hash,
		Lang = $.Lang;
	
	var CLASS_NAME = "className",
		BUTTON = "button",
		BOUNDING_BOX = "boundingBox",
		BUTTON_NODE = "buttonNode",
		NEW_SPAN = "<span/>",
		CLASS_PREFIX = "classPrefix",
		CONTENT_BOX = "contentBox",
		VISIBILITY = "visibility",
		PRESSED = "pressed",
		CLICK = "click",
		COMBO = "combo",
		OPTION = "option",
		OPTIONS = "options",
		RENDER = "render",
		TYPE = "type";
	
	/**
	 * A button may be a push button, a radio button or other form elements that behave as buttons
	 * @class Button
	 * @constructor
	 * @extends Widget
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var Button = function () {
		Button.superclass.constructor.apply(this, arguments);
		var myself = this.set(CLASS_NAME, BUTTON).addAttrs({
			/**
			 * @config type
			 * @type String
			 * @writeOnce
			 * @default "push"
			 */
			type: {
				writeOnce: true,
				value: "push"
			},
			// overwrite standard boundingBox (a div) with a span
			// maybe all widgets should use a span with display: inline-block as a boundingBox?
			boundingBox: {
				readOnly: true,
				value: $(NEW_SPAN)
			},
			//overwrite standard contentBox (a div) with a span
			contentBox: {
				readOnly: true,
				value: $(NEW_SPAN)
			},
			disabled: {
				validator: Lang.isBoolean,
				value: false
			}
		}).on("disabledChange", function (e, val) {
			this.get(BUTTON_NODE)[0].disabled = val;
			return this;
		});
		var type = myself.get(TYPE);
		/**
		 * The button node
		 * @config buttonNode
		 * @readOnly
		 */
		myself.addAttr(BUTTON_NODE, {
			readOnly: true,
			value: $("<" + (type == "link" ? "a" :"button") + "/>")
		});
		
		myself.on(RENDER, function () {
			var buttonName = Button.NAME;
				
			var node = myself.get(BUTTON_NODE).html(myself.get("text"));
			var prefix = myself.get(CLASS_PREFIX);
			var prefixName = prefix + buttonName;
			var eventPrefix = prefix + type + buttonName;
			var boundingBox = myself.get(BOUNDING_BOX).addClass(prefixName, prefix + type + "-" + buttonName);
			var contentBox = myself.get(CONTENT_BOX).addClass("first-child");
			node.on("mouseover", function () {
				boundingBox.addClass(prefixName + "-hover", eventPrefix + "-hover");
			}).on("mouseout", function () {
				boundingBox.removeClass(prefixName + "-hover", eventPrefix + "-hover");
			}).on("focus", function () {
				boundingBox.addClass(prefixName + "-focus", eventPrefix + "-focus");
			}).on("blur", function () {
				boundingBox.removeClass(prefixName + "-focus", eventPrefix + "-focus");
			}).on(CLICK, function (e) {
				//node[0].blur();
				if (myself.fire(PRESSED)) {
					e.preventDefault();
				}
			});
			node.appendTo(contentBox.appendTo(boundingBox));
		});
		myself.on("afterRender", function () {
			// since the order of the nodes was changed, use visibility inherit to avoid breaking the hide() method
			myself.get(BOUNDING_BOX).css(VISIBILITY, "inherit");
		});
	};
	Button.NAME = "button";
	$.extend(Button, $.Widget, {
		/**
		 * Disables the button
		 * @method disable
		 * @chainable
		 */
		disable: function () {
			return this.set("disabled", true);
		},
		/**
		 * Enables the button
		 * @method enable
		 * @chainable
		 */
		enable: function () {
			return this.set("disabled", false);
		},
		/**
		 * Fires the blur event
		 * @method blur
		 * @chainable
		 */
		blur: function () {
			this.get(BUTTON_NODE).blur();
			this.fire("blur");
			return this;
		},
		/**
		 * Fires the focus event and sets the button as active
		 * @method focus
		 * @chainable
		 */
		focus: function () {
			this.get(BUTTON_NODE).focus();
			this.fire("focus");
			return this;
		}
	});
	
	var createTag = function (tag) {
		return $.context.createElement(tag);
	};
	
	var addOption = function (combo, text, value) {
		/* Note by jdopazo:
		 Lazy initialization for the function _add()
		 I create a <select> element that I never attach to the dom
		 and try to attach an <OPTION> element to it with try...catch
		 This way I avoid using try...catch every time this function is called */
		var testSelect = createTag("select"),
			testOption = createTag(OPTION),
			standards = false;
		try {
			testSelect.add(testOption, null); //standards compliant
			standards = true;
		} catch (ex) {
			testSelect.add(testOption); // IE only
		}
		if (standards) {
			addOption = function (combo, text, value) {
				var newOption = createTag(OPTION);
				newOption.text = text;
				if (value) {
					newOption.value = value;
				}
				combo.add(newOption, null);
			};
		} else {
			addOption = function (combo, text, value) {
				var newOption = createTag(OPTION);
				newOption.text = text;
				if (value) {
					newOption.value = value;
				}
				combo.add(newOption);
			};
		}
		addOption(combo, text, value);
	};
	
	/**
	 * A ComboBox is a select html element
	 * @class ComboBox
	 * @extends Button
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var ComboBox = function () {
		ComboBox.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			options: {
				value: []
			},
			buttonNode: {
				readOnly: true,
				value: $("<select/>")
			}
		});
		
		var setOptions = function (combo, opts) {
			A.each(opts, function (value) {
				if (Lang.isHash(value)) {
					Hash.each(value, function (text, val) {
						addOption(combo, text, val);
					});
				} else {
					addOption(combo, value);
				}
			});
		};
		
		myself.on("optionsChange", function (e, newOptions) {
			var combo = myself.get(COMBO)[0];
			combo.options.length = 0;
			setOptions(BUTTON_NODE, newOptions);
		});
		
		myself.on("render", function () {
			setOptions(myself.get(BUTTON_NODE)[0], myself.get(OPTIONS));
		});
	};
	$.extend(ComboBox, Button, {
		/**
		 * @method add
		 * @description Adds options to the combo box
		 * @param {String | Hash} The text value of the option, or alternatively 
		 * a hash which key is the text and the value is the option's value
		 * @param {String} value optional - The value of the option
		 * @chainable
		 */
		add: function (text, value) {
			var myself = this;
			var opt;
			if (value) {
				opt = {};
				opt[text] = value;
			} else {
				opt = text;
			}
			myself.get("options").push(opt);
			addOption(myself.get(BUTTON_NODE)[0], text, value);
			return myself;
		},
		/**
		 * @method fill
		 * @description Adds several options to the select
		 * @param {Array} values An array of text values that behave like the "text" parameter of the add() method
		 * @chainable
		 */
		fill: function (values) {
			var myself = this;
			if (Lang.isArray(values)) {
				A.each(values, function (t) {
					myself.add(t);
				});
			} else {
				Hash.each(values, myself.add);
			}
			return myself;
		},
		/**
		 * @method clear
		 * @description Removes all options from the combo box
		 * @chainable
		 */
		clear: function () {
			return this.set("options", []);
		}
	});
	
	/**
	 * A RadioButton is actually a group of radio buttons that interact with each other
	 * @class RadioButton
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var RadioButton = function () {
		RadioButton.superclass.constructor.apply(this, arguments);
		
		
		
	};
	$.extend(RadioButton, $.Widget, {
		disable: function (index) {
			
		},
		enable: function (index) {
			
		}
	});
	
	var CheckBox = function () {
		CheckBox.superclass.constructor.apply(this, arguments);
	};
	$.extend(CheckBox, Button);
	
	$.add({
		Button: Button,
		ComboBox: ComboBox,
		RadioButton: RadioButton
	});
	
});