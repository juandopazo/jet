
var doc = document;
	
var CSS = 'css',
	IO = 'io',
	WIDGET_PARENTCHILD = 'widget-parentchild',
	SOLID = 'solid';

var GlobalConfig = {
	base: location.protocol + '//github.com/juandopazo/jet/raw/master/build/',
	combine: true,
	root: location.protocol + '//jetjs.herokuapp.com/combo?',
	modules: {},
	groups: {
		jet: {
			modules: {
				log: {},
				oop: {},
				node: {},
				xsl: ['node'],
				swf: ['base'],
				json: ['node'],
				cookie: ['base'],
				sizzle: ['node'],
				base: ['node'],
				io: ['json', 'deferred'],
				deferred: {},
				'io-xdr': ['node', 'swf', IO],
				history: ['base', 'json'],
				'resize-styles': {
					type: CSS,
					beacon: {
						name: "borderLeftStyle",
						value: SOLID
					}
				},
				resize: ['base', 'resize-styles'],
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
				container: ['base', 'widget-alignment', 'widget-stack', 'container-styles'],
				'progressbar-styles': {
					type: CSS,
					beacon: {
						name: "cursor",
						value: "pointer"
					}
				},
				progressbar: ['base', 'progressbar-styles'],
				dragdrop: ['base'],
				imageloader: ['base'],
				anim: ['base'],
				datasource: ['base'],
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
				'widget-alignment': ['base'],
				'widget-stack': ['base'],
				'widget-parentchild': ['base'],
				'widget-sandbox': ['base'],
				menu: [WIDGET_PARENTCHILD, 'container'],
				vector: ['anim'],
				layout: ['resize', WIDGET_PARENTCHILD],
				transition: ['node','anim','deferred'],
				selector: ['node'],
				form: ['base'],
				'array-extras': {},
				escape: {}
			}
		}
	}
};