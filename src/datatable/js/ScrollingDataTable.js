
$.ScrollingDataTable = Base.create('dt', DataTable, [], {
	
	ATTRS: {
		tbodyContainer: {
			value: '<div/>',
			setter: $
		},
		
		/**
		 * @attribute autoScroll
		 * @description Scroll the datatable automatically to the bottom when the rows change and the scroll was already at the bottom
		 * @default false
		 */
		autoScroll: {
			value: false
		},
		
		autoScrollStatus: {
			value: false
		}
	}
	
}, {
	
	initializer: function () {
		this.set('tbodyContainer', this.get('tbodyContainer'));
	},
	
	_autoScrollBefore: function () {
		var tbodyContainer = this.get('tbodyContainer');
		this.set('autoScrollStatus', (tbodyContainer._nodes[0].scrollTop + tbodyContainer.height() == tbodyContainer._nodes[0].scrollHeight));
	},
	
	_autoScrollAfter: function () {
		var tbodyContainer = this.get('tbodyContainer');
		if (this.get('autoScroll') && this.get('autoScrollStatus')) {
			tbodyContainer._nodes[0].scrollTop = tbodyContainer._nodes[0].scrollHeight;
		}
	},
	
	_syncColumnWidths: function () {
		var ths = this.get(THEAD).first().children();
		if (!this._firstTr || !this._firstTr._nodes[0] || !this._firstTr._nodes[0].parentNode) {
			this._firstTr = this.getFirstTr();
		}
		this._firstTr.children().each(function (td, i) {
			$(td).width(ths.item(i).width());
		});
	},
	
	_sdtAfterRender: function () {
		var height = this.get('height');
		var container = this.get('tbodyContainer');
		if (height) {
			container.height(height - this.get(THEAD).height());
		}
		this._contentTable.append(this.get(TBODY).remove()).appendTo(container);
		this._syncColumnWidths();
	},
	
	renderUI: function (boundingBox) {
		var table = this._contentTable = $("<table/>").addClass(this.getClassName('content'));
		table._nodes[0].setAttribute('cellspacing', '0');
		this.get('tbodyContainer').addClass(this.getClassName('table', 'body')).appendTo(boundingBox).css("overflowY", "auto");
		
		this.after('render', this._sdtAfterRender);
	},
	
	bindUI: function () {
		this.after('addRow', this._syncColumnWidths);
		this.after('addRows', this._syncColumnWidths);
		this.on('addRow', this._autoScrollBefore);
		this.after('addRow', this._autoScrollAfter);
		this.on('addRows', this._autoScrollBefore);
		this.after('addRows', this._autoScrollAfter);

		this._handlers.push($($.config.win).on('resize', this._syncColumnWidths, this));
	}
	
});

$.add({
	DataTable: DataTable,
	Column: Column
});