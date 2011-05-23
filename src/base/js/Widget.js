
var BOUNDING_BOX = 'boundingBox',
	CONTENT_BOX = 'contentBox',
	SRC_NODE = 'srcNode',
	CONTENT = 'content',
	CLASS_PREFIX = 'classPrefix',
	UNLOAD = 'unload',
	VISIBILITY = 'visibility',
	DESTROY = 'destroy';

var WidgetNS = jet.namespace('Widget');
if (!Lang.isNumber(WidgetNS._uid)) {
	WidgetNS._uid = -1;
}
jet.namespace('Widget._instances');

/**
 * Base class for all widgets. 
 * Provides show, hide, render and destroy methods, the rendering process logic
 * and basic attributes shared by all widgets 
 * @class Widget
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Widget = $.Base.create('widget', $.Base, [], {
	
	/**
	 * @property CSS_PREFIX
	 * @description Default prefix for all css classes used in widget by the getClassName() method
	 * @static
	 * @default 'jet'
	 */
	CSS_PREFIX: 'jet',
	
	NAME: 'widget',
	
	/**
	 * @property DOM_EVENTS
	 * @description DOM events that are routed automatically to the widget instance
	 * @static
	 * @default { click: 1, keypress: 1, mousedown: 1, mouseup: 1, mouseover: 1, mouseout: 1 }
	 */
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
		 * @attribute srcNode
		 * @description The node to which the widget will be appended to. May be set as a 
		 * configuration attribute, with a setter or as the first parameter of the render() method
		 * @type DOMNode | NodeList
		 */
		srcNode: {
			value: $($.context.body),
			setter: $
		},
		/**
		 * @attribute classPrefix
		 * @description Prefix for all CSS clases. Useful for renaming the project
		 * @default Widget.CSS_PREFIX
		 * @writeOnce
		 */
		classPrefix: {
			writeOnce: true,
			getter: function (val) {
				return val || $.Widget.CSS_PREFIX;
			}
		},
		/**
		 * @attribute rendered
		 * @description Rendered status. Shouldn't be changed by anything appart from the Widget.render() method
		 * @writeOnce
		 * @default false
		 */
		rendered: {
			value: false
		},
		/**
		 * The bounding box contains all the parts of the widget
		 * @attribute boundingBox
		 * @writeOnce
		 * @type NodeList
		 * @default uses BOUNDING_TEMPLATE instance property
		 */
		boundingBox: {
			setter: $
		},
		/**
		 * @attribute contentBox
		 * @description Another container inside the boundingBox added in order to have a more complex design
		 * @writeOnce
		 * @type NodeList
		 * @default uses CONTENT_TEMPLATE instance property
		 */
		contentBox: {
			setter: $
		},
		/**
		 * @attribute width
		 * @description The width of the overlay
		 * @type Number
		 */
		width: {
			validator: Lang.isNumber
		},
		/**
		 * @attribute height
		 * @description The height of the overlay.
		 * If set to 0 (zero) the height changes with the content
		 * @type Number
		 */
		height: {
			validator: Lang.isNumber
		},
		/**
		 * @attribute id
		 * @description The id of the widget
		 * @default class prefix + widget count
		 */
		 id: {
		 },
		 /**
		  * @attribute visible
		  * @description The visibility status of the widget
		  * @default true
		  * @type Boolean
		  */
		 visible: {
		 	value: true,
		 	validator: Lang.isBoolean
		 },
		 /**
		  * @attribute disabled
		  * @description The disabled status of the widget
		  * @default false
		  * @type Boolean
		  */
		 disabled: {
		 	value: false,
		 	validator: Lang.isBoolean
		 }
	},
	
	HTML_PARSER: {
		contentBox: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			if (boundingBox && this.CONTENT_TEMPLATE) {
				return boundingBox.first();
			}
		}
	},
	
	/**
	 * @method getByNode
	 * @description Returns a widget instance based on a node
	 * @static
	 */
	getByNode: function (node) {
		node = $(node).getDOMNode();
		var de = node.ownerDocument.documentElement;
		while (node && node != de) {
			if (node.id && jet.Widget._instances[node.id]) {
				return jet.Widget._instances[node.id];
			}
			node = node.parentNode;
		}
		return null;
	}
	
}, {
	
	BOUNDING_TEMPLATE: '<div/>',
	CONTENT_TEMPLATE: '<div/>',

	_domEventProxy: function (e) {
		this.fire(e.type, { domEvent: e });
	},
	
	/**
	 * Shows the widget
	 * @method show
	 * @chainable
	 */
	show: function () {
		return this.set('visible', true);
	},
	/**
	 * Hides the widget
	 * @method hide
	 * @chainable
	 */
	hide: function () {
		return this.set('visible', false);
	},
	/**
	 * Enables the widget
	 * @method enable
	 * @chainable
	 */
	enable: function () {
		return this.set('enabled', true);
	},
	/**
	 * Disables the widget
	 * @method enable
	 * @chainable
	 */
	disable: function () {
		return this.set('enabled', false);
	},
	/**
	 * Focuses the widget
	 * @method focus
	 * @chainable
	 */
	focus: function () {
		return this.set('focused', true);
	},
	/**
	 * Blurrs the element
	 * @method blur
	 * @chainable
	 */
	blur: function () {
		return this.set('focused', false);
	},
	/**
	 * Starts the rendering process. The rendering process is based on custom events.
	 * The widget class fires a 'render' event to which all subclasses must subscribe.
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
			var classes = Class.getClasses(this);
			Hash.each($.Widget.DOM_EVENTS, function (name, activated) {
				if (activated) {
					self._handlers.push(boundingBox.on(name, self._domEventProxy, self));
				}
			});
			if (target) {
				srcNode = target;
				self.set(SRC_NODE, target);
			}

			if (this.constructor == $.Widget) {
				classes = [$.Widget];
			} else {
				classes.splice(0, 4);
			}
			
			$_Array.each([WIDTH, HEIGHT], function (size) {
				var value = self.get(size);
				if (Lang.isNumber(value)) {
					boundingBox[size](value);
				}
				self.after(size + 'Change', function (e) {
					newVal = Lang.isNumber(e.newVal) ? e.newVal : '';
					self.get(BOUNDING_BOX)[size](e.newVal);
				});
			});
			
			$_Array.each(classes, function (construct) {
				className = [classPrefix, construct.NAME].join(DASH);
				boundingBox.addClass(className);
				contentBox.addClass([className, CONTENT].join(DASH));
			});
			
			if (boundingBox.getDOMNode() != contentBox.getDOMNode()) {
				boundingBox.append(contentBox.css(VISIBILITY, 'inherit'));
			}
			if (!boundingBox.attr('id')) {
				boundingBox.attr('id', this.get('id'));
			}
			
			this._toggleVisibility({
				newVal: this.get('visible')
			});
			this._toggleDisabled({
				newVal: this.get('disabled')
			});
			/**
			 * Render event. Preventing the default behavior will stop the rendering process
			 * @event render
			 * @see Widget.render()
			 */
			if (this.fire('render')) {
				
				$_Array.each(['renderUI', 'bindUI', 'syncUI'], function (method) {
					$_Array.each(classes, function (constructor) {
						if (constructor.prototype.hasOwnProperty(method)) {
							constructor.prototype[method].call(self, boundingBox, contentBox);
						}
					});
				});
				
				if (!boundingBox.inDoc()) {
					boundingBox.appendTo(srcNode);
				}
				/**
				 * Fires after the render process is finished
				 * @event afterRender
				 */
				this.set('rendered', true).focus();
				setTimeout(function () {
					/**
					 * Fires after the render lifecycle finished. It is also fired after a timeout of 0 milliseconds, 
					 * so it is added to the execution queue rather than fired synchronously 
					 * @event afterRender
					 */
					self.fire('afterRender');
				}, 0);
			}
		}
		return this;
	},
	
	destructor: function () {
		this.get(BOUNDING_BOX).remove(true);
	},
	
	_parseHTML: function () {
		var self = this;
		var boundingBox = this.get(BOUNDING_BOX);
		if (boundingBox.getDOMNode() && boundingBox.inDoc()) {
			$_Array.each(this._classes, function (someClass) {
				Hash.each(someClass.HTML_PARSER || {}, function (attr, parser) {
					var val = parser.call(self, boundingBox);
					if (Lang.isValue(val) && (!(val instanceof $.NodeList) || val.getDOMNode())) {
						self.set(attr, val);
					}
				});
			});
		}
	},
	
	_toggleVisibility: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName('hidden'), !e.newVal);
	},
	
	_toggleDisabled: function (e) {
		this.get(BOUNDING_BOX).toggleClass(this.getClassName('disabled'), e.newVal);
	},
	
	_widgetIdChange: function (e) {
		this.get('boundingBox').attr('id', e.newVal);
		jet.Widget._instances[e.newVal] = this;
		delete jet.Widget._instances[e.prevVal];
	},
	
	initializer: function () {
		this._handlers = [$($.config.win).on(UNLOAD, this.destroy, this)];
		
		this._uid = ++jet.Widget._uid;
		
		var id = this.get('id');
		if (!id) {
			id = this.getClassName(this._uid);
			this.set('id', id);
		}
		this.after('idChange', this._widgetIdChange);
				
		jet.Widget._instances[id] = this;
		
		if (!this.get(BOUNDING_BOX)) {
			this.set(BOUNDING_BOX, this.BOUNDING_TEMPLATE);
		}
		if (!this.get(CONTENT_BOX)) {
			this.set(CONTENT_BOX, this.CONTENT_TEMPLATE || this.get(BOUNDING_BOX));
		}
		
		this.after('visibleChange', this._toggleVisibility);
		this.after('disabledChange', this._toggleDisabled);
		
		this._parseHTML();
	},
	
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join('-');
	}

});