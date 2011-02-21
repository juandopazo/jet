/**
 * OS-like menus for navigation
 * @module menu
 * @requires jet, node, base, widget-parentchild, widget-alignment, container
 * @namespace
 */
jet().add('menu', function ($) {
	
	var Lang = $.Lang,
		Widget = $.Widget;
	
	var BOUNDING_BOX = 'boundingBox',
		HOVER = 'hover';
		
	/**
	 * A menu item
	 * @class MenuItem
	 * @extends Widget
	 * @uses WidgetParent, WidgetChild
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.MenuItem = Widget.create('menuitem', Widget, [$.WidgetParent, $.WidgetChild], {
		
		ATTRS: {
			labelNode: {
				setter: $
			},
			labelContent: {
				value: ''
			},
			childType: {
				value: 'MenuItem',
				getter: function (val) {
					return Lang.isString(val) ? $[val] : val;
				}
			},
			align: {
				value: [$.WidgetAlignment.TopLeft, $.WidgetAlignment.TopRight]
			}
		},
		
		EVENTS: {
			render: function () {
				var boundingBox = this.get(BOUNDING_BOX);
				var contentBox = this.get('contentBox');
				var olay = this._olay =  new $.Overlay({
					align: {
						node: boundingBox,
						points: this.get('align')
					}
				});
				this.get('labelNode').appendTo(contentBox);
				olay.render(contentBox);
				this.get('childrenContainer').appendTo(olay.get('body'));
				if (this.get('children').length > 0) {
					boundingBox.addClass(this.getClassName('submenu'));
				}
				if (!this.get('selected')) {
					olay.hide();
				}
			},
			mouseover: function () {
				this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
			},
			mouseout: function () {
				this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
			},
			focus: function () {
				this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
			},
			blur: function () {
				this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
			},
			labelContentChange: function (e, newVal) {
				var labelNode = this.get('labelNode');
				labelNode.children().remove();
				labelNode.html(newVal);
			},
			afterSelectedChange: function (e, newVal) {
				var olay = this._olay;
				if (newVal) {
					olay.show();
				} else {
					olay.hide();
				}
			}
		}
		
	}, {
		BOUNDING_TEMPLATE: '<li/>',
		CONTENT_TEMPLATE: '<a/>',
		
		initializer: function () {
			this.set('childrenContainer', '<ul/>');
			this.set('labelNode', '<span/>');
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
	$.Menu = Widget.create('menu', Widget, [$.WidgetParent], {
		ATTRS: {
			childType: {
				value: 'MenuItem',
				getter: function (val) {
					return Lang.isString(val) ? $[val] : val;
				}
			},
			align: {
				value: [$.WidgetAlignment.TopLeft, $.WidgetAlignment.BottomLeft]
			}
		},
		
		EVENTS: {
			addChild: function (e, child) {
				if (!(child instanceof $.MenuItem)) {
					child.align = child.align || this.get('align');
				}
			}
		}
	}, {
		CONTENT_TEMPLATE: '<ul/>'
	});
	
});