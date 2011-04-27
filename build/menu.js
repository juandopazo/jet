/**
 * OS-like menus for navigation
 * @module menu
 * @requires base,container
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('menu', function ($) {

			
var Lang = $.Lang,
	A = $.Array,
	Base = $.Base,
	Widget = $.Widget;

var BOUNDING_BOX = 'boundingBox',
	CONTENT_BOX = 'contentBox',
	HOVER = 'hover',
	CHILDREN = 'children',
	LABEL_NODE = 'labelNode',
	
	OS_INTERACTION = 'os';
	
/**
 * A menu item
 * @class MenuItem
 * @extends Widget
 * @uses WidgetParent
 * @uses WidgetChild
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
$.MenuItem = Base.create('menuitem', Widget, [$.WidgetParent, $.WidgetChild], {
	
	ATTRS: {
		/**
		 * @attribute labelNode
		 * @description A pointer to the node containing the label
		 * @default <span/>
		 */
		labelNode: {
			value: '<span/>',
			setter: $
		},
		/**
		 * @attribute labelContent
		 * @description The content of the Menu's label
		 */
		labelContent: {
			value: ''
		},
		defaultChildType: {
			value: 'MenuItem'
		},
		align: {
			value: {
				align: [$.WidgetAlignment.TopLeft, $.WidgetAlignment.TopRight]
			}
		},
		atLeastOne: {
			value: false
		}
	}
	
}, {
	BOUNDING_TEMPLATE: '<li/>',
	CONTENT_TEMPLATE: '<a/>',
	CONTAINER_TEMPLATE: '<ul/>',
	
	initializer: function () {
		this.set('childrenContainer', this.CONTAINER_TEMPLATE);
		this.set(LABEL_NODE, this.get(LABEL_NODE));
	},
	
	_uiMenuMouseover: function () {
		var parent = this.get('parent');
		this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
		if (parent.get('interaction') == OS_INTERACTION && parent.get('selection')) {
			this.select();
		}
	},
	
	_uiMenuMouseout: function () {
		this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
	},
	
	_uiMenuLabelContentChange: function (e) {
		this.get(LABEL_NODE).setContent(e.newVal);
	},
	
	_uiMenuAfterSelected: function (e) {
		var olay = this._olay;
		if (this.get(CHILDREN).length > 0) {
			if (!olay.get('rendered')) {
				olay.render(this.get(BOUNDING_BOX));
			}
			olay.set('visible', e.newVal);
		}
	},
	
	renderUI: function (boundingBox, contentBox) {
		var align = this.get('align');
		align.node = boundingBox;
		var olay = this._olay =  new $.Overlay({
			align: align,
			visible: this.get('selected')
		});
		this.get(LABEL_NODE).addClass(this.getClassName('label')).appendTo(contentBox);
		if (this.get(CHILDREN).length > 0) {
			olay.render(boundingBox);
			boundingBox.addClass(this.getClassName('submenu'));
		}
		this.get('childrenContainer').addClass(this.getClassName('container')).appendTo(olay.get('body'));
	},
	
	bindUI: function () {
		this._handlers.push(this.get(CONTENT_BOX).on('click', this._toggleSelected, this));
		
		this.on('mouseover', this._uiMenuMouseover);
		this.on('mouseout', this._uiMenuMouseout);
		this.after('labelContentChange', this._uiMenuLabelContentChange);
		this.after('selectedChange', this._uiMenuAfterSelected);
	},
	
	syncUI: function () {
		this.get(LABEL_NODE).setContent(this.get('labelContent'));
	},
	
	_toggleSelected: function (e) {
		e.preventDefault();
		this.toggle();
	}
});
/**
 * A navigation menu
 * @class Menu
 * @extends Widget
 * @uses WidgetParent
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
$.Menu = Base.create('menu', Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'MenuItem'
		},
		align: {
			value: {
				align: [$.WidgetAlignment.TopLeft, $.WidgetAlignment.BottomLeft]
			}
		},
		multiple: {
			value: false,
			readOnly: true
		},
		interaction: {
			value: OS_INTERACTION,
			writeOnce: true
		}
	},
	
	EVENTS: {
		addChild: function (e) {
			var child = e.child;
			if (!(child instanceof $.MenuItem)) {
				child.align = child.align || this.get('align');
			}
		},
		afterAddChild: function (e) {
			var child = e.child;
			if (this.get('interaction') == OS_INTERACTION) {
				child._handlers.push(child.on('mouseover', $.bind(this._onMenuMouseOver, this)));
				child._handlers.push(child.on('mouseout', $.bind(this._onMenuMouseOut, this)));
			}
		},
		click: function (e) {
			var target = e.domEvent.target;
			var selection;
			if (!this.get('multiple') && target == this.get(BOUNDING_BOX)[0] || target == this.get(CONTENT_BOX)[0]) {
				selection = this.get('selection');
				if (selection) {
					selection.unselect();
				}
			}
		}
	}
}, {
	CONTENT_TEMPLATE: '<ul/>',
	
	_onMenuMouseOver: function () {
		if (this._menuTimeout) {
			clearTimeout(this._menuTimeout);
		}
	},
	
	_onMenuMouseOut: function () {
		var self = this;
		if (this._menuTimeout) {
			clearTimeout(this._menuTimeout);
		}
		this._menuTimeout = setTimeout(function () {
			var selection = self.get('selection');
			if (Lang.isArray(selection)) {
				A.each(selection, function (child) {
					child.unselect();
				});
			} else if (selection) {
				selection.unselect();
			}
		}, 1000);
	},
	
	initializer: function () {
		if (this.get('interaction') == OS_INTERACTION) {
			this.on('mouseout', this._onMenuMouseOut);
			this.on('mouseover', this._onMenuMouseOver);
		}
	}
	
});
			
});