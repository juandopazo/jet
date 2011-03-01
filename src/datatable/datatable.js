/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * Provides a DataTable widget that can be sorted and linked to a DataSource
 * @module datatable
 * @requires base, datasource
 * @namespace
 */
jet().add('datatable', function ($) {
	
	var Lang = $.Lang,
		Hash = $.Hash,
		A = $.Array,
		Base = $.Base,
		Widget = $.Widget,
		Record = $.Record,
		RecordSet = $.RecordSet;	
		
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
		NEW_DIV = "<div/>",
		CELLS = 'cells',
		THEAD = 'thead',
		TBODY = 'tbody',
		TD = 'td',
		RECORDSET = 'recordSet',
		SORTED_BY = 'sortedBy',
		RECORD_ID_PREFIX = 'recordIdPrefix',
		BOUNDING_BOX = 'boundingBox';
		
	var COLUMN_DEFINITIONS = "columnDefinitions";
		
	var Cell = Base.create('cell', Base, [], {
		ATTRS: {
			value: {
				required: true,
				writeOnce: true
			},
			td: {
				required: true,
				writeOnce: true
			},
			record: {
				required: true,
				writeOnce: true
			}
		}
	});
	
	var Column = Base.create('column', Base, [], {
		
		ATTRS: {
			cells: {
				required: true,
				writeOnce: true
			}
		}
		
	}, {
		
		getFirstTd: function () {
			return this.get(CELLS)[0].get(TD);
		},
		
		getNextTd: function (td) {
			var cells = this.get(CELLS), length = cells.length, i;
			for (i = 0; i < length; i++) {
				if (cells[i].get(TD) == td) {
					break;
				}
			}
			return i < length - 2 ? cells[++i].get(TD) : null; 
		},
		
		getFirstCell: function () {
			return this.get(CELLS)[0];
		},
		
		getNextCell: function (cell) {
			var cells = this.get(CELLS), length = cells.length, i;
			for (i = 0; i < length; i++) {
				if (cells[i] == cell) {
					break;
				}
			}
			return i < length - 2 ? cells[++i] : null; 
		}
	});
	
	/**
	 * A DataTable is an HTML table that can be sorted and linked to a DataSource
	 * @class DataTable
	 * @extends Widget
	 * @param {Object} config Object literal specifying widget configuration properties
	 * @constructor
	 */
	var DataTable = Base.create('dt', Widget, [], {
		
		ATTRS: {
			/**
			 * @config recordSet
			 * @description The data table's associated recordSet
			 * @type RecordSet
			 */
			recordSet: {
				value: new $.RecordSet()
			},
			/**
			 * @config columnDefinitions
			 * @description An array mapping record keys to columns
			 * @required
			 * @type Array
			 */
			columnDefinitions: {
				required: true,
				validator: Lang.isArray
			},
			
			thead: {
				value: '<thead/>',
				setter: $
			},
			tbody: {
				value: '<tbody/>',
				setter: $
			},
			
			recordIdPrefix: {
				readOnly: true,
				getter: function () {
					return this.getClassName(this._uid + REC);
				}
			}
		},
		
		EVENTS: {
			render: function () {
				var contentBox = this.get('contentBox');
				contentBox[0].setAttribute('cellspacing', '0px');
				var thead = this.get(THEAD);
				var tbody = this.get(TBODY);
				
				this._setupTableHeaders();
				
				this.onDataReturnAddRows(null, this.get(RECORDSET));
				
				thead.appendTo(contentBox);
				tbody.addClass(this.getClassName(DATA)).appendTo(contentBox);
			}
		}
		
	}, {
		
		CONTENT_TEMPLATE: '<table/>',
		
		initializer: function () {
			this.set(THEAD, this.get(THEAD));
			this.set(TBODY, this.get(TBODY));
		},
		
		_onThClick: function (e) {
			e.stopPropagation();
			e.preventDefault();
			var target = e.target;
			var parent = this.get(THEAD).first()[0];
			while (target.parentNode != parent) {
				target = target.parentNode;
			}
			this._sort($(target));
		},
		
		_setupTableHeaders: function () {
			var colDefs = this.get(COLUMN_DEFINITIONS);
			var getClassName = $.bind(this.getClassName, this);
			var linerClassName = getClassName(LINER);
			var labelClassname = getClassName('label');
			var sortableClassName = getClassName(SORTABLE);
			var uid = this._uid;
			var self = this;
			var thead = this.get(THEAD);
			var theadRow = $('<tr/>').addClass(getClassName('first'), getClassName('last')).appendTo(thead);
			A.each(colDefs, function (colDef, i) {
				var content = $("<span/>").addClass(labelClassname).html(colDef.label || colDef.key);
				var liner = $(NEW_DIV).addClass(getClassName('liner')).append(content);
				var th = $("<th/>").append(liner);
				th.attr(ID, getClassName(uid, 'th', colDef.key));
				if (i === 0) {
					th.addClass(getClassName('first'));
				} else if (i == colDefs.length - 1) {
					th.addClass(getClassName('last'));
				}
				th.addClass(getClassName('col', colDef.key));
				if (colDef.sortable) {
					self._handlers.push(th.addClass(sortableClassName).on('click', self._onThClick, self));
				}
				if (Lang.isNumber(colDef.width)) {
					th.width(colDef.width);
				}
				theadRow.append(th);
			});
		},
		
		_sort: function (th, keepOrder) {
			var getClassName = $.bind(this.getClassName, this);
			var key = th.attr(ID).split("-").pop();
			var classNameDESC = getClassName(DESC);
			var isDesc = th.hasClass(classNameDESC);
			var order = isDesc ? DESC : ASC;
			var unorder = isDesc ? ASC : DESC;
			var i;
			var thead = this.get(THEAD);
			var tbody = this.get(TBODY);
			var recordSet = this.get(RECORDSET);
			var sortedBy = this.get(SORTED_BY);
			var recordIdPrefix = this.get(RECORD_ID_PREFIX);
			if (!keepOrder) {
				i = order;
				order = unorder;
				unorder = i;
			}
			/*
			 * Add/remove respective classes
			 */
			thead.find("th").removeClass(getClassName(order), getClassName(unorder));
			th.addClass(getClassName(order)).removeClass(getClassName(unorder));
			// Sort recordset
			recordSet.sortBy(key, order);
			sortedBy = key;
			
			var records = recordSet.getRecords();
			var length = records.length;
			var before, after;
			var even = getClassName(length % 2 === 0 ? EVEN : ODD);
			var odd = getClassName(length % 2 === 0 ? ODD : EVEN);
			$(NUMERAL + recordIdPrefix + records[length - 1].getId()).addClass(length % 2 === 0 ? odd : even).removeClass(length % 2 === 0 ? even : odd);
			for (i = length - 2; i >= 0; i--) {
				before = $(NUMERAL + recordIdPrefix + records[i].getId());
				after = $(NUMERAL + recordIdPrefix + records[i + 1].getId());
				before.addClass(i % 2 === 0 ? even : odd).removeClass(i % 2 === 0 ? odd : even).insertBefore(after);
			}
			tbody.find(DOT + classNameDESC).removeClass(classNameDESC);
			tbody.find(DOT + getClassName('col', key)).addClass(classNameDESC);
		},
		
		_addRow: function (row) {
			if (!Record.hasInstance(row)) {
				row = new $.Record(row);
			}
			var recordIdPrefix = this.get(RECORD_ID_PREFIX);
			var tr = $("<tr/>").attr(ID, recordIdPrefix + row.getId());
			var getClassName = $.bind(this.getClassName, this);
			var tbody = this.get(TBODY);
			A.each(this.get(COLUMN_DEFINITIONS), function (colDef) {
				var text = row.get(colDef.key);
				var td = $("<td/>").addClass(getClassName('col', colDef.key));
				var content = colDef.formatter ? colDef.formatter(text, row.getData(), td) : text;
				var liner = $(NEW_DIV).addClass(getClassName(LINER));
				if (Lang.isString(content)) {
					liner.html(content);
				} else {
					liner.append(content);
				}
				td.append(liner).appendTo(tr);
			});
			tr.addClass(getClassName(tbody.children().length % 2 === 0 ? EVEN : ODD)).appendTo(tbody);
		},
		
		/**
		 * Adds a row
		 * @method addRow
		 * @param {Record|HTMLRowElement|Array} row
		 * @chainable
		 */
		addRow: function (row) {
			this._addRow(row);
			var sortedBy = this.get(SORTED_BY);
			if (sortedBy) {
				this._sort($(NUMERAL + this.getClassName(this._uid, 'th', sortedBy)));
			}
			return this;
		},
		
		/**
		 * Adds several rows
		 * @method addRows
		 * @param {Array} rows
		 * @chainable
		 */
		addRows: function (rows) {
			if (Lang.isArray(rows)) {
				A.each(rows, function (row) {
					if (!Record.hasInstance(row)) {
						row = new $.Record(row);
					}
				});
			} else if (RecordSet.hasInstance(rows)) {
				rows = rows.getRecords();
			}
			A.each(rows, this._addRow, this);
			var sortedBy = this.get(SORTED_BY);
			if (sortedBy) {
				this._sort($(NUMERAL + this.getClassName(this._uid, 'th', sortedBy)), true);
			}
			return this;
		},
		
		/*@TODO
		deleteRow: function () {
			
		},
		
		deleteRows: function () {
			
		},
		*/
		
		/**
		 * Returns a column based on an index or the column's key
		 * @method getColumn
		 * @param {Number | String} id
		 * @return Column
		 */
		getColumn: function (id) {
			var col, cells = [], i, records = this.get(RECORDSET).getRecords(), length = records.length;
			var colDefs = this.get(COLUMN_DEFINITIONS);
			var rows = this.get(TBODY).children(), key = Lang.isNumber(id) ? colDefs[id].key : id;
			var index = id;
			if (!Lang.isNumber(id)) {
				for (i = 0; i < colDefs.length; i++) {
					if (colDefs[i].key == id) {
						index = i;
						break;
					}
				}
			}
			for (i = 0; i < length; i++) {
				cells[cells.length] = new Cell({
					record: records[i],
					td: rows.eq(i).children().eq(index),
					value: records[i].get(key)
				});
			}
			return new Column({
				cells: cells
			});
		},

		/**
		 * Returns the first html row element in the table
		 * @method getFirstTr
		 * @return NodeList
		 */
		getFirstTr: function () {
			return this.get(TBODY).children().eq(0);
		},
		
		/**
		 * Returns the next html row element base on the one passed as a parameter
		 * @method getNextTr
		 * @param {Record | HTMLTrElement | NodeList | Number} tr
		 * @return NodeList
		 */
		getNextTr: function (tr) {
			if (Record.hasInstance(tr)) {
				tr = tr.getId();
			}
			if (Lang.isNumber(tr)) {
				tr = this.get(TBODY).find(NUMERAL + this.get(RECORD_ID_PREFIX) + tr);
			}
			return tr.next();
		},
		
		/**
		 * Returns the first cell element in a row
		 * @method getFirstTd
		 * @param {Record | HTMLTrElement | NodeList | Number} row
		 * @return NodeList
		 */
		getFirstTd: function (row) {
			if (Record.hasInstance(row)) {
				row = row.getId();
			}
			if (Lang.isNumber(row)) {
				row = this.get(TBODY).find(NUMERAL + this.get(RECORD_ID_PREFIX) + row);
			}
			return row.children().eq(0);
		},
		
		/**
		 * Returns the next cell element in a row based on the one passed as a parameter
		 * @method getNextTd
		 * @param {Record | HTMLTrElement | NodeList | Number} td
		 * @return NodeList
		 */
		getNextTd: function (td) {
			if (Record.hasInstance(td)) {
				td = td.getId();
			}
			if (Lang.isNumber(td)) {
				td = this.get(TBODY).find(NUMERAL + this.get(RECORD_ID_PREFIX) + td).children(td - 1);
			}
			return td.next();
		},
		
		/*@TODO
		getSelectedCell: function () {
			
		},
		
		myself.getSelectedRow = function () {
			
		};
		
		getSelectedColumn = function () {
			
		},
		
		selectCell = function (cell) {
			
		},
		
		selectRow = function (row) {
			
		},
		
		selectColumn = function (col) {
			
		},
		
		unselectCell = function (cell) {
			
		},
		
		unselectRow = function (row) {
			
		},
		
		unselectColumn = function (col) {
			
		},
		
		unselectAll = function () {
			
		},*/
		
		/**
		 * Replace all rows when the DataSource updates
		 * @method onDataReturnReplaceRows
		 * @param {EventFacade} e
		 * @param {RecordSet} recordSet
		 */
		onDataReturnReplaceRows: function (e, newRecordSet) {
			this.get(TBODY).children().remove();
			this.addRows(newRecordSet);
			this.get(RECORDSET).replace(newRecordSet);
		},
		
		/**
		 * When the DataSource updates, treat the returned data as additions to the table's recordSet
		 * @method onDataReturnAddRows
		 * @param {EventFacade} e
		 * @param {RecordSet} newRecordSet
		 */
		onDataReturnAddRows: function (e, newRecordSet) {
			this.addRows(newRecordSet);
			this.get(RECORDSET).push(newRecordSet);
		}
		
	});
	
	$.ScrollingDataTable = Base.create('dt', DataTable, [], {
		
		EVENTS: {
			afterRender: function () {
				var boundingBox = this.get(BOUNDING_BOX);
				var table = $("<table/>").addClass(this.getClassName('content'));
				var tbody = this.get(TBODY);
				var thead = this.get(THEAD);
				var height = this.get('height');
				var container = $("<div/>").appendTo(boundingBox).css("overflowY", "auto");
				if (height) {
					container.height(height - thead.height());
				}
				table[0].setAttribute('cellspacing', '0');
				container.addClass(this.getClassName('table', 'body'));
				table.append(tbody.detach()).appendTo(container);
				
				this._syncColumnWidths();
				
				this._handlers.push($($.win).on('resize', this._syncColumnWidths, this));
			}
		}
		
	}, {
		
		_syncColumnWidths: function () {
			var ths = this.get(THEAD).first().children();
			if (!this._firstTr) {
				this._firstTr = this.getFirstTr();
			}
			this._firstTr.children().each(function (td, i) {
				$(td).width($(ths[i]).width());
			});
		}
		
	});
	
	$.add({
		DataTable: DataTable,
		Column: Column
	});
});