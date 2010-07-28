/*
 * @requires Base module
 */
jet().add('datatable', function ($) {
	
	var FALSE = false,
		TRUE = true;
	
	var Lang = $.Lang,
		Hash = $.Hash,
		ArrayHelper = $.Array;	
	
	/**
	 * 
	 * @extends $.Widget
	 */
	var DataTable = function () {
		DataTable.superclass.constructor.apply(this, arguments);
		
		var table = $(document.createElement("table")).attr("id", "testtable");
		var tbody = $(document.createElement("tbody")).appendTo(table);
		
		var rowAddingDelay;
		var rowsToBeAdded = [];
		var readyToAddRows = function () {
			var rows = [];
			ArrayHelper.each(rowsToBeAdded, function (row) {
				rows[rows.length] = "<tr><td>" + row.join("</td><td>") + "</td></tr>";
			});
			tbody.getNode().innerHTML += rows.join("");
			rowsToBeAdded = [];
		};
		
		this.addRow = function (row) {
			rowsToBeAdded[rowsToBeAdded.length] = row;
			if (rowAddingDelay) {
				clearTimeout(rowAddingDelay);
			}
			rowAddingDelay = setTimeout(readyToAddRows, 0);
		};
		
		this.on("render", function () {
			this.get("boundingBox").append(table);
		});
	};
	$.extend(DataTable, $.Widget);
	
	$.add({
		DataSource: DataSource,
		DataTable: DataTable
	});
});