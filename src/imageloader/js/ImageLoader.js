
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