
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