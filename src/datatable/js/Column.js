
var CELLS = 'cells',
	TD = 'td';

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