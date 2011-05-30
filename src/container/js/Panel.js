
/**
 * A panel is an overlay that resembles an OS window without actually being one,
 * to the problems they have (stop javascript execution, etc)
 * @class PanelBase
 * @constructor
 */
function PanelBase() {
	this.set('closeButton', this.get('closeButton'));
	this.set(UNDERLAY, this.get(UNDERLAY));
	
	this.after('closeChange', this._uiCloseChange);
}
PanelBase.ATTRS = {
	/**
	 * @attribute close
	 * @description If true, a close button is added to the panel that hides it when clicked
	 * @type Boolean
	 * @default true
	 */
	close: {
		value: true,
		validator: Lang.isBoolean
	},
	/**
	 * @attribute underlay
	 * @description The underlay is inserted after the contentBox to allow for a more complex design
	 * @readOnly
	 */
	underlay: {
		value: '<div/>',
		setter: $
	},
	/**
	 * @attribute shadow
	 * @description If true, the panel shows a shadow
	 * @default true
	 */
	shadow: {
		value: true
	},
	
	closeButton: {
		value: '<a/>',
		setter: $
	}
	
};
PanelBase.prototype = {
	
	CONTENT_TEMPLATE: '<div/>',
	CLOSE_TEMPLATE: '<a/>',
	
	_uiCloseChange: function (e) {
		this.get('closeButton').toggle(e.newVal);
	},
	
	_onCloseButton: function (e) {
		e.preventDefault();
		if (this.fire(CLOSE)) {
			this.hide();
		}
	},
	
	_onContextKeyUp: function (e) {
		if (e.keyCode == 27 && this.get("focused")) {
			this._onCloseButton(e);
		}
	},
	
	renderUI: function (boundingBox, contentBox) {
		this.get('closeButton').addClass("container-close").appendTo(contentBox);
		boundingBox.append(this.get(UNDERLAY).addClass(UNDERLAY));
		if (this.get(SHADOW)) {
			boundingBox.addClass(SHADOW);
		}
	},
	
	bindUI: function () {
		this._handlers.push(
			$($.config.doc).on('keyup', this._onContextKeyUp, this),
			this.get('closeButton').on(CLICK, this._onCloseButton, this)
		);
	}
};

/**
 * A panel is an overlay that resembles an OS window without actually being one,
 * to the problems they have (stop javascript execution, etc)
 * @class Panel
 * @extends Overlay
 * @uses PanelBase
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Panel = Base.create('panel', $.Overlay, [PanelBase]);

/**
 * An panel with static position and a close button
 * @class StaticPanel
 * @extends Module
 * @uses PanelBase
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.StaticPanel = Base.create('panel', $.Module, [PanelBase]);