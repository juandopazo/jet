
	/**
	 * Fakes that a node is scrolling verically in the page with touch movements, 
	 * so that other nodes can remain fixed on the screen
	 * @class Scrollable
	 * @extends Utility
	 * @construcor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	$.Scrollable = Base.create('scrollable', $.Utility, [], {
		
		ATTRS: {
			/**
			 * @attribute node
			 * @description node to be scrolled
			 * @required
			 */
			node: {
				required: true,
				setter: $
			},
			/**
			 * @attribute scrollTop
			 * @description vertical scroll position
			 */
			scrollTop: {
				getter: function () {
					var y = getComputedStyle(this.get(NODE)[0]).webkitTransform.split(',').pop();
					return - parseInt(y.substr(0, y.length - 1), 10);
				}
			},
			/**
			 * @attribute scrolling
			 * @description Whether the element is scrolling or not. Can be used to stop the scrolling behavior
			 * @default true
			 */
			scrolling: {
				value: true
			}
		}
	}, {
		
		_returnToPosition: function () {
			var y = getComputedStyle(node[0]).webkitTransform.split(',').pop();
			var bottom = window.innerHeight - node.height() - 110;
			var go = false;
			y = parseInt(y.substr(0, y.length - 1), 10);
			if (y > 0) {
				y = 0;
				go = true;
			} else if (y < bottom) {
				y = bottom;
				go = true;
			}
			if (go) {
				this.get('node').css({
					'-webkit-transition-duration': '600ms',
					'-webkit-transition-timing-function': 'ease-out',
					transform: 'translate3d(0px, ' + y + 'px, 0px)'
				});
			}
		},
		
		_scrollTouchStart: function (e) {
			if (this.get('scrolling')) {
				var y1 = e.touches[0].pageY;
				var y = getComputedStyle(node[0]).webkitTransform.split(',').pop();
				
				this.set({
					y1: y1,
					start: y1,
					time1: (new Date()).getTime()
				});
				
				y = parseInt(y.substr(0, y.length - 1), 10);
				if (!isNaN(y)) {
					this.get('node').css('transform', 'translate3d(0px, ' + y + 'px, 0px)');
					this.set('current', y);
				}
			}
			
		},
		
		_scrollTouchMove: function (e) {
			if (this.get('scrolling')) {
				var y2 = this.get('y2');
				var time2 = this.get('time2');
				if (Lang.isNumber(y2)) {
					this.set('y1', y2);
				}
				y2 = e.touches[0].pageY;
				this.set('y2', y2);
				if (Lang.isNumber(time2)) {
					this.set('time1', time2);
				}
				this.set('time2', Date.now());
				
				node.css({
					'-webkit-transition-duration': '0ms',
					'-webkit-transition-timing-function': 'linear',
					transform: 'translate3d(0px, ' + (this.get('current') + y2 - this.get('start')) + 'px, 0px)'
				});
			}
			
		},
		
		_scrollTouchEnd: function (e) {
			if (this.get('scrolling')) {
				var displacement = this.get('y2') - this.get('y1');
				// if the speed is small, make it react slower with a quadratic function
				// That way we adjust the sensibility of the scroll
				var speed = displacement / (1.5 * (this.get('time2') - this.get('time1')));
				if (speed < 1) {
					speed = Math.pow(speed, 2) * displacement / Math.abs(displacement);
				}
				var node = this.get('node');
				var timeSpan = 500;
				var yf = this.get('current') - this.get('start') + speed * timeSpan;
				var height = node.height();
				var limit = 100;
				var newYf = 0;
				if (yf < (screen.height - height - limit * 2)) {
					newYf = screen.height - height - limit * 2;
				} else if (yf > limit) {
					newYf = limit;
				}
				timeSpan *= 2;
				if (Lang.isNumber(newYf)) {
					timeSpan = timeSpan * newYf / yf;
					yf = newYf;
				}
				if (Math.abs(speed) > 0.1) {
					this.set('flick', true);
					node.css({
						'-webkit-transition-duration': timeSpan + 'ms',
						'-webkit-transition-timing-function': Lang.isNumber(newYf) ? 'linear' : 'ease-out',
						transform: 'translate3d(0px, ' + yf + 'px, 0px)'
					});
				} else {
					this._returnToPosition();
				}
			}
		},
		
		_scrollTransitionEnd: function () {
			if (this.get('scrolling')) {
				if (this.get('flick')) {
					this.set('flick', false);
					this._returnToPosition();
				} else {
					this.fire('scroll:end');
				}
			}
		},
		
		initializer: function () {
			var node = this.get('node');
			
			this._handlers.push(
				node.on('touchstart', this._scrollTouchStart, this),
				node.on('touchmove', this._scrollTouchMove, this),
				node.on('touchend', this._scrollTouchEnd, this),
				node.on('webkitTransitionEnd', this._scrollTransitionEnd, this)
			);
		},
		
		/**
		 * @method scrollTo
		 * @description Scrolls to a certain vertical position
		 * @chainable
		 */
		scrollTo: function (y, duration, easing) {
			duration = duration || 0;
			easing = easing || 'linear';
			this.get(NODE).css({
				'-webkit-transition-duration': duration + 'ms',
				'-webkit-transition-timing-function': easing,
				transform: 'translate3d(0px, ' + y + 'px, 0px)'
			});
			return this;
		}

	});
