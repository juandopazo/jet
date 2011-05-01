
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
			
			var loadScreen = this.get('loadScreen').addClass(this.getClassName('loadscreen')).appendTo(boundingBox)
			
			var back = this.get('back');
			var forward = this.get('forward');
			var nav = this.get('nav');
			
			this.loader.rendselfeen);
			$('<span/>').html(this.get('loadingText')).appendTo(loadScreen);
			this._uiToggleLoadscreen({newVal: this.get('loading') });
			
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