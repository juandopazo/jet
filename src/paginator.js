jet().add('paginator', function ($) {
	
	var TRUE = true,
		FALSE = false;
		
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;
		
	var RECORDSET = "recordSet",
		NEW_SPAN = "<span/>";
		
	if (!jet.Paginator) {
		jet.Paginator = {};
	}
	if (!Lang.isNumber(jet.Paginator.ids)) {
		jet.Paginator.ids = 0;
	}
		
	var Paginator = function () {
		Paginator.superclass.constructor.apply(this, arguments);
		
		var currentPage = 0;
		var pageCount = 0;
		
		var myself = this.addAttrs({
			recordSet: {
				required: TRUE
			},
			recordsPerPage: {
				value: 10
			},
			firstLast: {
				value: TRUE
			},
			prevNexst: {
				value: TRUE
			},
			pagesShown: {
				value: 5
			},
			firstText: {
				writeOnce: TRUE,
				value: "<< first"
			},
			prevText: {
				writeOnce: TRUE,
				value: "< prev"
			},
			nextText: {
				writeOnce: TRUE,
				value: "next >"
			},
			lastText: {
				writeOnce: TRUE,
				value: "last >>"
			},
			className: {
				writeOnce: TRUE,
				value: "pg"
			},
			currentPage: {
				writeOnce: TRUE,
				value: currentPage
			},
			pageCount: {
				readOnly: TRUE,
				value: pageCount
			}
		});
		currentPage = myself.get("currentPage");
		
		var id = jet.Paginator.ids++;
		
		var recordSet = myself.get(RECORDSET);
		pageCount = Math.ceil(recordSet.getRecords().length / myself.get("recordsPerPage")) + 1;
		
		var recalculate = function (e, newRecordSet) {
			
		};
		myself.get(RECORDSET).on("replace", recalculate);
		
		var goTo = function (page) {
			
		};
		myself.goTo = goTo;
		
		var prefix = myself.get("classPrefix");
		var className = myself.get("className");
		prefix += className;
		
		var spanFirst, spanPrev, spanNext, spanLast, pagesContainer;
		
		myself.on("render", function () {
			
			var boundingBox = myself.get("boundingBox");
			spanFirst = $(NEW_SPAN).attr("id", prefix + id + "-first").addClass(prefix + "-first", "inactive").on("click", function () {
				if ($(this).hasClass("active")) {
					goTo(0);
				}
			}).html(myself.get("firstText")).appendTo(boundingBox);
			spanPrev = $(NEW_SPAN).attr("id", prefix + id + "-previous").addClass(prefix + "-previous", "inactive").on("click", function () {
				if ($(this).hasClass("active")) {
					goTo(myself.get("currentPage") - 1);
				}
			}).html(myself.get("prevText")).appendTo(boundingBox);
			pagesContainer = $(NEW_SPAN).addClass(prefix + "-pages").appendTo(boundingBox);
			console.log(currentPage, currentPage + pageCount);
			for (var i = currentPage + 1; i < currentPage + pageCount + 1; i++) {
				$(NEW_SPAN).addClass(prefix + "-page", i == currentPage + 1 ? prefix + "-current-page" : "", i == currentPage + 1 ? "active" : "inactive").attr("id", prefix + "-page" + i).html(i).on("click", (function (index) {
					return function () {
						goTo(index);
					};
				}(i))).appendTo(pagesContainer);
			}
			spanNext = $(NEW_SPAN).attr("id", prefix + id + "-next").addClass(prefix + "-next", "inactive").on("click", function () {
				if ($(this).hasClass("active")) {
					goTo(myself.get("currentPage") + 1);
				}
			}).html(myself.get("nextText")).appendTo(boundingBox);
			spanLast = $(NEW_SPAN).attr("id", prefix + id + "-last").addClass(prefix + "-last", "inactive").on("click", function () {
				if ($(this).hasClass("active")) {
					goTo(myself.get("pagesCount") - 1);
				}
			}).html(myself.get("lastText")).appendTo(boundingBox);
			
		});
	};
	$.extend(Paginator, $.Widget);
	
	$.Paginator = Paginator;
	
});