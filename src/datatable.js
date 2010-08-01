/*
 * @requires Base module
 */
jet().add('datatable', function ($) {
	
	var FALSE = false,
		TRUE = true;
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;	
		
	var DATA = "data";
	
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
		
		var fields;
		var recordSet = myself.get("dataSource").get("recordSet");
		
		var prefix = myself.get("classPrefix");
		var className = myself.get("className")
		var prefixClass = prefix + className + "-";
		var table = $("<table/>");
		var thead = $("<thead/>").appendTo(table);
		var tbody = $("<tbody/>").addClass(prefixClass + DATA).appendTo(table);
		
		var sort = function () {
			var th = $(this);
			var order, unorder, i;
			var key = th.attr("id").split("-").pop();
			if (th.hasClass(prefixClass + "desc")) {
				order = "asc";
				unorder = "desc";
			} else {
				unorder = "asc";
				order = "desc";
			}
			/*
			 * Add/remove respective classes
			 */
			thead.find("th").removeClass(prefixClass + order, prefixClass + unorder);
			th.addClass(prefixClass + order).removeClass(prefixClass + unorder);
			recordSet.sortBy(key, order);
			var records = recordSet.getRecords();
			var length = records.length;
			var before, after;
			var even = prefixClass + (length % 2 == 0 ? "even" : "odd");
			var odd = prefixClass + (length % 2 == 0 ? "odd" : "even");
			$("#" + prefix + "rec" + records[length - 1].getId()).addClass(length % 2 == 0 ? odd : even).removeClass(length % 2 == 0 ? even : odd);
			for (i = length - 2; i >= 0; i--) {
				before = $("#" + prefix + "rec" + records[i].getId());
				after = $("#" + prefix + "rec" + records[i + 1].getId());
				before.addClass(i % 2 == 0 ? even : odd).removeClass(i % 2 == 0 ? odd : even).insertBefore(after);
			}
			tbody.find("." + prefixClass + "desc").removeClass(prefixClass + "desc");
			tbody.find("." + prefixClass + "col-" + key).addClass(prefixClass + "desc");
		};
		
		/*
		 * Set up table headers
		 */
		var colDefs = myself.get("columnDefinitions");
		A.each(colDefs, function (colDef, i) {
			var th = $("<th/>").append($("<div/>").addClass(prefixClass + "liner").append($("<span/>").addClass(prefixClass + "label").html(colDef.label || colDef.key)));
			th.attr("id", prefixClass + "0-th-" + colDef.key);
			if (i == 0) {
				th.addClass(prefixClass + "first");
			} else if (i == colDefs.length - 1) {
				th.addClass(prefixClass + "last");
			}
			if (colDef.sortable) {
				th.addClass(prefixClass + "sortable").on("click", sort);
			}
			thead.append(th);
		});
		
		var rowAddingDelay;
		var rowsToBeAdded = [];
		var readyToAddRows = function () {
			var rows = [];
			var colDefs = myself.get("columnDefinitions");
			A.each(rowsToBeAdded, function (row) {
				var id = row.getId();
				var data = row.getData();
				row = ['<tr id="', prefix, 'rec', id, '">'];
				A.each(colDefs, function (colDef) {
					row.push('<td class="', prefix, className, "-col-", colDef.key, '"><div class="', prefixClass, "liner", '">', data[colDef.key], '</div></td>');
				});
				row[row.length] = "</tr>";
				rows[rows.length] = row.join("");
			});
			tbody._node.innerHTML += rows.join("");
			rowsToBeAdded = [];
			tbody.children().removeClass(prefixClass + "even", prefixClass + "odd").each(function (row, i) {
				row.addClass(i % 2 == 0 ? prefixClass + "even" : prefixClass + "odd");
			});
		};
		
		/**
		 * Adds a row
		 * 
		 * @param {Record, HTMLRowElement, Array} row
		 */
		myself.addRow = function (row) {
			var tmpRow = [];
			if (!(row instanceof $.Record)) {
				row = new $.Record(row);
			}
			rowsToBeAdded[rowsToBeAdded.length] = row;
			if (rowAddingDelay) {
				clearTimeout(rowAddingDelay);
			}
			rowAddingDelay = setTimeout(readyToAddRows, 0);
		};
		
		myself.addRows = function () {
			
		};
		
		myself.deleteRow = function () {
			
		};
		
		myself.deleteRows = function () {
			
		};
		
		myself.getColumn = function () {
			
		};
		
		myself.getFirstTr = function () {
			
		};
		
		myself.getNextTr = function (tr) {
			
		};
		
		myself.getFirstTd = function (row) {
			
		};
		
		myself.getNextTd = function (td) {
			
		};
		
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
			
		};
		
		/**
		 * Replace all rows when the DataSource updates
		 * 
		 * @param {EventFacade} e
		 * @param {RecordSet} recordSet
		 */
		myself.onDataReturnReplaceRows = function (e, newRecordSet) {
			tbody.children().remove();
			A.each(newRecordSet.getRecords(), function (record) {
				myself.addRow(record);
			});
			recordSet = newRecordSet;
		};
		
		/**
		 * When the DataSource updates, treat the returned data as additions to the table's recordSet
		 * @param {EventFacade} e
		 * @param {RecordSet} newRecordSet
		 */
		myself.onDataReturnAddRows = function (e, newRecordSet) {
			/*
			 * @TODO remove "sorted" state
			 */
			A.each(newRecordSet.getRecords(), function (record) {
				myself.addRow(record);
			});
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