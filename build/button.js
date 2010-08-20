/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Different kinds of buttons and form elements
 * @module button
 * @require jet, node, base
 * @namespace
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
	
	if (!jet.buttons) {
		jet.buttons = {};
	}
	
	if (!jet.buttons.buttons) {
		jet.buttons.buttons = 1;
	}
	
	var ButtonBase = function () {
		ButtonBase.superclass.constructor.apply(this, arguments);
		
		this.on("disabledChange", function (e, val) {
			this.get(BUTTON_NODE)[0].disabled = !!val;
		});
		
		this.on("afterRender", function () {
			this.get(BUTTON_NODE)[0].disabled = !!this.get("disabled");
		});
	};
	$.extend(ButtonBase, $.Widget, {
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
			},
			text: {
				value: ""
			},
			className: {
				value: Button.NAME
			}
		});
		var type = myself.get(TYPE);
		var id = ++jet.buttons.buttons;
		/**
		 * The button node
		 * @config buttonNode
		 * @readOnly
		 */
		myself.addAttr(BUTTON_NODE, {
			readOnly: true,
			value: $("<" + (type == "link" ? "a" : type == "push" ? "button" : "input") + "/>")
		});
		if (type == "text") {
			myself.get(BUTTON_NODE).attr("type", type);
		}
		
		myself.on(RENDER, function () {
			var buttonName = myself.get(CLASS_NAME);				
			var node = myself.get(BUTTON_NODE);
			var text = myself.get("text");
			if (type == "text") {
				node.attr("value", text);
			} else {
				node.html(text);
			}
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
				myself.fire("focus");
			}).on("blur", function () {
				boundingBox.removeClass(prefixName + "-focus", eventPrefix + "-focus");
				myself.fire("blur");
			}).on(CLICK, function (e) {
				//node[0].blur();
				if (myself.fire(PRESSED)) {
					e.preventDefault();
				}
			});
			id = myself.get(CLASS_PREFIX) + myself.get(CLASS_NAME) + "-" + id;
			node.attr("id", id).appendTo(contentBox.appendTo(boundingBox));
		});
		myself.on("afterRender", function () {
			// since the order of the nodes was changed, use visibility inherit to avoid breaking the hide() method
			myself.get(BOUNDING_BOX).css(VISIBILITY, "inherit");
			var label = myself.get("label");
			if (label) {
				label = $("<label/>").html(label).insertBefore(myself.get(BOUNDING_BOX));
				label[0].setAttribute("for", id);
			}
		});
	};
	Button.NAME = "button";
	$.extend(Button, ButtonBase);
	
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
	
	if (!jet.buttons.combo) {
		jet.buttons.combo = 1;
	}
	
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
			},
			className: {
				value: "combobox"
			},
			selected: {
				validator: Lang.isNumber,
				getter: function () {
					var combo = myself.get(BUTTON_NODE)[0]; 
					return combo.options[combo.selectedIndex];
				},
				setter: function (val) {
					var combo = myself.get(BUTTON_NODE)[0];
					if (myself.fire("change", combo.options[val])) {
						combo.selectedIndex = val;
					}
					return val;
				}
			},
			count: {
				readOnly: true,
				getter: function () {
					return myself.get(BUTTON_NODE)[0].options.length;
				}
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
		
		var id = ++jet.buttons.combo;
		
		myself.on("optionsChange", function (e, newOptions) {
			var combo = myself.get(BUTTON_NODE)[0];
			combo.options.length = 0;
			setOptions(combo, newOptions);
		});
		
		myself.on("render", function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			var button = myself.get(BUTTON_NODE);
			var label = myself.get("label");
			id = myself.get(CLASS_PREFIX) + myself.get(CLASS_NAME) + "-" + id;
			if (label) {
				label = $("<label/>").html(label).appendTo(boundingBox);
				label[0].setAttribute("for", id);
			}
			button.attr("id", id).appendTo(boundingBox);
			button.on("change", function (e) {
				myself.fire("change", button[0].options[button[0].selectedIndex]);
			});
			setOptions(myself.get(BUTTON_NODE)[0], myself.get(OPTIONS));
		});
	};
	$.extend(ComboBox, ButtonBase, {
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
		},
		/**
		 * @method select
		 * @description Selects a certain option based on an index
		 * @param {Number} index
		 * @chainable
		 */
		select: function (index) {
			return this.set("selected", index);
		}
	});
	
	if (!jet.radioButtons) {
		jet.radioButtons = 1;
	}
	
	/**
	 * A RadioButton is actually a group of radio buttons that interact with each other
	 * @class RadioButton
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying widget configuration properties
	 */
	var RadioButton = function () {
		RadioButton.superclass.constructor.apply(this, arguments);
		
		var globalId = ++jet.radioButtons;
		var selected, selectedValue;
		var buttons = [];
		
		var myself = this.addAttrs({
			options: {
				required: true
			},
			className: {
				value: "radio"
			},
			namePrefix: {
				value: "jet-radio"
			},
			buttons: {
				readOnly: true,
				value: buttons
			},
			selected: {
				value: 0
			},
			value: {
			}
		});
		
		this.on("selectedChange", function (e, newIndex, oldIndex) {
			buttons[oldIndex][0].checked = false;
			if (Lang.isNumber(newIndex)) {
				buttons[newIndex][0].checked = true;
			}
			
		}).on("render", function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			var prefix = myself.get(CLASS_PREFIX);
			var className = myself.get(CLASS_NAME);
			var options = myself.get("options");
			var namePrefix = myself.get("namePrefix");
			A.each(options, function (btn, i) {
				var holder = $("<span/>").appendTo(boundingBox);
				var id = namePrefix + globalId + "-" + i;
				var input = $("<input/>").attr({
					type: "radio",
					name: namePrefix + globalId,
					id: id,
					value: btn.value
				}).appendTo(holder);
				var label = $("<label/>").html(btn.label).appendTo(holder);
				label[0].setAttribute("for", id);
				input.link(label).on("click", (function (index, rad) {
					return function () {
						if (myself.fire("click", index) && index !== selected) {
							myself.fire("change", index, input);
							myself.set("selected", index);
							myself.set("value", rad[0].value);
						}
					};
				}(i, input)));
				buttons.push(input);
				if (i === myself.get("selected")) {
					input[0].checked = true;
					myself.set("value", input[0].value);
				}
			});
		});
	};
	$.extend(RadioButton, $.Widget, {
		disable: function (index) {
			var buttons = this.get("buttons"); 
			A.each(Lang.isNumber(index) ? [buttons[index]] : buttons, function (btn) {
				btn[0].disabled = true;
				btn.next().addClass("disabled");
			});
			return this;
		},
		enable: function (index) {
			var buttons = this.get("buttons"); 
			A.each(Lang.isNumber(index) ? [buttons[index]] : buttons, function (btn) {
				btn[0].disabled = false;
				btn.next().removeClass("disabled");
			});
			return this;
		}
	});
	
	if (!jet.checkboxes) {
		jet.checkboxes = 1;
	}
	
	var CheckBox = function () {
		CheckBox.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			buttonNode: {
				readOnly: true,
				value: $("<input/>").attr("type", "checkbox")
			},
			label: {
				value: ""
			},
			className: {
				value: "checkbox"
			},
			checked: {
				value: false,
				getter: function () {
					return myself.get(BUTTON_NODE)[0].checked;
				}
			}
		});
		
		var id = ++jet.checkboxes;
		
		this.on("render", function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			id = myself.get(CLASS_PREFIX) + myself.get(CLASS_NAME) + "-" + id;
			var btn = myself.get(BUTTON_NODE).attr("id", id).appendTo(boundingBox);
			$("<label/>").html(myself.get("label")).appendTo(boundingBox)[0].setAttribute("for", id);
			btn[0].disabled = !!myself.get("disabled");
			
			btn.on("click", function () {
				var checked = btn[0].checked;
				if (checked != myself.get("checked")) {
					if (!myself.fire("change", checked)) {
						btn[0].checked = !checked;
					}
				}
			});
		});
	};
	$.extend(CheckBox, ButtonBase);
	
	$.add({
		Button: Button,
		ComboBox: ComboBox,
		RadioButton: RadioButton,
		CheckBox: CheckBox
	});
	
});
