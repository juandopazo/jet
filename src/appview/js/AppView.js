	
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