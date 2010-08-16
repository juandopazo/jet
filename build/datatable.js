/**
 * Provides a DataTable widget that can be sorted and linked to a DataSource
 * @module datatable
 * @requires base, datasource
 * @namespace
 */
jet().add('datatable', function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;	
		
	var DATA = "data",
		ASC = "asc",
		DESC = "desc",
		ODD = "odd",
		EVEN = "even",
		REC = "rec",
		LINER = "liner",
		NUMERAL = "#",
		DOT = ".",
		ID = "id",
		SORTABLE = "sortable",
		NEW_DIV = "<div/>";
		
	var COLUMN_DEFINITIONS = "columnDefinitions";
		
	if (!jet.DataTable) {
		jet.DataTable = {};
	}
	if (!Lang.isNumber(jet.DataTable.ids)) {
		jet.DataTable.ids = 0;
	}
	
	/*
	 * @TODO
	 */
	var Column = function () {
		
	};
	
	/**
	 * A DataTable is an HTML table that can be sorted and linked to a DataSource
	 * @class DataTable
	 * @extends Widget
	 * @param {Object} config Object literal specifying widget configuration properties
	 * @constructor
	 */
	var DataTable = function () {
		DataTable.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			dataSource: {
				required: true
			},
			columnDefinitions: {
				required: true,
				validator: Lang.isArray
			},
			className: {
				writeOnce: true,
				value: "dt"
			}
		});
		
		var id = jet.DataTable.ids++;
		
		var fields;
		var recordSet = myself.get("dataSource").get("recordSet");
		
		var prefix = myself.get("classPrefix");
		var className = myself.get("className");
		var prefixClass = prefix + className + "-";
		var recordIdPrefix = prefixClass + id + REC;
		var thIdPrefix = prefixClass + id + "th-";
		
		var table = $("<table/>").attr(ID, prefixClass + id);
		var thead = $("<thead/>").appendTo(table);
		var tbody = $("<tbody/>").addClass(prefixClass + DATA).appendTo(table);
		
		var sortedBy;
		
		var sort = function (th, keepOrder) {
			var key = th.attr(ID).split("-").pop();
			var isDesc = th.hasClass(prefixClass + DESC);
			var order = isDesc ? DESC : ASC;
			var unorder = isDesc ? ASC : DESC;
			var i;
			if (!keepOrder) {
				i = order;
				order = unorder;
				unorder = i;
			}
			/*
			 * Add/remove respective classes
			 */
			thead.find("th").removeClass(prefixClass + order, prefixClass + unorder);
			th.addClass(prefixClass + order).removeClass(prefixClass + unorder);
			// Sort recordset
			recordSet.sortBy(key, order);
			sortedBy = key;
			
			var records = recordSet.getRecords();
			var length = records.length;
			var before, after;
			var even = prefixClass + (length % 2 === 0 ? EVEN : ODD);
			var odd = prefixClass + (length % 2 === 0 ? ODD : EVEN);
			$(NUMERAL + recordIdPrefix + records[length - 1].getId()).addClass(length % 2 === 0 ? odd : even).removeClass(length % 2 === 0 ? even : odd);
			for (i = length - 2; i >= 0; i--) {
				before = $(NUMERAL + recordIdPrefix + records[i].getId());
				after = $(NUMERAL + recordIdPrefix + records[i + 1].getId());
				before.addClass(i % 2 === 0 ? even : odd).removeClass(i % 2 === 0 ? odd : even).insertBefore(after);
			}
			tbody.find(DOT + prefixClass + DESC).removeClass(prefixClass + DESC);
			tbody.find(DOT + prefixClass + "col-" + key).addClass(prefixClass + DESC);
		};
		
		/*
		 * Set up table headers
		 */
		var colDefs = myself.get(COLUMN_DEFINITIONS);
		A.each(colDefs, function (colDef, i) {
			var th = $("<th/>").append($(NEW_DIV).addClass(prefixClass + LINER).append($("<span/>").addClass(prefixClass + "label").html(colDef.label || colDef.key)));
			th.attr(ID, thIdPrefix + colDef.key);
			if (i === 0) {
				th.addClass(prefixClass + "first");
			} else if (i == colDefs.length - 1) {
				th.addClass(prefixClass + "last");
			}
			if (colDef.sortable) {
				th.addClass(prefixClass + SORTABLE).on("click", function (e) {
					e.stopPropagation();
					e.preventDefault();
					sort(th);
				});
			}
			thead.append(th);
		});
		
		var addRow = function (row) {
			if (!Lang.isRecord(row)) {
				row = new $.Record(row);
			}
			var tr = $("<tr/>").attr(ID, recordIdPrefix + row.getId());
			A.each(myself.get(COLUMN_DEFINITIONS), function (colDef) {
				var text = row.get(colDef.key);
				var td = $("<td/>").addClass(prefix + className + "-col-" + colDef.key);
				td.append($(NEW_DIV).addClass(prefixClass + LINER).html(colDef.formatter ? colDef.formatter(text, row.getData(), td) : text)).appendTo(tr);
			});
			tr.addClass(tbody.children().length % 2 === 0 ? (prefixClass + EVEN) : (prefixClass + ODD)).appendTo(tbody);
		};
		/**
		 * Adds a row
		 * @method addRow
		 * @param {Record|HTMLRowElement|Array} row
		 * @chainable
		 */
		myself.addRow = function (row) {
			addRow(row);
			if (sortedBy) {
				sort($(NUMERAL + thIdPrefix + sortedBy));
			}
			return myself;
		};
		
		/**
		 * Adds several rows
		 * @method addRows
		 * @param {Array} rows
		 * @chainable
		 */
		myself.addRows = function (rows) {
			if (Lang.isArray(rows)) {
				A.each(rows, function (row) {
					if (!Lang.isRecord(row)) {
						row = new $.Record(row);
					}
				});
			} else if (Lang.isRecordSet(rows)) {
				rows = rows.getRecords();
			}
			A.each(rows, addRow);
			if (sortedBy) {
				sort($(NUMERAL + thIdPrefix + sortedBy), true);
			}
		};
		/*@TODO
		myself.deleteRow = function () {
			
		};
		
		myself.deleteRows = function () {
			
		};
		
		myself.getColumn = function () {
			
		};*/
		
		/**
		 * Returns the first html row element in the table
		 * @method getFirstTr
		 * @return NodeList
		 */
		myself.getFirstTr = function () {
			return tbody.children().eq(0);
		};
		
		/**
		 * Returns the next html row element base on the one passed as a parameter
		 * @method getNextTr
		 * @param {Record, HTMLTrElement, NodeList, Number} tr
		 * @return NodeList
		 */
		myself.getNextTr = function (tr) {
			if (Lang.isRecord(tr)) {
				tr = tr.getId();
			}
			if (Lang.isNumber(tr)) {
				tr = tbody.find(NUMERAL + recordIdPrefix + tr);
			}
			return tr.next();
		};
		
		/**
		 * Returns the first cell element in a row
		 * @method getFirstTd
		 * @param {Record, HTMLTrElement, NodeList, Number} row
		 * @return NodeList
		 */
		myself.getFirstTd = function (row) {
			if (Lang.isRecord(row)) {
				row = row.getId();
			}
			if (Lang.isNumber(row)) {
				row = tbody.find(NUMERAL + recordIdPrefix + row);
			}
			return row.children().eq(0);
		};
		
		/**
		 * Returns the next cell element in a row based on the one passed as a parameter
		 * @method getNextTd
		 * @param {Record, HTMLTrElement, NodeList, Number} td
		 * @return NodeList
		 */
		myself.getNextTd = function (td) {
			if (Lang.isRecord(td)) {
				td = td.getId();
			}
			if (Lang.isNumber(td)) {
				td = tbody.find(NUMERAL + recordIdPrefix + td).children(td - 1);
			}
			return td.next();
		};
		/*@TODO
		myself.getSelectedCell = function () {
			
		};
		
		myself.getSelectedRow = function () {
			
		};
		
		myself.getSelectedColumn = function () {
			
		};
		
		myself.selectCell = function (cell) {
			
		};
		
		myself.selectRow = function (row) {
			
		};
		
		myself.selectColumn = function (col) {
			
		};
		
		myself.unselectCell = function (cell) {
			
		};
		
		myself.unselectRow = function (row) {
			
		};
		
		myself.unselectColumn = function (col) {
			
		};
		
		myself.unselectAll = function () {
			
		};*/
		
		/**
		 * Replace all rows when the DataSource updates
		 * @method onDataReturnReplaceRows
		 * @param {EventFacade} e
		 * @param {RecordSet} recordSet
		 */
		myself.onDataReturnReplaceRows = function (e, newRecordSet) {
			tbody.children().remove();
			myself.addRows(newRecordSet);
			recordSet.replace(newRecordSet);
		};
		
		/**
		 * When the DataSource updates, treat the returned data as additions to the table's recordSet
		 * @method onDataReturnAddRows
		 * @param {EventFacade} e
		 * @param {RecordSet} newRecordSet
		 */
		myself.onDataReturnAddRows = function (e, newRecordSet) {
			myself.addRows(newRecordSet);
			recordSet.push(newRecordSet);
		};
		
		//rende lifecycle
		myself.on("render", function () {
			myself.onDataReturnAddRows(null, recordSet);
			myself.get("boundingBox").addClass(prefix + className).append(table);
		});
	};
	$.extend(DataTable, $.Widget);
	
	$.add({
		DataTable: DataTable
	});
});
/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/

		