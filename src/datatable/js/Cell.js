
var Hash = $.Hash,
	A = $.Array,
	Base = $.Base,
	Widget = $.Widget,
	Record = $.Record,
	RecordSet = $.RecordSet;	
	
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