/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * A TabView
 * @module tabs
 * @requires jet, lang, node, base
 */
jet().add("tabs", function ($) {
	var SELECTED = "selected";
	var Lang = $.Lang;
	var ArrayHelper = $.Array,
		Widget = $.Widget;
	
	var LI = "<li/>",
		DIV = '<div/>',
		BOUNDING_BOX = 'boundingBox',
		CONTENT_BOX = "contentBox",
		PANEL = 'panel',
		HREF = 'href',
		PANEL_CONTAINER = 'panelContainer';
	
	/**
	 * A tab instance has a label and a panel
	 * @class Tab
	 * @extends Widget
	 * @uses WidgetChild
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.Tab = Widget.create('tab', [$.WidgetChild], {
		
		ATTRS: {
			/**
			 * @config panel
			 * @description The element or text to use as a panel
			 * @writeOnce
			 */
			panel: {
				value: $(DIV),
				writeOnce: true
			},
			/**
			 * @config triggerEvent
			 * @description Event that triggers the selection of this tab
			 * @default "click"
			 * @type String
			 */
			triggerEvent: {
				value: "click"
			},
			/**
			 * @config labelContent
			 * @description Gets/sets the content of the tab's label
			 */
			labelContent: {
				getter: function () {
					return this.get(CONTENT_BOX).children();
				},
				setter: function (value) {
					var label = this.get(CONTENT_BOX);
					label.children().remove();
					label.append(value);
					return value;
				}
			},
			/**
			 * @config panelContent
			 * @description Gets/sets the content of the tab's panel
			 */
			panelContent: {
				getter: function () {
					return this.get(PANEL).children();
				},
				setter: function (value) {
					var panel = this.get(PANEL);
					panel.children().remove();
					panel.append(value);
					return value;
				}
			},
			/**
			 * @config href
			 * @description Href attribute for this tab's label. Useful for progressive enhancement
			 * @default "#"
			 * @writeOnce
			 */
			href: {
				value: '#',
				writeOnce: true
			}
		},
		
		EVENTS: {
			
			triggerEventChange: function (e, oldVal, newVal) {
				this.unbind(oldVal, this._selectHandler).on(newVal, this._selectHandler);
			},
			
			render: function () {
				this.get(CONTENT_BOX).attr(HREF, this.get(HREF));
				this.on(this.get("triggerEvent"), this._selectHandler);
				this.get(PANEL).addClass(this.getClassName(PANEL)).appendTo(this.get('parent').get(PANEL_CONTAINER));
			},
			
			destroy: function () {
				this.get(PANEL).remove();
			}
			
		},
		
		HTML_PARSER: {
			panel: function () {
				return $(this.get('parent').get(BOUNDING_BOX).children('div')[0]).children()[this.get('index')];
			}
		}
		
	}, {
		BOUNDING_TEMPLATE: '<li/>',
		CONTENT_TEMPLATE: '<a/>',
		
		_selectHandler: function (e, domEvent) {
			domEvent.preventDefault();
			domEvent.stopPropagation();
			this.select();
		}
	});
	
	/**
	 * A view of tabs
	 * @class TabView
	 * @extends Widget
	 * @uses WidgetParent
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.TabView = Widget.create('tabview', [$.WidgetParent], {
		ATTRS: {
			/**
			 * @config panelContainer
			 * @description Node that contains all tab panels
			 * @writeOnce
			 * @type NodeList
			 */
			panelContainer: {
				value: $(DIV),
				writeOnce: true
			}
			
		},
		
		EVENTS: {
			render: function () {
				this.get(PANEL_CONTAINER).addClass(this.getClassName(PANEL, 'container')).appendTo(this.get(BOUNDING_BOX));
			}
		},
		
		HTML_PARSER: {
			panelContainer: function () {
				return this.get(BOUNDING_BOX).children('div')[0];
			}
		}
	}, {
		
		CONTENT_TEMPLATE: '<ul/>'
		
	});
	
});