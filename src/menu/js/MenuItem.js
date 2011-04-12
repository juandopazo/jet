
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
	
	_uiMenuLabelContentChange: function (e, newVal) {
		this.get(LABEL_NODE).setContent(newVal);
	},
	
	_uiMenuAfterSelected: function (e, newVal) {
		var olay = this._olay;
		if (this.get(CHILDREN).length > 0) {
			if (!olay.get('rendered')) {
				olay.render(this.get(BOUNDING_BOX));
			}
			olay.set('visible', newVal);
		}
	},
	
	renderUI: function (boundingBox) {
		var contentBox = this.get(CONTENT_BOX).attr('href', '#');
		var olay = this._olay =  new $.Overlay({
			align: {
				node: boundingBox,
				points: this.get('align')
			},
			visible: this.get('selected')
		});
		this.get(LABEL_NODE).addClass(this.getClassName('label')).html(this.get('labelContent')).appendTo(contentBox);
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
	
	_toggleSelected: function (e) {
		e.preventDefault();
		this.toggle();
	}
});