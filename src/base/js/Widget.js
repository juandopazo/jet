
if (!jet.Widget) {
	jet.Widget = {};
}
if (!Lang.isNumber(jet.Widget._uid)) {
	jet.Widget._uid = -1;
}
if (!jet.Widget._instances) {
	jet.Widget._instances = {};
}

/**
 * Base class for all widgets. 
 * Provides show, hide, render and destroy methods, the rendering process logic
 * and basic attributes shared by all widgets 
 * @class Widget
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function Widget() {
	Widget.superclass.constructor.apply(this, arguments);
}
extend(Widget, Base, {
	
	BOUNDING_TEMPLATE: '<div/>',
	CONTENT_TEMPLATE: '<div/>',

	_domEventProxy: function (e) {
		this.fire(e.type, e);
	},
	
	/**
	 * Hides the widget
	 * @method hide
	 * @chainable
	 */
	hide: function () {
		if (this.fire("hide")) {
			this.get(BOUNDING_BOX).addClass(this.getClassName("hidden"));
			return this.fire("afterHide");
		}
		return this;
	},
	/**
	 * Shows the widget
	 * @method show
	 * @chainable
	 */
	show: function () {
		if (this.fire("show")) {
			this.get(BOUNDING_BOX).removeClass(this.getClassName("hidden"));
			return this.fire("afterShow");
		}
		return this;
	},
	/**
	 * Focuses the widget
	 * @method focus
	 * @chainable
	 */
	focus: function () {
		if (this.fire("focus")) {
			this.set("focused", true);
		}
		return this;
	},
	/**
	 * Blurrs the element
	 * @method blur
	 * @chainable
	 */
	blur: function () {
		if (this.fire("blur")) {
			this.set("focused", false);
		}
		return this;
	},
	/**
	 * Starts the rendering process. The rendering process is based on custom events.
	 * The widget class fires a "render" event to which all subclasses must subscribe.
	 * This way all listeners are fired in the order of the inheritance chain. ie:
	 * In the Overlay class, the render process is:
	 * <code>render() method -> Module listener -> Overlay listener -> rest of the render() method (appends the boundingBox to the srcNode)</code>
	 * This helps to use an easy pattern of OOP CSS: each subclass adds a CSS class name to the boundingBox,
	 * for example resulting in <div class="jet-module jet-overlay jet-panel"></div>. That way
	 * a panel can inherit css properties from module and overlay.
	 * @method render
	 * @param {NodeList|HTMLElement} target
	 * @chainable
	 */
	render: function (target) {
		if (!this.get('rendered')) {
			var self = this;
			var boundingBox = this.get(BOUNDING_BOX);
			var contentBox = this.get(CONTENT_BOX);
			var srcNode = this.get(SRC_NODE);
			var className, classPrefix = this.get(CLASS_PREFIX);
			var classes = this._classes;
			Hash.each(Widget.DOM_EVENTS, function (name, activated) {
				if (activated) {
					self._handlers.push(boundingBox.on(name, self._domEventProxy, self));
				}
			});
			if (target) {
				srcNode = target;
				self.set(SRC_NODE, target);
			}

			if (this.constructor == Widget) {
				classes = [Widget];
			} else {
				classes.shift();
			}
			
			A.each([WIDTH, HEIGHT], function (size) {
				var value = self.get(size);
				if (Lang.isNumber(value)) {
					boundingBox[size](value);
				}
				self.on(size + 'Change', function (e, newVal) {
					newVal = Lang.isNumber(newVal) ? newVal : '';
					self.get(BOUNDING_BOX)[size](newVal);
				});
			});
			
			A.each(classes, function (construct) {
				className = [classPrefix, construct.NAME].join(DASH);
				boundingBox.addClass(className);
				contentBox.addClass([className, CONTENT].join(DASH));
			});
			
			if (boundingBox[0] != contentBox[0]) {
				boundingBox.append(contentBox.css(VISIBILITY, 'inherit'));
			}
			boundingBox.attr('id', this.getClassName(self._uid));
			/**
			 * Render event. Preventing the default behavior will stop the rendering process
			 * @event render
			 * @see Widget.render()
			 */
			if (this.fire("render")) {
				
				if (!boundingBox.inDoc()) {
					boundingBox.appendTo(srcNode);
				}
				/**
				 * Fires after the render process is finished
				 * @event afterRender
				 */
				self.set("rendered", true).focus();
				setTimeout(function () {
					self.fire("afterRender");
				}, 0);
			}
		}
		return this;
	},
	/**
	 * Destroys the widget by removing the elements from the dom and cleaning all event listeners
	 * @method destroy
	 */
	destroy: function () {
		var self = this;
		/**
		 * Preventing the default behavior will stop the destroy process
		 * @event destroy
		 */
		if (this.fire(DESTROY)) {
			A.each(this._handlers, function (handler) {
				if (handler.detach) {
					handler.detach();
				}
			});
			/*
			 * Avoiding memory leaks, specially in IE
			 */
			this.get(BOUNDING_BOX).unbindAll(true).remove();
		}
	},
	
	_parseHTML: function () {
		var self = this;
		var boundingBox = this.get(BOUNDING_BOX);
		if (boundingBox[0] && boundingBox.inDoc()) {
			A.each(this._classes, function (someClass) {
				Hash.each(someClass.HTML_PARSER || {}, function (attr, parser) {
					var val = parser.call(self, boundingBox);
					if (Lang.isValue(val) && (!(val instanceof $.NodeList) || val[0])) {
						self.set(attr, val);
					}
				});
			});
		}
	},
	
	initializer: function () {
		this._handlers = [$(this.get('win')).on(UNLOAD, this.destroy, this)];
		
		this._uid = ++jet.Widget._uid;
		jet.Widget._instances[this.getClassName(this._uid)] = this;
		
		if (!this.get(BOUNDING_BOX)) {
			this.set(BOUNDING_BOX, this.BOUNDING_TEMPLATE);
		}
		if (!this.get(CONTENT_BOX)) {
			this.set(CONTENT_BOX, this.CONTENT_TEMPLATE || this.get(BOUNDING_BOX));
		}
		
		this._parseHTML();
	},
	
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join('-');
	}

}, {
	
	CSS_PREFIX: "jet",
	
	NAME: 'widget',
	
	DOM_EVENTS: {
		click: 1,
		keypress: 1,
		mousedown: 1,
		mouseup: 1,
		mouseover: 1,
		mouseout: 1
	},
	
	ATTRS: {
		/**
		 * @config srcNode
		 * @description The node to which the widget will be appended to. May be set as a 
		 * configuration attribute, with a setter or as the first parameter of the render() method
		 * @type DOMNode | NodeList
		 */
		srcNode: {
			value: $($.context.body),
			setter: $
		},
		/**
		 * @config classPrefix
		 * @description Prefix for all CSS clases. Useful for renaming the project
		 * @default "jet"
		 * @writeOnce
		 */
		classPrefix: {
			writeOnce: true,
			getter: function (val) {
				return val || Widget.CSS_PREFIX;
			}
		},
		/**
		 * @config rendered
		 * @description Rendered status. Shouldn't be changed by anything appart from the Widget.render() method
		 * @writeOnce
		 * @default false
		 */
		rendered: {
			value: false
		},
		/**
		 * The bounding box contains all the parts of the widget
		 * @config boundingBox
		 * @writeOnce
		 * @type NodeList
		 * @default uses BOUNDING_TEMPLATE instance property
		 */
		boundingBox: {
			setter: $
		},
		/**
		 * @config contentBox
		 * @description Another container inside the boundingBox added in order to have a more complex design
		 * @writeOnce
		 * @type NodeList
		 * @default uses CONTENT_TEMPLATE instance property
		 */
		contentBox: {
			setter: $
		},
		win: {
			value: $.win
		},
		doc: {
			getter: function () {
				return this.get('win').document;
			},
			setter: function (val) {
				this.set('win', val.parentWindow || val.defaultView);
				return val;
			}
		},
		/**
		 * @config width
		 * @description The width of the overlay
		 * @type Number
		 */
		width: {
			validator: Lang.isNumber
		},
		/**
		 * @config height
		 * @description The height of the overlay.
		 * If set to 0 (zero) the height changes with the content
		 * @type Number
		 */
		height: {
			validator: Lang.isNumber
		},
		/**
		 * @config id
		 * @description The id of the widget
		 * @readOnly
		 */
		 id: {
			getter: function () {
				return this.getClassName(this._uid);
			},
			readOnly: true
		 }
	},
	
	HTML_PARSER: {
		contentBox: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			if (boundingBox) {
				return boundingBox.first();
			}
		}
	},
	
	getByNode: function (node) {
		node = $(node)[0];
		var de = node.ownerDocument.documentElement;
		while (node && node != de) {
			if (node.id && jet.Widget._instances[node.id]) {
				return jet.Widget._instances[node.id];
			}
			node = node.parentNode;
		}
		return null;
	}
	
});