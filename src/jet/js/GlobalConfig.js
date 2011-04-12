
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
		log: {},
		oop: {},
		node: ['log', 'oop'],
		xsl: [NODE],
		swf: {},
		json: [NODE],
		cookie: [BASE],
		sizzle: [NODE],
		base: [NODE],
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
		container: [BASE, 'widget-alignment', 'widget-stack', 'container-styles'],
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
		datatable: ['io', "datasource", 'datatable-styles'],
		'tabview-styles': {
			type: CSS,
			beacon: {
				name: "display",
				value: "none"
			}
		},
		'treeview-styles': {
			type: CSS,
			beacon: {
				name: 'visibility',
				value: 'hidden'
			}
		},
		tabview: [WIDGET_PARENTCHILD, 'tabview-styles'],
		treeview: [WIDGET_PARENTCHILD, 'treeview-styles'],
		'widget-alignment': [BASE],
		'widget-stack': [BASE],
		'widget-parentchild': [BASE],
		'widget-sandbox': [BASE],
		menu: [WIDGET_PARENTCHILD, 'container'],
		vector: ['anim'],
		layout: ['resize', WIDGET_PARENTCHILD]
	}
};