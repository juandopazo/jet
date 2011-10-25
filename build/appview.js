/**
 * The AppView module provides a widget insfrastructure for building iOS-like apps
 * @module appview
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('appview', function ($) {

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
var Lang = $.Lang,
	Hash = $.Hash,
	Base = $.Base;
	
var BOUNDING_BOX = 'boundingBox',
	CLASS_PREFIX = 'classPrefix';

var parseUrl = function (url) {
	url = url.split('/');
	return {
		name: url[1],
		method: url[2],
		args: url.slice(3)
	};
};

if (!jet.controllers) {
	jet.controllers = {};

	// TEMPORARY. Use HTML5 History instead
	$($.config.win).on('hashchange', function () {
		var action = parseUrl($.config.win.location.hash);
		var controller = jet.controllers[action.name]; 
		if (controller && controller[action.method]) {
			controller[action.method].apply(controller, action.args);
		}
	});
}

$.Controller = Base.create('controller', Base, [], {
	
	ATTRS: {
		name: {
			required: true,
			validator: Lang.isString
		},
		methods: {
			value: {}
		}
	}
	
}, {
	
	initializer: function () {
		var name = this.get('name');
		var action = parseUrl($.config.win.location.hash);
		Hash.each(this.get('methods'), function (name, fn) {
			myself[name] = fn;
		});
		jet.controllers[name] = this;
		if (action.name == name && myself[action.method]) {
			myself[action.method].apply(myself, action.args);
		}
	}
	
});	


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

	/**
	 * An standard application page. A page consists in a container and a navigation panel with a title and buttons.
	 * @class Page
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */		
	$.Page = Base.create('page', $.Module, [$.WidgetChild], {
		
		ATTRS: {
			/**
			 * @config navHolder
			 * @description A reference to the node that contains the navigation in an AppView
			 * @required
			 */
			navHolder: {
				required: true
			},
			/**
			 * @config nav
			 * @description This page's navigation node
			 * @readOnly
			 */
			nav: {
				readOnly: true,
				getter: function () {
					return nav;
				}
			},
			titleNode: {
				value: '<h1/>',
				setter: $
			},
			/**
			 * @config titleContent
			 * @description Title of the page
			 * @type String
			 */
			titleContent: {
				value: ''
			},
			/**
			 * @ocnfig back
			 * @description Configuration object for the 'back' button
			 * @type Object
			 */
			back: {
			},
			/**
			 * @ocnfig back
			 * @description Configuration object for the 'forward' button
			 * @type Object
			 */
			forward: {
			},
			/**
			 * @config loading
			 * @description If 'loading' is set to true, a loading indicator is shown in the middle of the page and all other content is hidden
			 * @default false
			 */
			loading: {
				value: false
			},
			/**
			 * @config scrollable
			 * @description If set to true, the page will scroll vertically
			 */
			scrollable: {
				value: true
			},
			/**
			 * @config loadScreen
			 * @description the load screen node
			 * @readOnly
			 */
			loadScreen: {
				value: '<div/>',
				setter: $
			},
			/**
			 * @config loadingText
			 * @description Text for the 'loading' status
			 * @default 'Cargando...'
			 * @writeOnce
			 */
			loadingText: {
				value: 'Cargando...',
				writeOnce: true
			},
			/**
			 * @config children
			 * @description An array of all this page's children
			 * @readOnly
			 */
			children: {
				
			}
		}
		
	}, {
		
		_uiToggleLoadscreen: function (e) {
			var loadScreen = this.get('loadScreen');
			var loader = this.loader;
			if (e.newVal) {
				loadScreen.show();
				loader.start();
			} else {
				loadScreen.hide();
				loader.stop();
			}
		},
		
		initializer: function (config) {
			if (!config.children) {
				this.set('children', []);
			}
			this.set('titleNode', this.get('titleNode'));
			this.set('loadScreen', this.get('loadScreen'));
			
			this.scrollable = new $.Scrollable({
				node: this.get('boundingBox'),
				scrolling: this.get('scrollable')
			});
			this.loader = new $.FanLoader();
		},
		
		renderUI: function (boundingBox) {
			
			var loadScreen = this.get('loadScreen').addClass(this.getClassName('loadscreen')).appendTo(boundingBox);
			
			var back = this.get('back');
			var forward = this.get('forward');
			var nav = this.get('nav');
			
			// @TODO check if this works
			this.loader.render(loadScreen);
			$('<span/>').html(this.get('loadingText')).appendTo(loadScreen);
			this._uiToggleLoadscreen({ newVal: this.get('loading') });
			
			if (back) {
				back = new $.Button(back);
				back.render(nav);
			}
			nav.addClass(this.getClassName('nav')).append(title);
			if (forward) {
				forward = new $.Button(forward);
				forward.render(nav);
			}
			this.get('navHolder').append(nav);
		},
		
		bindUI: function () {
			this.after('scrollableChange', function (e) {
				this.scrollable.set('scrolling', e.newVal);
			});
			this.after('loadingChange', this._uiToggleLoadscreen);
		},
		
		syncUI: function () {
			this.get('loadScreen').css('height', (window.innerHeight - this.get('nav').parent().offset().height) + 'px');
		},
		
		/**
		 * @method appendChild
		 * @description adds a child. This is for reference purposes only, it doesn't make any DOM changes
		 * @chainable
		 */
		appendChild: function (page) {
			this.get('children').push(page);
			return this;
		},
		/**
		 * @method removeChild
		 * @description removes a child. This is for reference purposes only, it doesn't make any DOM changes
		 * @chainable
		 */
		removeChild: function (page) {
			A.remove(this.get('children'), page);
			return this;
		}

	});
	A.each(['In', 'Out'], function (direction) {
		$.Page.prototype['fade' + direction] = function (duration) {
			duration = duration || 250;
			var self = this;
			var navHeight = this.get('navHolder').height();
			var boundingBox = this.get(BOUNDING_BOX).css({
				zIndex: 3,
				position: 'relative',
				height: (window.innerHeight - navHeight) + PX,
				overflow: 'hidden',
				transition: 'none',
				opacity: '0.0',
				transform: 'scale(0.2)',
				background: '#fff'
			});
			var modal = $('<div/>').addClass('modal').css({
				top: navHeight + PX,
				height: (window.innerHeight - navHeight) + PX
			}).appendTo(boundingBox.parent());
			setTimeout(function () {
				boundingBox.css({
					transition: '-webkit-transform ' + duration + 'ms linear, opacity ' + duration + 'ms ease-out',
					opacity: '1.0',
					transform: 'scale(1.0)'
				});
				setTimeout(function () {
					modal.remove();
					boundingBox.css({
						zIndex: 1,
						height: 'auto',
						overflow: 'visible'
					}).find('*').css(VISIBILITY, 'visible');
				}, duration);
			}, 10);
			boundingBox.find('*').css(VISIBILITY, 'hidden');
			return this;
		};
	});
	A.each(['Left', 'Right', 'Front'], function (direction) {
		$.Page.prototype['slide' + direction] = function () {
			var self = this;
			var nav = this.get('nav');
			var fired = false;
			var transitionEnd = function (e) {
				if (!fired && e.propertyName == '-webkit-transform') {
					/**
					 * @event slideEnd
					 * @description fires then the slide effect has ended
					 */
					self.fire('slideEnd');
					fired = true;
				}
			};
			var transform = {
				transform: 'translate3d(' + ((direction == 'Left' ? -1 : direction == 'Right' ? 1 : 0) * nav.width()) + 'px, 0px, 0px)' 
			};
			nav.find('*').on('webkitTransitionEnd', transitionEnd).css(transform).css({
				opacity: direction == 'Front' ? '1.0' : '0.0'
			});
			this.get(BOUNDING_BOX).on('webkitTransitionEnd', transitionEnd).css(transform);
			this.fire('slide' + direction);
			return this;
		}
	});
	$.PageView = Base.create('pageview', $.Widget, [$.WidgetParent], {
		
		ATTRS: {
			navHolder: {
				required: true
			},
			defaultChildType: {
				value: 'Page'
			}
		}
	}, {
		
		initializer: function () {
			this.on('addChild', function (e) {
				e.child.navHolder = e.child.navHolder || this.get('navHolder');
			});
		}
		
	});	
	/**
	 * Basic class for creating an App. Should be used only once per app.
	 * @class AppView
	 * @extends Module
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */

	$.AppView = Base.create('appview', $.Module, [], {
		
		ATTRS: {
			/**
			 * @config nav
			 * @description app navigation node
			 * @readOnly
			 */
			nav: {
				value: '<div/>',
				setter: $
			},
			/**
			 * @config preventScroll
			 * @description Whether to prevent the default scrolling behavior of the browser (recommended)
			 * @default true
			 * @type Boolean
			 */
			preventScroll: {
				value: true
			}
		}
	}, {
		
		_uiPreventScroll: function (e) {
			if (this.get('preventScroll')) {
				e.preventDefault();
			}
		},
		
		initializer: function () {
			this.set('nav', this.get('nav'));
		},
		
		renderUI: function () {
			this.get('headerNode').append(this.get('nav'));
		},
		
		bindUI: function () {
			$($.config.doc).on('touchmove', this._uiPreventScroll, this);
		}
		
	});
			
});
