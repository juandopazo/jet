
var Hash = $.Hash,
	A = $.Array,
	Base = $.Base,
	Widget = $.Widget,
	Record = $.Record,
	RecordSet = $.RecordSet;	
	
/**
 * A cell in a DataTable
 * @class Cell
 * @constructor
 * @extends Base
 */
var Cell = Base.create('cell', Base, [], {
	ATTRS: {
		/**
		 * @config value
		 * @description The cell's value
		 * @required
		 * @writeOnce
		 */
		value: {
			required: true,
			writeOnce: true
		},
		/**
		 * @config td
		 * @description The cell's td
		 * @required
		 * @writeOnce
		 */
		td: {
			required: true,
			writeOnce: true
		},
		/**
		 * @config record
		 * @description The cell's record
		 * @required
		 * @writeOnce
		 */
		record: {
			required: true,
			writeOnce: true
		}
	}
});