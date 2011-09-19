$.mix($.NodeList.prototype, {
		/**
	 * @method animate
	 * @for NodeList
	 * @description Animates all members of the node list. <strong>Requires the Anim module</strong>
	 * @param {Hash} props
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	animate: function (props, duration, easing, callback) {
		return this.defer(function (promise) {
			var tw = this.tw = new $.Tween({
				node: this,
				to: props,
				duration: duration,
				easing: easing
			});
			tw.on('end', promise.resolve, promise);
			tw.play();
		}).then(callback);
	},
	/**
	 * @method fadeIn
	 * @for NodeList
	 * @description Causes all nodes to fade in. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	fadeIn: function (duration, easing, callback) {
		return this.animate({
			opacity: 1 
		}, duration, easing, callback);
	},
	/**
	 * @method fadeOut
	 * @for NodeList
	 * @description Causes all nodes to fade out. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	fadeOut: function (duration, easing, callback) {
		return this.animate({
			opacity: 0
		}, duration, easing, callback);
	},
	/**
	 * @method fadeToggle
	 * @for NodeList
	 * @description Causes all nodes to fade in or out. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	fadeToggle: function (duration, easing, callback) {
		var promises = [];
		this.forEach(function (node) {
			node = $(node);
			promises.push(this.defer(function (promise) {
				var resolve = $.bind(promise.resolve, promise);
				if (node.css('opacity') == 1) {
					node.fadeOut(duration, easing, resolve);
				} else {
					node.fadeIn(duration, easing, resolve);
				}
			}));
		});
		return this.when(promises).then(callback);
	},
	/**
	 * @method slideDown
	 * @for NodeList
	 * @description Causes all nodes to slide down, changing their height and setting their overflow
	 *  to hidden for the duration of the animation. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	slideDown: function (duration, easing, callback) {
		var self = this;
		var overflow = this.css('overflow');
		return this.css('overflow', 'hidden').animate({ height: this.oHeight }, duration, easing, function () {
			self.css('overflow', overflow);
			callback.call(self);
		});
	},
	/**
	 * @method slideUp
	 * @for NodeList
	 * @description Causes all nodes to slide up, changing their height and setting their overflow
	 *  to hidden for the duration of the animation. <strong>Requires the Anim module</strong>
	 * @param {Number | String} duration The duration in ms or 'fast', 'normal', or 'slow'
	 * @param {String | Function} easing A predefined easing function ('linear', 'easein', 'easeout', 'sling') or a custom easing function  
	 * @param {Function} callback Executes when the animation is complete
	 * @chainable
	 */
	slideUp: function (duration, easing, callback) {
		var myself = this;
		var overflow = myself.css('overflow');
		return myself.css('overflow', 'hidden').animate({
			height: 0
		}, duration, easing, function () {
			myself.css('overflow', overflow);
			callback.call(myself);
		});
	},
	/**
	 * @method stop
	 * @for NodeList
	 * @description Makes the current animation for this nodelist stop. <strong>Requires the Anim module</strong>
	 * @chainable
	 */
	stop: function () {
		if (this.tw) {
			this.tw.stop();
		}
		return this.reject();
	}
});

$.add({
	Tween: Tween,
	Easing: Easing
});