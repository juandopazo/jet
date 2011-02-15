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
	$.MenuItem = Widget.create('menuitem', [$.WidgetParent, $.WidgetChild], {
		
		EVENTS: {
			render: function () {
				var boundingBox = this.get(BOUNDING_BOX);
				var olay = new $.Overlay({
					align: {
						node: boundingBox,
						points: [$.WidgetAlignment.TopLeft, $.WidgetAlignment.TopRight]
					}
				});
				olay.render(this.get('contentBox'));
				this.get('childrenContainer').appendTo(olay.get('body'));
				if (this.get('children').length > 0) {
					boundingBox.addClass(this.getClassName('submenu'));
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
			}
		}
		
	}, {
		BOUNDING_TEMPLATE: '<li/>',
		CONTENT_TEMPLATE: '<a/>',
		
		initializer: function () {
			this.set('childrenContainer', '<ul/>');
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
	$.Menu = Widget.create('menu', [$.WidgetParent], {
		ATTRS: {
			childType: $.MenuItem
		}
	}, {
		CONTENT_TEMPLATE: '<ul/>'
	});
	
});