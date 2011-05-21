
if (!jet.TimeFrame) {
	/**
	 * A timeframe for queueing animations
	 * @class TimeFrame
	 * @uses EventTarget
	 * @static
	 */
	var TimeFrame = (function () {
		var tweens = [];
		var interval;
		var frameLength;
		var time = 0;
		var playing = false;

		return {
			/**
			 * @property fps
			 * @description Refresh speed in frames per second.
			 * Can't be changed during playback
			 * @default 35
			 */
			fps: 50,
			/**
			 * @method play
			 * @description Starts the playback
			 * @chainable
			 */
			play: function () {
				var self = this;
				if (!playing) {
					if (interval) {
						clearInterval(interval);
					}
					var frameLength = Math.round(1000 / self.fps);
					interval = setInterval(function () {
						self.fire(ENTER_FRAME, { time: (new Date()).getTime() });
					}, frameLength);
					playing = true;
				}
				return self;
			},
			/**
			 * @method stop
			 * @description Stops the playback
			 * @chainable
			 */
			stop: function () {
				if (interval) {
					clearInterval(interval);
				}
				playing = false;
				return this;
			},
			/**
			 * @method addTween
			 * @description Adds a Tween to the queue
			 * @param {Tween} tween
			 * @chainable
			 */
			addTween: function (tween) {
				tweens[tweens.length] = tween;
				return this;
			},
			/**
			 * @method removeTween
			 * @description Removes a Tween from the queue
			 * @param {Tween} tween
			 * @chainable
			 */
			removeTween: function (tween) {
				A.remove(tween, tweens);
				return tweens.length === 0 ? this.stop() : this;
			}
		};
	}());
	$.mix(new $.EventTarget(), TimeFrame);
}