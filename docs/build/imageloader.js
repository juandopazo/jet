/**
 * Provides functionality for preloading images and fixing PNGs in IE
 * @module imageloader
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('imageloader', function ($) {

			
var Lang = $.Lang,
	Base = $.Base,
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
var Img = $.Img = Base.create('image', Base, [], {
	ATTRS: {
		/**
		 * @attribute src
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
		 * @attribute image
		 * @description A pointer to the actual Image object
		 */
		image: {
			value: null
		},
		/**
		 * @attribute node
		 * @description A NodeList with the image node
		 * @readOnly
		 * @type NodeList
		 */
		node: {
			value: null
		},
		/**
		 * @attribute timeout
		 * @description Time the image can spend loading before firing the timeout event
		 * @default 5000
		 * @type Number (ms)
		 */
		timeout: {
			value: 5000
		},
		/**
		 * @attribute type
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
		 * @attribute loaded
		 * @description Specifies if the image has finished loading or not
		 * @type Boolean
		 */
		loaded: {
			value: false
		}
		/**
		 * Start loading the image
		 * @method load
		 * @chainable
		 */
	},
	
	EVENTS: {
		load: function () {
			var img = this.get('image');
			if (this.get('type') == 'png' && $.UA.ie) {
				this.set('node', $("<span/>").css({
					display: "inline-block",
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + this.get("src") + "',sizingMethod='crop');"
				}).height(img.height).width(img.width));
			}
		}
	}
}, {
	initializer: function () {
		this.set('image', new Image()).set('node', $(this.get('image')));
	},
	
	load: function () {
		var self = this;
		var completed = false;
		var img = this.get('image');
		img.onload = function () {
			/**
			 * Fires when the image finished loading successfully
			 * @event load
			 */
			self.fire(LOAD);
			/**
			 * Fires when the image finished loading, successfully or not
			 * @event complete
			 */
			self.fire(COMPLETE);
			completed = true;
			self.set('loaded', true);
		};
		img.onerror = function () {
			/**
			 * Fires if the image didn't load successfully
			 * @event error
			 */
			self.fire(ERROR);
			self.fire(COMPLETE);
			completed = true;
		};
		setTimeout(function () {
			if (!completed) {
				/**
				 * Fires if the image timed out
				 * @event error
				 */
				self.fire(TIMEOUT);
				self.fire(COMPLETE);
			}
		}, self.get(TIMEOUT));
		img.src = this.get('src');
		return this;
	},
	/**
	 * Set the image as a background once it loaded
	 * @method setAsBackground
	 * @param {DOMNode | NodeList} node Which node to set the image as background of
	 * @chainable
	 */
	setAsBackground: function (node) {
		node = $(node);
		var self = this;
		var setBg = function () {
			var src = self.get("src");
			if (self.get("type") == "png" && $.UA.ie) {
				node.css("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + src + "',sizingMethod='crop');");
			} else {
				node.css("backgroundImage", "url(" + src + ")");
			}
		};
		if (self.get("loaded")) {
			setBg();
		} else {
			self.on(LOAD, setBg);
		}
		return self;
	}
});
/**
 * Handles loading of multiple images
 * @class ImageLoader
 * @constructor
 * @extends Base
 * @param {Object} config Object literal specifying configuration properties
 */
$.ImageLoader = Base.create('imageloader', Base, [], {
	ATTRS: {
		/**
		 * @attribute srcs
		 * @description An array of image URIs
		 * @type Array
		 */
		srcs: {
			validator: Lang.isArray
		}
	}
}, {
	/**
	 * Loads all images whose srcs where specified
	 * @method load
	 * @chainable
	 */
	load: function () {
		var self = this;
		var completed = 0;
		var srcs = this.get('srcs');
		var length = srcs.length;
		ArrayHelper.each(srcs, function (src) {
			var img = new Img({
				src: src,
				on: {
					load: function () {
						/**
						 * Fires when each image fires its load event
						 * @event image:load
						 * @param {Image} the image that fired the event
						 */
						self.fire(IMAGE_ + LOAD, img);
					},
					error: function () {
						/**
						 * Fires when each image fires its error event
						 * @event image:error
						 * @param {Image} the image that fired the event
						 */
						self.fire(IMAGE_ + ERROR, img);
					},
					timeout: function () {
						/**
						 * Fires when each image fires its timeout event
						 * @event image:timeout
						 * @param {Image} the image that fired the event
						 */
						self.fire(IMAGE_ + TIMEOUT, img);
					},
					complete: function () {
						/**
						 * Fires when each image fires its complete event
						 * @event image:complete
						 * @param {Image} the image that fired the event
						 */
						self.fire(IMAGE_ + COMPLETE, img);
						completed++;
						/**
						 * Fires each time an image loads
						 * @event progress
						 * @param {Number} percentage completed
						 */
						self.fire("progress", Math.round(completed * 100 / length), img);
						if (completed == length) {
							/**
							 * Fires when all images loaded
							 * @event complete
							 */
							self.fire(COMPLETE);
						}
					}
				}
			});
			img.load();
		});
		return this;
	}
});
			
});