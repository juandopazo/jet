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
		CONTENT_BOX = "contentBox",
		PANEL = "panel";
	
	/**
	 * A tab instance has a label and a panel
	 * @class Tab
	 * @extends Base
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.Tab = Widget.create('tab', {
		/**
		 * @config label
		 * @description The text to use as label
		 * @type String | LI Node
		 * @required
		 */
		label: {
			required: true,
			setter: function (value) {
				return Lang.isString(value) ? $(LI).append($("<a/>").html(value)) : $(value);
			}
		},
		/**
		 * @config panel
		 * @description The element or text to use as a panel
		 * @type String | DOM Node
		 * @required
		 */
		panel: {
			required: true,
			setter: function (value) {
				return Lang.isString(value) ? $("<div/>").html(value) : $(value);
			} 
		},
		/**
		 * @config selected
		 * @description True if this is the currently selected tab of a TabView
		 * @type Boolean
		 * @default false
		 */
		selected: {
			value: false
		},
		
		labelContent: {
			setter: function (value) {
				var label = this.get(CONTENT_BOX);
				label.children().remove();
				label.append(value);
				return value;
			}
		},
		triggerEvent: {
			value: "click"
		},
		panelContent: {
			setter: function (value) {
				var panel = this.get(PANEL);
				panel.children().remove();
				panel.append(value);
				return value;
			}
		},
		href: {
			value: '#',
			writeOnce: true
		}
	}, {
		
		triggerEventChange: function (e, oldVal, newVal) {
			this.get(CONTENT_BOX).unbind(oldVal, this._selectHandler).on(newVal, this._selectHandler);
		},
		
		render: function () {
			this.get(CONTENT_BOX).attr('href', this.get('href')).on(this.get("triggerEvent"), this._selectHandler);
			this.get(PANEL).addClass(this.getClassName('panel')).appendTo(this.get('parent').get('panelContainer'));
		},
		
		destroy: function () {
			this.get(CONTENT_BOX).unbind(this.get("triggerEvent"), this._selectHandler);
			this.get(PANEL).remove();
		}
		
	}, {
		BOUNDING_TEMPLATE: '<li/>',
		CONTENT_TEMPLATE: '<a/>',
		
		_selectHandler: function (e) {
			e.preventDefault();
			e.stopPropagation();
			this.select();
		}
	}, $.WidgetChild);
	
	/**
	 * A view of tabs
	 * @class TabView
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.TabView = Widget.create('tabview', {
		
		panelContainer: {
			value: $('<div/>'),
			writeOnce: true
		}
		
	}, {
		render: function () {
			this.get('panelContainer').addClass(this.getClassName('panel', 'container')).appendTo(this.get('boundingBox'));
		}
	}, {
		
		CONTENT_TEMPLATE: '<ul/>'
		
	}, $.WidgetParent);
	
});