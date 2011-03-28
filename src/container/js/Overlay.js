
if (!Global.overlays) {
	Global.overlays = [];
}
if (!Lang.isNumber(Global.ovZindex)) {
	Global.ovZindex = 10;
}
/**
 * @class Overlay
 * @description An Overlay is a Module that floats in the page (doesn't have position static)
 * @extends Module
 * @uses WidgetAlignment
 * @uses WidgetStack
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Overlay = Base.create('overlay', $.Module, [$.WidgetAlignment, $.WidgetStack], {
	
	ATTRS: {
		/**
		 * @config draggable
		 * @description If true, the overlay can be dragged. Requires $.Drag
		 * @default false
		 * @type Boolean
		 */
		draggable: {
			validator: function () {
				return !!$.Drag;
			},
			value: false
		},
		/**
		 * @config modal
		 * @description Whether this overlay should stop the user from interacting with the rest of the page
		 * @default faulse
		 * @type Boolean
		 */
		modal: {
			value: false
		},
		
		startZIndex: {
			getter: function () {
				return Global.overlays.length - 1;
			},
			readOnly: true
		},
		/**
		 * @config modalBox
		 * @config Node that prevents the user from interacting with the page if 'modal' is set to true
		 * @type NodeList
		 * @readOnly
		 */
		modalBox: {
			setter: $
		}
	},
	
	EVENTS: {
		
		render: function (e) {
			var win = $(this.get('win'));
			var self = this;
			var boundingBox = this.get(BOUNDING_BOX);
			var screenSize = DOM.screenSize();
			var startZIndex = this.get('startZIndex');
			var modal = this.get(MODAL_BOX).css({
				position: 'absolute',
				top: "0px",
				left: "0px",
				background: "#000",
				visibility: !self.get("modal") ? "hidden" : "",
				zIndex: Global.ovZindex + startZIndex - 1,
				opacity: 0.4
			}).width(screenSize.width).height(screenSize.height).appendTo(this.get('doc').body);
			this._handlers.push(win.on(RESIZE, this._resizeModal, this));
			boundingBox.css('zIndex', Global.ovZindex + startZIndex);
			this.on("mousedown", this.focus, this);
		},
		
		afterRender: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			var head = this.get(HEADER);
			if (this.get("draggable")) {
				this.dd = new $.Drag({
					node: boundingBox,
					handlers: head
				});
			}	
		},
		
		focus: function () {
			A.remove(this, Global.overlays);
			Global.overlays.push(this);
			var olays = Global.overlays, i, length = olays.length;
			for (i = 0; i < length; i++) {
				olays[i].get(BOUNDING_BOX).css("zIndex", Global.ovZindex + i);
			}
		},
		
		hide: function () {
			this.get(MODAL_BOX).hide();
		},
		
		show: function () {
			if (this.get("modal")) {
				this.get(MODAL_BOX).show();
			}
		},
		
		destroy: function () {
			var win = $(this.get('win')).unbind(RESIZE, this._centerUI).unbind(SCROLL, this._centerUI);
			win.unbind(RESIZE, this._repositionUI);
			win.unbind(SCROLL, this._repositionUI);
			if (this.dd) {
				this.dd.destroy();
			}
			this.get(BOUNDING_BOX).unbind("mousedown", this.focus);
		}
	}
	
}, {
	
	MODAL_TEMPLATE: '<div/>',

	_resizeModal: function () {
		var screenSize = DOM.screenSize();
		this.get(MODAL_BOX).width(screenSize.width).height(screenSize.height);
	},

	initializer: function () {
		var self = this;
		Global.overlays.push(this);
		this.set(MODAL_BOX, this.MODAL_TEMPLATE);
	}
});