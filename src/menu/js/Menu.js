
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