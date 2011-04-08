
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
			value: [$.WidgetAlignment.TopLeft, $.WidgetAlignment.TopRight]
		}
	},
	
	EVENTS: {
		render: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			var contentBox = this.get(CONTENT_BOX).attr('href', '#');
			var olay = this._olay =  new $.Overlay({
				align: {
					node: boundingBox,
					points: this.get('align')
				}
			});
			this.get(LABEL_NODE).addClass(this.getClassName('label')).html(this.get('labelContent')).appendTo(contentBox);
			if (this.get(CHILDREN).length > 0) {
				olay.render(boundingBox);
			}
			this.get('childrenContainer').appendTo(olay.get('body'));
			if (this.get(CHILDREN).length > 0) {
				boundingBox.addClass(this.getClassName('submenu'));
			}
			if (!this.get('selected')) {
				olay.hide();
			}
			boundingBox.on('click', this._toggleSelected, this);
		},
		mouseover: function () {
			var parent = this.get('parent');
			this.get(BOUNDING_BOX).addClass(this.getClassName(HOVER));
			if (parent.get('interaction') == OS_INTERACTION && parent.get('selection')) {
				this.select();
			}
		},
		mouseout: function () {
			this.get(BOUNDING_BOX).removeClass(this.getClassName(HOVER));
		},
		afterLabelContentChange: function (e, newVal) {
			this.get(LABEL_NODE).setContent(newVal);
		},
		afterSelectedChange: function (e, newVal) {
			var olay = this._olay;
			if (newVal && this.get(CHILDREN).length > 0) {
				if (!olay.get('rendered')) {
					olay.render(this.get(BOUNDING_BOX));
				}
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
		this.set(LABEL_NODE, this.get(LABEL_NODE));
	},
	
	_toggleSelected: function (e) {
		if (e.target == this.get(LABEL_NODE)[0]) {
			e.preventDefault();
			this.toggle();
		}
	}
});