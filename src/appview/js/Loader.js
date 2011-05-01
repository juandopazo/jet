	/**
	 * A loader indicator that looks like a rotating fan
	 * @class FanLoader
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.FanLoader = $.Base.create('fanloader', $.Widget, [], {
		
		ATTRS: {
			/**
			 * @config loading
			 * @description Whether the loader is in its 'loading' status. Settng 'loading' to false will stop it
			 * @default false
			 */
			loading: {
				value: false
			},
			/**
			 * @config blades
			 * @description Number of blades in the fan
			 * @default 12
			 * @writeOnce
			 */
			blades: {
				value: 12,
				writeOnce: true
			},
			/**
			 * @config radius
			 * @description Radius of the fan in pixels. Shouldn't be set with CSS. This resizes the fan so that proportions are kept
			 * @default 40
			 */
			radius: {
				value: 20
			},
			/**
			 * @config duration
			 * @description Duration of a revolution in milliseconds
			 * @default 1000
			 */
			duration: {
				value: 1000
			}
		}
	}, {
		
		CONTENT_TEMPLATE: null,
		
		_uiLoadingChange: function (e) {
			this.get('boundingBox').toggleClass('loading', e.newVal);
		},
		
		renderUI: function (boundingBox) {
			
			boundingBox.css('-webkit-transform', 'scale(' + (this.get('radius') / 40) + ')');
			var i;
			var count = this.get('blades');
			var angle = 360 / count;
			var color;
			var duration = this.get('duration');
			for (i = 0; i < count; i++) {
				$('<b/>').css({
					'-webkit-transform': 'rotate(' + (angle * i) + 'deg)',
					'-webkit-animation-duration': duration + 'ms',
					'-webkit-animation-delay': (duration * i / count) + 'ms'
				}).appendTo(boundingBox);
			}
			
		},
		
		bindUI: function () {
			this.after('loadingChange', this._uiLoadingChange);
		},
		
		/**
		 * @method start
		 * @description starts spinning
		 * @chainable
		 */
		start: function () {
			return this.set('loading', true);
		},
		/**
		 * @method stop
		 * @description stops spinning
		 * @chainable
		 */
		stop: function () {
			return this.set('loading', false);
		}

	});