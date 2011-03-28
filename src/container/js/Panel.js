
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
		 * @config close
		 * @description If true, a close button is added to the panel that hides it when clicked
		 * @type Boolean
		 * @default true
		 */
		close: {
			value: true,
			validator: Lang.isBoolean
		},
		/**
		 * @config underlay
		 * @description The underlay is inserted after the contentBox to allow for a more complex design
		 * @readOnly
		 */
		underlay: {
			setter: $
		},
		/**
		 * @config shadow
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
			var closeButton = this.get('closeButton').attr("href", "#").addClass("container-close");
			var boundingBox = this.get(BOUNDING_BOX);
			closeButton.on(CLICK, this._onCloseButton, this);
			closeButton.appendTo(contentBox);
			boundingBox.append(this.get(UNDERLAY));
			if (this.get(SHADOW)) {
				boundingBox.addClass(SHADOW);
			}
			$(this.get('doc')).on('keyup', this._onContextKeyUp);
		},
		
		destroy: function () {
			$(this.get('doc')).unbind('keyup', this._onContextKeyUp);
		},
		
		afterCloseChange: function (e, newVal) {
			var closeButton = this.get('closeButton');
			if (newVal) {
				closeButton.show();
			} else {
				closeButton.hide();
			}
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
		var self = this;
		this.set('closeButton', this.get('closeButton'));
		this.on(HEIGHT + "Change", function (e, height) {
			self.get(CONTENT_BOX).height(height);
		});
		this.set(UNDERLAY, $(NEW_DIV).addClass(UNDERLAY));
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
		var self = this;
		this.set('closeButton', this.get('closeButton'));
		this.on(HEIGHT + "Change", function (e, height) {
			self.get(CONTENT_BOX).height(height);
		});
		this.set(UNDERLAY, $(NEW_DIV).addClass(UNDERLAY));
	}
});