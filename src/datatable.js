/*
 * @requires Base module
 */
jet().add('datatable', function ($) {
	
	var FALSE = false,
		TRUE = true;
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;	
	
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
		var recordSet = [];
		
		var prefix = myself.get("classPrefix");
		var className = myself.get("className")
		var prefixClass = prefix + className + "-";
		var table = $("<table/>");
		var thead = $("<thead/>").appendTo(table);
		var tbody = $("<tbody/>").addClass(prefixClass + "data").appendTo(table);
				
		A.each(myself.get("columnDefinitions"), function (colDef) {
			thead.append($("<th/>").append($("<div/>").addClass(prefixClass + "liner").append($("<span/>").addClass(prefixClass + "label").html(colDef.label || colDef.key))));
		});
		
		var rowAddingDelay;
		var rowsToBeAdded = [];
		var readyToAddRows = function () {
			var rows = [];
			var colDefs = myself.get("columnDefinitions");
			A.each(rowsToBeAdded, function (row) {
				rows[rows.length] = ['<tr><td class="', prefix, className, "0-", colDefs[0].key, '"><div class="', prefixClass, "liner", '">', row.join('</div></td><td><div class="' + prefixClass + "liner" + '">'), "</div></td></tr>"].join("");
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
			if (Lang.isHash(row)) {
				A.each(myself.get("columnDefinitions"), function (colDef) {
					tmpRow[tmpRow.length] = row[colDef.key];
				});
				row = tmpRow;
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
		
		myself.on("sortedByChange", function (e) {
			
		});
		
		/**
		 * Replace all rows when the DataSource updates
		 * 
		 * @param {EventFacade} e
		 * @param {RecordSet} recordSet
		 */
		myself.onDataReturnReplaceRows = function (e, newRecordSet) {
			tbody.children().remove();
			A.each(newRecordSet, function (record) {
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
			A.each(newRecordSet, function (record) {
				myself.addRow(record);
			});
			recordSet.push.apply(recordSet, newRecordSet);
		};
		
		myself.on("render", function () {
			myself.onDataReturnAddRows(null, myself.get("dataSource").get("recordSet"));
			myself.get("boundingBox").addClass(prefix + className).append(table);
		});
	};
	$.extend(DataTable, $.Widget);
	
	$.add({
		DataTable: DataTable
	});
});