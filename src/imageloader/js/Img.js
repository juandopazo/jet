
var Lang = $.Lang,
	ArrayHelper = $.Array;

var LOAD = "load",
	ERROR = "error",
	TIMEOUT = "timeout",
	COMPLETE = "complete",
	IMAGE_ = "image:";

/**
 * The Image class enhances the native class
 * @class Image
 * @constructor
 * @extends Base
 * @param {Object} config Object literal specifying image configuration properties
 */
var Img = function () {
	Img.superclass.constructor.apply(this, arguments);
	var img = new Image();
	var node = $(img);
	var myself = this.addAttrs({
		/**
		 * @config src
		 * @description URI of the image to load
		 * @required
		 * @writeOnce
		 * @type String
		 */
		src: {
			required: true,
			writeOnce: true,
			validator: Lang.isString
		},
		/**
		 * @config image
		 * @description A pointer to the actual Image object
		 * @readOnly
		 */
		image: {
			readOnly: true,
			value: img
		},
		/**
		 * @config node
		 * @description A NodeList with the image node
		 * @type NodeList
		 */
		node: {
			value: node
		},
		/**
		 * @config timeout
		 * @description Time the image can spend loading before firing the timeout event
		 * @default 5000
		 * @type Number (ms)
		 */
		timeout: {
			value: 5000
		}
	});
	var loaded = false;
	myself.addAttrs({
		/**
		 * @config type
		 * @description The image type. Used to specify if an image is PNG
		 * @type String
		 */
		type: {
			value: "",
			validator: Lang.isString,
			getter: function (value) {
				return value.toLowerCase();
			}
		},
		/**
		 * @config loaded
		 * @description Specifies if the image has finished loading or not
		 * @readOnly
		 * @type Boolean
		 */
		loaded: {
			readOnly: true,
			getter: function () {
				return !!loaded;
			}
		}
	/**
	 * Start loading the image
	 * @method load
	 * @chainable
	 */
	}).load = function () {
		var completed = false;
		img.onload = function () {
			if (myself.get("type") == "png" && $.UA.ie) {
				myself.set("node", $("<span/>").css({
					display: "inline-block",
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + myself.get("src") + "',sizingMethod='crop');"
				}).height(img.height).width(img.width));
			}
			/**
			 * Fires when the image finished loading successfully
			 * @event load
			 */
			myself.fire(LOAD);
			/**
			 * Fires when the image finished loading, successfully or not
			 * @event complete
			 */
			myself.fire(COMPLETE);
			completed = true;
			loaded = true;
		};
		img.onerror = function () {
			/**
			 * Fires if the image didn't load successfully
			 * @event error
			 */
			myself.fire(ERROR);
			myself.fire(COMPLETE);
			completed = true;
		};
		setTimeout(function () {
			if (!completed) {
				/**
				 * Fires if the image timed out
				 * @event error
				 */
				myself.fire(TIMEOUT);
				myself.fire(COMPLETE);
			}
		}, myself.get(TIMEOUT));
		img.src = myself.get("src");
		return myself;
	};
};
$.extend(Img, $.Base, {
	/**
	 * Set the image as a background once it loaded
	 * @method setAsBackground
	 * @param {DOMNode | NodeList} node Which node to set the image as background of
	 * @chainable
	 */
	setAsBackground: function (node) {
		node = $(node);
		var myself = this;
		var setBg = function () {
			var src = myself.get("src");
			if (myself.get("type") == "png" && $.UA.ie) {
				node.css("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + src + "',sizingMethod='crop');");
			} else {
				node.css("backgroundImage", "url(" + src + ")");
			}
		};
		if (myself.get("loaded")) {
			setBg();
		} else {
			myself.on(LOAD, setBg);
		}
		return myself;
	}
});