/**
 * Paginator widget
 * @module paginator
 * @requires jet, lang, node, base, datasource
 * @namespace
 */
jet().add('paginator', function ($) {
	
	var TRUE = true,
		FALSE = false;
		
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;
		
	var RECORDSET = "recordSet",
		NEW_SPAN = "<span/>",
		ACTIVE = "active",
		INACTIVE = "inactive",
		CLICK = "click",
		ID = "id",
		CURRENT_PAGE = "currentPage";
		
	if (!jet.Paginator) {
		jet.Paginator = {};
	}
	if (!Lang.isNumber(jet.Paginator.ids)) {
		jet.Paginator.ids = 0;
	}
	
	/**
	 * A simple paginator that works on top of a data source
	 * @class Paginator
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */	
	var Paginator = function () {
		Paginator.superclass.constructor.apply(this, arguments);
		
		var currentPage = 0;
		var pageCount = 0;
		
		var myself = this.addAttrs({
			/**
			 * @config recordSet
			 * @description A RecordSet with the data the paginator should handle
			 * @required
			 * @type RecordSet
			 */
			recordSet: {
				required: TRUE
			},
			/**
			 * @config recordsPerPage
			 * @description Number of records each page should show
			 * @type Number
			 * @default 10
			 */
			recordsPerPage: {
				value: 10
			},
			/**
			 * @config firstLast
			 * @description Wheter the "First" and "Last" buttons should appear
			 * @type Boolean
			 * @default true
			 */
			firstLast: {
				value: TRUE
			},
			/**
			 * @config prevNext
			 * @description Wheter the "previous" and "next" buttons should appear
			 * @type Boolean
			 * @default true
			 */
			prevNext: {
				value: TRUE
			},
			/**
			 * @config pagesShown
			 * @description Number of pages that should be listed in the paginator (1, 2, 3...)
			 * @type Number
			 * @default 5
			 */
			pagesShown: {
				value: 5
			},
			/**
			 * @config firstText
			 * @description The text of the "first" button
			 * @writeOnce
			 * @default "<< first"
			 * @type String
			 */
			firstText: {
				writeOnce: TRUE,
				value: "<< first"
			},
			/**
			 * @config prevText
			 * @description The text of the "previous" button
			 * @writeOnce
			 * @default "< prev"
			 * @type String
			 */
			prevText: {
				writeOnce: TRUE,
				value: "< prev"
			},
			/**
			 * @config nextText
			 * @description The text of the "next" button
			 * @writeOnce
			 * @default "next >"
			 * @type String
			 */
			nextText: {
				writeOnce: TRUE,
				value: "next >"
			},
			/**
			 * @config lastText
			 * @description The text of the "last" button
			 * @writeOnce
			 * @default "last >>"
			 * @type String
			 */
			lastText: {
				writeOnce: TRUE,
				value: "last >>"
			},
			className: {
				writeOnce: TRUE,
				value: "pg"
			},
			/**
			 * @config currentPage
			 * @description The current selected page. If set in the config, 
			 * the paginator will go directly to that page when rendered
			 * @writeOnce
			 * @type Number
			 */
			currentPage: {
				writeOnce: TRUE,
				value: currentPage
			},
			/**
			 * @config pageCount
			 * @description The number of pages in the paginator
			 * @readOnly
			 * @type Number
			 */
			pageCount: {
				readOnly: TRUE,
				value: pageCount
			}
		});
		currentPage = myself.get(CURRENT_PAGE);
		
		var id = jet.Paginator.ids++;
		
		var recordSet = myself.get(RECORDSET);
		pageCount = Math.ceil(recordSet.getRecords().length / myself.get("recordsPerPage")) + 1;
		
		var recalculate = function (e, newRecordSet) {
			
		};
		myself.get(RECORDSET).on("replace", recalculate);
		
		/**
		 * Go to a certain page
		 * @method goTo
		 * @param {Number} page
		 * @chainable
		 */
		var goTo = function (page) {
			
			return myself;
		};
		myself.goTo = goTo;
		
		myself.on("render", function () {
			var prefix = myself.get("classPrefix");
			var className = myself.get("className");
			var spanFirst, spanPrev, spanNext, spanLast, pagesContainer;
			prefix += className;
			
			var boundingBox = myself.get("boundingBox");
			
			// the "first" button object
			spanFirst = $(NEW_SPAN).attr(ID, prefix + id + "-first").addClass(prefix + "-first", INACTIVE).on(CLICK, function () {
				if ($(this).hasClass(ACTIVE)) {
					goTo(0);
				}
			}).html(myself.get("firstText")).appendTo(boundingBox);
			
			// the "previous" button object
			spanPrev = $(NEW_SPAN).attr(ID, prefix + id + "-previous").addClass(prefix + "-previous", INACTIVE).on(CLICK, function () {
				if ($(this).hasClass(ACTIVE)) {
					goTo(myself.get(CURRENT_PAGE) - 1);
				}
			}).html(myself.get("prevText")).appendTo(boundingBox);
			
			// the pages are inside a container
			pagesContainer = $(NEW_SPAN).addClass(prefix + "-pages").appendTo(boundingBox);
			for (var i = currentPage + 1; i < currentPage + pageCount + 1; i++) {
				// create each "page" button
				$(NEW_SPAN).addClass(prefix + "-page", i == currentPage + 1 ? prefix + "-current-page" : "", i == currentPage + 1 ? ACTIVE : INACTIVE).attr(ID, prefix + "-page" + i).html(i).on(CLICK, (function (index) {
					return function () {
						goTo(index);
					};
				}(i))).appendTo(pagesContainer);
			}
			
			// the "next" button object
			spanNext = $(NEW_SPAN).attr(ID, prefix + id + "-next").addClass(prefix + "-next", INACTIVE).on(CLICK, function () {
				if ($(this).hasClass(ACTIVE)) {
					goTo(myself.get(CURRENT_PAGE) + 1);
				}
			}).html(myself.get("nextText")).appendTo(boundingBox);
			
			// the "last" button object
			spanLast = $(NEW_SPAN).attr(ID, prefix + id + "-last").addClass(prefix + "-last", INACTIVE).on(CLICK, function () {
				if ($(this).hasClass(ACTIVE)) {
					goTo(myself.get("pageCount") - 1);
				}
			}).html(myself.get("lastText")).appendTo(boundingBox);
			
		});
	};
	$.extend(Paginator, $.Widget);
	
	$.Paginator = Paginator;
	
});