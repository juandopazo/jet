
var CELLS = 'cells',
	TD = 'td';

/**
 * Represents a column in a DataTable
 * @class Column
 * @extends Base
 * @constructor
 */
var Column = Base.create('column', Base, [], {
	
	ATTRS: {
		/**
		 * @config cells
		 * @description A list of cells
		 * @required true
		 * @writeOnce
		 */
		cells: {
			required: true,
			writeOnce: true
		}
	}
	
}, {
	
	/**
	 * @method getFirstTd
	 * @description Returns the first td element in this column
	 * @return HTMLElement 
	 */
	getFirstTd: function () {
		return this.get(CELLS)[0].get(TD);
	},
	
	/**
	 * @method getNextTd
	 * @description Returns the following td in this column, based on the one passed as a parameter
	 * @param {HTMLElement} td The previous td
	 * @return HTMLElement
	 */
	getNextTd: function (td) {
		var cells = this.get(CELLS), length = cells.length, i;
		for (i = 0; i < length; i++) {
			if (cells[i].get(TD) == td) {
				break;
			}
		}
		return i < length - 2 ? cells[++i].get(TD) : null; 
	},
	
	/**
	 * @method getFirstCell
	 * @description Gets the first Cell instance in this column
	 * @return Cell
	 */
	getFirstCell: function () {
		return this.get(CELLS)[0];
	},
	
	/**
	 * @method getNextCell
	 * @description Returns the following cell in this collumn base on the one passed as a parameter
	 * @param {Cell} td The previous cell
	 * @return Cell
	 */
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