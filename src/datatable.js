/*
 * @requires Base module
 */
jet().add('datatable', function ($) {
	
	var FALSE = false,
		TRUE = true;
	
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
	 * @class
	 * @extends $.Widget
	 */
	var DataTable = function () {
		DataTable.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			dataSource: {
				required: TRUE
			},
			columnDefinitions: {
				required: TRUE,
				validator: Lang.isArray
			},
			className: {
				writeOnce: TRUE,
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
				tr.append($("<td/>").addClass(prefix + className + "-col-" + colDef.key).append($(NEW_DIV).addClass(prefixClass + LINER).html(colDef.formatter ? colDef.formatter(text, row.getData()) : text)));
			});
			tr.addClass(tbody.children()._nodes.length % 2 === 0 ? (prefixClass + EVEN) : (prefixClass + ODD)).appendTo(tbody);
		};
		/**
		 * Adds a row
		 * 
		 * @param {Record|HTMLRowElement|Array} row
		 */
		myself.addRow = function (row) {
			addRow(row);
			if (sortedBy) {
				sort($(NUMERAL + thIdPrefix + sortedBy));
			}
		};
		
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
				sort($(NUMERAL + thIdPrefix + sortedBy), TRUE);
			}
		};
		/*@TODO
		myself.deleteRow = function () {
			
		};
		
		myself.deleteRows = function () {
			
		};
		
		myself.getColumn = function () {
			
		};*/
		
		myself.getFirstTr = function () {
			return tbody.children().eq(0);
		};
		
		myself.getNextTr = function (tr) {
			if (Lang.isRecord(tr)) {
				tr = tr.getId();
			}
			if (Lang.isNumber(tr)) {
				tr = tbody.find(NUMERAL + recordIdPrefix + tr);
			}
			return tr.next();
		};
		
		myself.getFirstTd = function (row) {
			if (Lang.isRecord(row)) {
				row = row.getId();
			}
			if (Lang.isNumber(row)) {
				row = tbody.find(NUMERAL + recordIdPrefix + row);
			}
			return row.children().eq(0);
		};
		
		myself.getNextTd = function (td) {
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
		 * 
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
		 * @param {EventFacade} e
		 * @param {RecordSet} newRecordSet
		 */
		myself.onDataReturnAddRows = function (e, newRecordSet) {
			myself.addRows(newRecordSet);
			recordSet.push(newRecordSet);
		};
		
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