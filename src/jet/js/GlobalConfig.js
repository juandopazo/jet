
var doc = document;
	
var NODE = 'node',
	BASE = 'base',
	CSS = 'css',
	IO = 'io',
	WIDGET_PARENTCHILD = 'widget-parentchild',
	SOLID = 'solid';

var GlobalConfig = {
	base: location.protocol + '//github.com/juandopazo/jet/raw/master/build/',
	modules: {
		ua: {},
		log: {},
		node: ['log', 'ua'],
		xsl: [NODE],
		swf: {},
		json: [NODE],
		cookie: [BASE],
		sizzle: [NODE],
		base: {
			requires: [NODE]
		},
		io: ['json'],
		'io-xdr': [NODE, 'swf', IO],
		history: [BASE, 'json'],
		'resize-styles': {
			type: CSS,
			beacon: {
				name: "borderLeftStyle",
				value: SOLID
			}
		},
		resize: [BASE, 'resize-styles'],
		'button-styles': {
			type: CSS,
			beacon: {
				name: "borderBottomStyle",
				value: SOLID
			}
		},
		button: [WIDGET_PARENTCHILD, 'button-styles'],
		'container-styles': {
			type: CSS,
			beacon: {
				name: "borderRightStyle",
				value: SOLID
			}
		},
		container: [BASE, 'widget-alignment', 'container-styles'],
		'progressbar-styles': {
			type: CSS,
			beacon: {
				name: "cursor",
				value: "pointer"
			}
		},
		progressbar: [BASE, 'progressbar-styles'],
		dragdrop: [BASE],
		imageloader: [BASE],
		anim: [BASE],
		datasource: [BASE],
		'datatable-styles': {
			type: CSS,
			beacon: {
				name: "borderTopStyle",
				value: SOLID
			}
		},
		datatable: ["datasource", 'datatable-styles'],
		'tabview-styles': {
			type: CSS,
			beacon: {
				name: "display",
				value: "none"
			}
		},
		tabview: [WIDGET_PARENTCHILD, 'tabview-styles'],
		treeview: [WIDGET_PARENTCHILD],
		'widget-alignment': [BASE],
		'widget-parentchild': [BASE],
		'widget-sandbox': [BASE],
		menu: [WIDGET_PARENTCHILD, 'container'],
		vector: ['anim']
	}
};