/**
 * Paginator widget
 * @module paginator
 * @requires base
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('paginator', function ($) {

			
var Lang = $.Lang,
	Hash = $.Hash,
	A = $.Array;
	
var RECORDSET = 'recordSet',
	NEW_SPAN = '<span/>',
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	CLICK = 'click',
	ID = 'id',
	CURRENT_PAGE = 'currentPage';
	
/**
 * A simple paginator that works on top of a data source
 * @class Paginator
 * @extends Widget
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */	
$.Paginator = $.Base.create('paginator', $.Widget, [], {
	
	ATTRS: {
		/**
		 * @attribute recordSet
		 * @description A RecordSet with the data the paginator should handle
		 * @required
		 * @type RecordSet
		 */
		recordSet: {
			required: true
		},
		/**
		 * @attribute recordsPerPage
		 * @description Number of records each page should show
		 * @type Number
		 * @default 10
		 */
		recordsPerPage: {
			value: 10
		},
		/**
		 * @attribute firstLast
		 * @description Wheter the 'First' and 'Last' buttons should appear
		 * @type Boolean
		 * @default true
		 */
		firstLast: {
			value: true
		},
		/**
		 * @attribute prevNext
		 * @description Wheter the 'previous' and 'next' buttons should appear
		 * @type Boolean
		 * @default true
		 */
		prevNext: {
			value: true
		},
		/**
		 * @attribute pagesShown
		 * @description Number of pages that should be listed in the paginator (1, 2, 3...)
		 * @type Number
		 * @default 5
		 */
		pagesShown: {
			value: 5
		},
		/**
		 * @attribute firstText
		 * @description The text of the 'first' button
		 * @writeOnce
		 * @default '<< first'
		 * @type String
		 */
		firstText: {
			writeOnce: true,
			value: '<< first'
		},
		/**
		 * @attribute prevText
		 * @description The text of the 'previous' button
		 * @writeOnce
		 * @default '< prev'
		 * @type String
		 */
		prevText: {
			writeOnce: true,
			value: '< prev'
		},
		/**
		 * @attribute nextText
		 * @description The text of the 'next' button
		 * @writeOnce
		 * @default 'next >'
		 * @type String
		 */
		nextText: {
			writeOnce: true,
			value: 'next >'
		},
		/**
		 * @attribute lastText
		 * @description The text of the 'last' button
		 * @writeOnce
		 * @default 'last >>'
		 * @type String
		 */
		lastText: {
			writeOnce: true,
			value: 'last >>'
		},
		className: {
			writeOnce: true,
			value: 'pg'
		},
		/**
		 * @attribute currentPage
		 * @description The current selected page. If set in the config, 
		 * the paginator will go directly to that page when rendered
		 * @writeOnce
		 * @type Number
		 */
		currentPage: {
			writeOnce: true,
			value: 0
		},
		/**
		 * @attribute pageCount
		 * @description The number of pages in the paginator
		 * @readOnly
		 * @type Number
		 */
		pageCount: {
			readOnly: true,
			value: 0
		}
	},
	
	EVENTS: {
		render: '_renderUI'
	}
	
}, {
	
	initializer: function () {
		var recordSet = this.get('recordSet');
		recordSet.on('replace', this._recalculate, this);
		
		this.set('pageCount', Math.ceil(recordSet.getRecords().length / this.get('recordsPerPage')) + 1);
	},
	
	_recalculate: function (e, newRecordSet) {
		
	},
	
	/**
	 * Go to a certain page
	 * @method goTo
	 * @param {Number} page
	 * @chainable
	 */
	goTo: function (page) {
		
		return this;
	},
	
	_onFirstClick: function (e) {
		if (e.target.hasClass(ACTIVE)) {
			this.goTo(0);
		}
	},
	
	_onPrevClick: function (e) {
		if (e.target.hasClass(ACTIVE)) {
			this.goTo(this.get(CURRENT_PAGE) - 1);
		}
	},
	
	_onPageSelectorClick: function (e) {
		this.goTo(parseInt($(e.target).html(), 10));
	},
	
	_onNextClick: function (e) {
		if (e.target.hasClass(ACTIVE)) {
			this.goTo(this.get(CURRENT_PAGE) + 1);
		}
	},
	
	_onLastClick: function (e) {
		if (e.target.hasClass(ACTIVE)) {
			this.goTo(this.get('pageCount') - 1);
		}
	},
	
	_createButton: function (className, callback, text, container) {
		var id = this.get('id');
		var btn = $(NEW_SPAN).attr(ID, this.getClassName(id, className)).addClass(this.getClassName(className), INACTIVE).html(text);
		btn.on(CLICK, callback, this);
		btn.appendTo(container);
		return btn;
	},
	
	_renderUI: function () {
		var pagesContainer, pageSpan;
		var pageCount = this.get('pageCount');
		var currentPage = this.get('currentPage');
		var id = this.get('id'), i;
		var boundingBox = this.get('boundingBox');
		var getClassName = $.bind(this.getClassName, this);
		
		// the 'first' button object
		this._createButton('first', this._onFirstClick, this.get('firstText'), boundingBox);
		
		// the 'previous' button object
		this._createButton('previous', this._onPrevClick, this.get('prevText'), boundingBox);
		
		// the pages are inside a container
		pagesContainer = $(NEW_SPAN).addClass(getClassName('pages')).appendTo(boundingBox);
		
		for (i = currentPage + 1; i < currentPage + pageCount + 1; i++) {
			// create each 'page' button
			pageSpan = this._createButton('page', this._onPageSelectorClick, i, pagesContainer);
			pageSpan.removeClass(INACTIVE);
			pageSpan.addClass(i == currentPage + 1 ? getClassName('current', 'page') : '', i == currentPage + 1 ? ACTIVE : INACTIVE);
		}
		
		// the 'next' button object
		this._createButton('next', this._onNextClick, this.get('nextText'), boundingBox);
		
		// the 'last' button object
		this._createButton('last', this._onLastClick, this.get('lastText'), boundingBox);
		
	}
	
});
			
});