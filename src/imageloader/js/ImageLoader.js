
/**
 * Handles loading of multiple images
 * @class ImageLoader
 * @constructor
 * @extends Base
 * @param {Object} config Object literal specifying configuration properties
 */
var ImageLoader = function () {
	ImageLoader.superclass.constructor.apply(this, arguments);
	
	var myself = this.addAttrs({
		/**
		 * @config srcs
		 * @description An array of image URIs
		 * @type Array
		 */
		srcs: {
			validator: Lang.isArray
		}
	});
};
$.extend(ImageLoader, $.Base, {
	/**
	 * Loads all images whose srcs where specified
	 * @method load
	 * @chainable
	 */
	load: function () {
		var myself = this;
		var completed = 0;
		var srcs = myself.get("srcs");
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
						myself.fire(IMAGE_ + LOAD, img);
					},
					error: function () {
						/**
						 * Fires when each image fires its error event
						 * @event image:error
						 * @param {Image} the image that fired the event
						 */
						myself.fire(IMAGE_ + ERROR, img);
					},
					timeout: function () {
						/**
						 * Fires when each image fires its timeout event
						 * @event image:timeout
						 * @param {Image} the image that fired the event
						 */
						myself.fire(IMAGE_ + TIMEOUT, img);
					},
					complete: function () {
						/**
						 * Fires when each image fires its complete event
						 * @event image:complete
						 * @param {Image} the image that fired the event
						 */
						myself.fire(IMAGE_ + COMPLETE, img);
						completed++;
						/**
						 * Fires each time an image loads
						 * @event progress
						 * @param {Number} percentage completed
						 */
						myself.fire("progress", Math.round(completed * 100 / length), img);
						if (completed == length) {
							/**
							 * Fires when all images loaded
							 * @event complete
							 */
							myself.fire(COMPLETE);
						}
					}
				}
			});
			img.load();
		});
		return myself;
	}
});

/*
 * @TODO: fixPNG method for Node and NodeList
 */

$.add({
	Image: Img,
	ImageLoader: ImageLoader
});