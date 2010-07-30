jet().add("container", function ($) {
	
	var TRUE = true,
		FALSE = false,
		Lang = $.Lang,
		Hash = $.Hash,
		ArrayHelper = $.Array;
		
	var BOUNDING_BOX = "boundingBox",
		CONTENT_BOX = "contentBox",
		UNDERLAY = "underlay",
		CLASS_PREFIX = "classPrefix",
		HEADER = "header",
		BODY = "body",
		FOOTER = "footer",
		CLASS_NAME = "className",
		ACCEPT = "accept",
		CANCEL = "cancel",
		AFTER = "after",
		CLICK = "click",
		CLOSE = "close",
		RENDER = "render",
		CENTER = "center",
		BUTTON = "button",
		HEIGHT = "height",
		WIDTH = "width",
		PX = "px",
		LEFT = "left",
		RIGHT = "right",
		TOP = "top",
		BOTTOM = "bottom",
		AUTO = "auto",
		DIV = "div",
		NEW_DIV = "<div/>",
		FIXED = "fixed",
		SHADOW = "shadow",
		VISIBILITY = "visibility",
		RESIZE = "resize",
		SCROLL = "scroll",
		NEW_SPAN = "<span/>",
		TYPE = "type",
		PRESSED = "pressed";
	
	var UA_SUPPORTS_FIXED = (!$.UA.ie || $.UA.ie < 8);
		
	var Button = function () {
		Button.superclass.constructor.apply(this, arguments);
		var myself = this.set(CLASS_NAME, BUTTON).addAttrs({
			type: {
				writeOnce: TRUE,
				value: "push"
			},
			boundingBox: {
				readOnly: TRUE,
				value: $(NEW_SPAN)
			},
			contentBox: {
				readOnly: TRUE,
				value: $(NEW_SPAN)
			}
		});
		var type = myself.get(TYPE);
		var tag =	type == "push" ? "button" :
					type == "link" ? "a" : "a";
					
		myself.addAttr("buttonNode", {
			readOnly: TRUE,
			value: $("<" + tag + "/>")
		});
		
		myself.on(RENDER, function () {
			var node = myself.get("buttonNode").html(myself.get("text"));
			var prefix = myself.get(CLASS_PREFIX);
			var boundingBox = myself.get(BOUNDING_BOX).addClass(prefix + Button.NAME, prefix + type + "-" + Button.NAME);
			var contentBox = myself.get(CONTENT_BOX).addClass("first-child");
			node.on("mouseover", function () {
				boundingBox.addClass(prefix + Button.NAME + "-hover", prefix + type + Button.NAME + "-hover");
			}).on("mouseout", function () {
				boundingBox.removeClass(prefix + Button.NAME + "-hover", prefix + type + Button.NAME + "-hover");
			}).on("focus", function () {
				boundingBox.addClass(prefix + Button.NAME + "-focus", prefix + type + Button.NAME + "-focus");
			}).on("blur", function () {
				boundingBox.removeClass(prefix + Button.NAME + "-focus", prefix + type + Button.NAME + "-focus");
			}).on(CLICK, function (e) {
				node._node.blur();
				if (myself.fire(PRESSED)) {
					e.preventDefault();
				}
			});
			node.appendTo(contentBox.appendTo(boundingBox));
		});
		myself.on("afterRender", function () {
			myself.get(BOUNDING_BOX).css(VISIBILITY, "inherit");
		});
	};
	Button.NAME = "button";
	$.extend(Button, $.Widget, {
		disable: function () {
			
		},
		enable: function () {
			
		},
		blur: function () {
			
		},
		focus: function () {
			
		}
	});
	
	var Module = function () {
		Module.superclass.constructor.apply(this, arguments);
		var myself = this;
		
		var containers = {};
		var containerSetter = function (type) {
			return function (value) {
				var container = containers[type];
				if (!container) {
					container = $(NEW_DIV);
				}
				container.children().remove();
				if (Lang.isString(value)) {
					container.html(value);
				} else {
					container.append(value);
				}
				containers[type] = container;
				return container;
			};
		};
		myself.addAttrs({
			header: {
				setter: containerSetter(HEADER),
				validator: Lang.isValue
			},
			body: {
				value: "",
				setter: containerSetter(BODY),
				validator: Lang.isValue
			},
			footer: {
				setter: containerSetter(FOOTER),
				validator: Lang.isValue
			}
		});
		myself.set(CLASS_NAME, Module.NAME);
						
		myself.on(RENDER, function () {
			var boundingBox = myself.get(BOUNDING_BOX);
			var classPrefix = myself.get(CLASS_PREFIX);
			Hash.each(containers, function (name, container) {
				container.addClass(name).appendTo(boundingBox);
			});
		});
	};
	Module.NAME = "module";
	$.extend(Module, $.Widget);
	
	var Overlay = function () {
		Overlay.superclass.constructor.apply(this, arguments);
		var myself = this.addAttrs({
			center: {
				value: TRUE
			},
			fixed: {
				value: FALSE
			},
			width: {
				value: 300,
				validator: Lang.isNumber
			},
			height: {
				value: 0,
				validator: Lang.isNumber
			},
			top: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(BOTTOM);
					return value;
				}
			},
			left: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(RIGHT);
					return value;
				}
			},
			bottom: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(TOP);
					return value;
				}
			},
			right: {
				validator: Lang.isNumber,
				setter: function (value) {
					myself.unset(LEFT);
					return value;
				}
			}
		});
		myself.set(CLASS_NAME, Overlay.NAME);
		
		var rendered = FALSE;
		myself.on("rendered", function () {
			rendered = TRUE;
		});
		
		var center = function (boundingBox) {
			var screenSize = $.screenSize();
			boundingBox.css({
				left: (screenSize.width - (rendered ? boundingBox.width() : myself.get(WIDTH))) / 2 + PX,
				top: (screenSize.height - (rendered ? boundingBox.height() : myself.get(HEIGHT))) / 2 + PX
			});
		};
		
		ArrayHelper.each([HEIGHT, WIDTH], function (size) {
			myself.on(size + "Change", function (e, value) {
				var boundingBox = myself.get(BOUNDING_BOX)[size](value);
				if (myself.get(CENTER)) {
					center(boundingBox);
				}
			});
		});
		
		var setPosition = function (boundingBox) {
			var bodyStyle = $($.context.body).currentStyle();
			ArrayHelper.each([LEFT, TOP, BOTTOM, RIGHT], function (position) {
				var orientation = position.substr(0, 1).toUpperCase() + position.substr(1);
				var bodyMargin = $.pxToFloat(bodyStyle["padding" + orientation]) + $.pxToFloat(bodyStyle["margin" + orientation]);
				if (UA_SUPPORTS_FIXED) {
					boundingBox.css(position, myself.isSet(position) ? ((myself.get(position) - bodyMargin + PX)) : AUTO);
				} else {
					var screenSize = $.screenSize();
					if (position == BOTTOM) {
						boundingBox.css(TOP, myself.isSet(position) ? ((screenSize.height - myself.get(HEIGHT) - bodyMargin + boundingBox.scrollTop()) + PX) : AUTO);
					} else if (position == RIGHT) {
						boundingBox.css(LEFT, myself.isSet(position) ? ((screenSize.width - myself.get(WIDTH) - bodyMargin + boundingBox.scrollLeft()) + PX) : AUTO);
					} else {
						boundingBox.css(position, myself.isSet(position) ? ((myself.get(position) - bodyMargin + PX)) : AUTO);
					}
				}
			});
		};
		
		myself.on(RENDER, function (e) {
			var win = $($.win);
			var boundingBox = myself.get(BOUNDING_BOX);
			var header = myself.get(HEADER);
			if (header) {
				boundingBox.append(header);
			}
			var body = myself.get(BODY);
			if (body) {
				boundingBox.append(body);
			}
			var footer = myself.get(FOOTER);
			if (footer) {
				boundingBox.append(footer);
			}
			var fixed = myself.get(FIXED);
			var pos = fixed && UA_SUPPORTS_FIXED ? FIXED : "absolute";
			var height = myself.get(HEIGHT);
			boundingBox.css("position", pos).width(myself.get(WIDTH));
			if (height) {
				boundingBox.height(height);
			}
			setPosition(boundingBox);
			if (myself.get(CENTER)) {
				center(boundingBox);
				win.on(RESIZE, function () {
					center(myself.get(BOUNDING_BOX));
				});
				if (fixed || !UA_SUPPORTS_FIXED) {
					$($.win).on(SCROLL, function () {
						center(myself.get(BOUNDING_BOX));
					});
				}
			} else if (fixed && !UA_SUPPORTS_FIXED) {
				win.on(SCROLL, function () {
					setPosition(myself.get(BOUNDING_BOX));
				});
				win.on(RESIZE, function () {
					setPosition(myself.get(BOUNDING_BOX));
				});
			}
		});
		myself.on("afterRender", function () {
			var draggable = myself.get("draggable");
			if (draggable) {
				if ($.DragDrop) {
					var head = myself.get(HEADER);
					myself.dd = new $.Drag({
						node: myself.get(BOUNDING_BOX)
					});
					if (head) {
						myself.dd.addHandler(head);
					}
				} else {
					$.error("The 'draggable' property needs the DragDrop module");
				}
			}
		});
	};
	Overlay.NAME = "overlay";
	$.extend(Overlay, Module);
	
	var Panel = function () {
		Panel.superclass.constructor.apply(this, arguments);
		var myself = this.set(CLASS_NAME, Panel.NAME).addAttrs({
			contentBox: {
				readOnly: TRUE,
				value: $(NEW_DIV)
			},
			underlay: {
				readOnly: TRUE,
				value: $(NEW_DIV).addClass(UNDERLAY)
			},
			shadow: {
				value: TRUE
			}
		}).on(HEIGHT + "Change", function (e, height) {
			myself.get(CONTENT_BOX).height(height);
		});
		
		/*
		 * Close button logic
		 */
		var closeButton = $("<a/>").attr("href", "#").addClass("container-close").on(CLICK, function (e) {
			if (myself.fire(CLOSE)) {
				myself.hide();
			}
			e.preventDefault();
		});
		myself.addAttr(CLOSE, {
			value: TRUE,
			validator: Lang.isBoolean,
			setter: function (value) {
				if (value) {
					closeButton.show();
				} else {
					closeButton.hide();
				}
				return value;
			}
			
		}).on(RENDER, function (e) {
			var height = myself.get(HEIGHT);
			var contentBox = myself.get(CONTENT_BOX);
			if (height) {
				contentBox.height(height);
			}
			var prefix = myself.get(CLASS_PREFIX);
			var boundingBox = myself.get(BOUNDING_BOX).addClass(prefix + Panel.NAME + "-container");
			var head = myself.get(HEADER);
			var body = myself.get(BODY);
			var footer = myself.get(FOOTER);
			var sp = Panel;
			while (sp.NAME) {
				contentBox.addClass(prefix + sp.NAME);
				sp = sp.superclass.constructor;
			}
			if (head) {
				contentBox.append(head.remove(TRUE));
			}
			if (body) {
				contentBox.append(body.remove(TRUE));
			}
			if (footer) {
				contentBox.append(footer.remove(TRUE));
			}
			if (myself.get(CLOSE)) {
				closeButton.appendTo(contentBox);
			}
			contentBox.appendTo(boundingBox).css(VISIBILITY, "inherit");
			boundingBox.append(myself.get(UNDERLAY));
			if (myself.get(SHADOW)) {
				boundingBox.addClass(SHADOW);
			}
		});
	};
	Panel.NAME = "panel";
	$.extend(Panel, Overlay);
	
	var SimpleDialog = function () {
		SimpleDialog.superclass.constructor.apply(this, arguments);
		var myself = this;
		myself.addAttrs({
			footer: {
				readOnly: TRUE,
				value: $(NEW_DIV).addClass(FOOTER)
			},
			buttons: {
				validator: Lang.isArray,
				value: []
			}
		}).set(CLASS_NAME, SimpleDialog.NAME);
		
		
		myself.on(RENDER, function (e) {
			myself.get(BOUNDING_BOX).addClass(myself.get(CLASS_PREFIX) + SimpleDialog.NAME);
			var buttonArea = $(NEW_DIV).addClass("button-group");
			ArrayHelper.each(myself.get("buttons"), function (config, i) {
				var button = new Button(config);
				if (i === 0) {
					button.get(BOUNDING_BOX).addClass("default");
				}
				button.on(PRESSED, function () {
					myself.hide();
				}).render(buttonArea);
			});
			myself.get(FOOTER).append(buttonArea);
		});
	};
	SimpleDialog.NAME = "dialog";
	$.extend(SimpleDialog, Panel);
	
	$.add({
		Module: Module,
		Overlay: Overlay,
		Panel: Panel,
		SimpleDialog: SimpleDialog,
		Button: Button
	});
	
});
