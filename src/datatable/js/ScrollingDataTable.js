
$.ScrollingDataTable = Base.create('dt', DataTable, [], {
	
	ATTRS: {
		tbodyContainer: {
			value: '<div/>',
			setter: $
		},
		
		/**
		 * @config autoScroll
		 * @description Scroll the datatable automatically to the bottom when the rows change and the scroll was already at the bottom
		 * @default false
		 */
		autoScroll: {
			value: false
		},
		
		autoScrollStatus: {
			value: false
		}
	},
	
	EVENTS: {
		afterRender: function () {
			var boundingBox = this.get(BOUNDING_BOX);
			var table = $("<table/>").addClass(this.getClassName('content'));
			var tbody = this.get(TBODY);
			var thead = this.get(THEAD);
			var height = this.get('height');
			var container = this.get('tbodyContainer').appendTo(boundingBox).css("overflowY", "auto");
			if (height) {
				container.height(height - thead.height());
			}
			table._nodes[0].setAttribute('cellspacing', '0');
			container.addClass(this.getClassName('table', 'body'));
			table.append(tbody.detach()).appendTo(container);
			
			this._syncColumnWidths();
			this.on('afterAddRow', this._syncColumnWidths, this);
			this.on('afterAddRows', this._syncColumnWidths, this);
			this._handlers.push($($.win).on('resize', this._syncColumnWidths, this));
		},
		
		addRow: '_autoScrollBefore',
		afterAddRow: '_autoScrollAfter',
		addRows: '_autoScrollBefore',
		afterAddRows: '_autoScrollAfter'
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
			$(td).width(ths.eq(i).width());
		});
	}
	
});

$.add({
	DataTable: DataTable,
	Column: Column
});