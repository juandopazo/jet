
/**
 * A panel is an overlay that resembles an OS window without actually being one,
 * to the problems they have (stop javascript execution, etc)
 * @class PanelBase
 * @constructor
 */
var PanelBase = $.mix(function () {
}, {
	
	ATTRS: {
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
		
	},
	
	EVENTS: {
		
		render: function (e) {
			var height = this.get(HEIGHT);
			var contentBox = this.get(CONTENT_BOX);
			var closeButton = this.get('closeButton').addClass("container-close");
			var boundingBox = this.get(BOUNDING_BOX);
			closeButton.on(CLICK, this._onCloseButton, this);
			closeButton.appendTo(contentBox);
			boundingBox.append(this.get(UNDERLAY));
			if (this.get(SHADOW)) {
				boundingBox.addClass(SHADOW);
			}
			this._handlers.push($($.config.doc).on('keyup', this._onContextKeyUp, this));
		},
		
		afterCloseChange: function (e) {
			this.get('closeButton').toggle(e.newVal);
		}
		
	}
});
PanelBase.prototype = {
	
	CONTENT_TEMPLATE: '<div/>',
	CLOSE_TEMPLATE: '<a/>',
	
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
$.Panel = Base.create('panel', $.Overlay, [PanelBase], {}, {
	initializer: function () {
		this.set('closeButton', this.get('closeButton'));
		this.set(UNDERLAY, $(NEW_DIV).addClass(UNDERLAY));
	},
	
	bindUI: function () {
		this.after('heightChange', function (e) {
			this.get(CONTENT_BOX).height(e.newVal);
		}, this);
	}
});

/**
 * An panel with static position and a close button
 * @class StaticPanel
 * @extends Module
 * @uses PanelBase
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.StaticPanel = Base.create('panel', $.Module, [PanelBase], {}, {
	initializer: function () {
		this.set('closeButton', this.get('closeButton'));
		this.set(UNDERLAY, $(NEW_DIV).addClass(UNDERLAY));
	},
	
	bindUI: function () {
		this.after('heightChange', function (e) {
			this.get(CONTENT_BOX).height(e.newVal);
		}, this);
	}
});