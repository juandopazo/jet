
if (!Global.overlays) {
	Global.overlays = [];
}
if (!Lang.isNumber(Global.ovZindex)) {
	Global.ovZindex = 10;
}
/**
 * An Overlay is a Module that floats in the page (doesn't have position static)
 * @class Overlay
 * @constructor
 * @extends Module
 * @uses WidgetStack
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Overlay = Base.create('overlay', $.Module, [$.WidgetAlignment, $.WidgetStack], {
	
	ATTRS: {
		/**
		 * @attribute draggable
		 * @description If true, the overlay can be dragged. Requires $.Drag
		 * @default false
		 * @type Boolean
		 * @writeOnce
		 */
		draggable: {
			validator: function () {
				return !!$.Drag;
			},
			value: false,
			writeOnce: true
		},
		/**
		 * @attribute modal
		 * @description Whether this overlay should stop the user from interacting with the rest of the page
		 * @default false
		 * @type Boolean
		 * @writeOnce
		 */
		modal: {
			value: false,
			writeOnce: true
		},
		
		startZIndex: {
			getter: function () {
				return Global.overlays.length - 1;
			},
			readOnly: true
		},
		/**
		 * @attribute modalBox
		 * @attribute Node that prevents the user from interacting with the page if 'modal' is set to true
		 * @type NodeList
		 * @readOnly
		 */
		modalBox: {
			setter: $
		}
	}
	
}, {
	
	MODAL_TEMPLATE: '<div/>',

	_resizeModal: function () {
		var screenSize = DOM.screenSize();
		this.get(MODAL_BOX).width(screenSize.width).height(screenSize.height);
	},
	_showModal: function () {
		if (this.get('modal')) {
			this.get(MODAL_BOX).show();
		}
	},
	_hideModal: function () {
		this.get(MODAL_BOX).hide();
	},
	
	initializer: function () {
		if (!this.get(MODAL_BOX)) {
			this.set(MODAL_BOX, this.MODAL_TEMPLATE);
		}
	},
	
	renderUI: function (boundingBox) {
		var screenSize = DOM.screenSize();
		var startZIndex = this.get('startZIndex');
		var modal = this.get(MODAL_BOX).css({
			position: 'absolute',
			top: "0px",
			left: "0px",
			background: "#000",
			visibility: !this.get("modal") ? "hidden" : "",
			zIndex: this.get('zIndex') - 1,
			opacity: 0.4
		}).width(screenSize.width).height(screenSize.height).appendTo($.config.doc.body);
	},
	
	bindUI: function () {
		this.after('show', this._showModal);
		this.after('hide', this._hideModal);
		this.on('mousedown', this.focus);
		this._handlers.push($($.config.win).on(RESIZE, this._resizeModal, this));
	},
	
	syncUI: function (boundingBox) {
		var head = this.get(HEADER);
		if (this.get('draggable')) {
			this.dd = new $.Drag({
				node: boundingBox,
				handlers: head
			});
		}
	},
	
	destructor: function () {
		if (this.dd) {
			this.dd.destroy();
		}
	}
});