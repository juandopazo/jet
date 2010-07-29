/*
 * @requires Base module
 */
jet().add('datatable', function ($) {
	
	var FALSE = false,
		TRUE = true;
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array;	
	
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
			}
		});
		
		var fields;
		var recordSet;
		
		var table = $("<table/>").attr("id", "testtable");
		var thead = $("<thead/>").appendTo(table);
		var tbody = $("<tbody/>").appendTo(table);
				
		/**
		 * 
		 * @param {EventFacade} e
		 * @param {DataSource} newDataSource
		 */
		myself.onDataSourceChangeReplaceHeaders = function (e, newDataSource) {
			thead.children().remove();
			A.each(myself.get("columnDefinitions"), function (colDef) {
				thead.append($("<th/>").html(colDef.label || colDef.key));
			});
		};
		myself.onDataSourceChangeReplaceHeaders(null, myself.get("dataSource"));
		
		var rowAddingDelay;
		var rowsToBeAdded = [];
		var readyToAddRows = function () {
			var rows = [];
			A.each(rowsToBeAdded, function (row) {
				rows[rows.length] = "<tr><td>" + row.join("</td><td>") + "</td></tr>";
			});
			tbody.getNode().innerHTML += rows.join("");
			rowsToBeAdded = [];
		};
		
		/**
		 * Adds a row
		 * 
		 * @param {Record|HTMLRowElement|Array} row
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
		
		/**
		 * Replace all rows when the DataSource updates
		 * 
		 * @param {EventFacade} e
		 * @param {RecordSet} recordSet
		 */
		myself.onDataReturnReplaceRows = function (e, newRecordSet) {
			recordSet = newRecordSet;
			tbody.children().remove();
			A.each(recordSet, function (record) {
				myself.addRow(record);
			});
		};
		
		myself.on("render", function () {
			myself.get("boundingBox").append(table);
		});
	};
	$.extend(DataTable, $.Widget);
	
	$.add({
		DataTable: DataTable
	});
});