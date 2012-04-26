/**
 * Provides an extension that sandboxes a widget by moving its contentBox into a frame
 * @module widget-sandbox
 * @requires base
 * 
 * Copyright (c) 2012, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('widget-sandbox', function ($) {
"use strict";

			
var A = $.Array,
	Hash = $.Hash;

var substitute = function (str, o) {
	Hash.each(o, function (prop, val) {
		str = str.replace(new RegExp('{' + prop + '}', 'g'), val);
	});
	return str;
};

/**
 * Creates a wrapper around an iframe. It loads the content either from a local
 * file or from script and creates a local YUI instance bound to that new window and document.
 * @class Frame
 * @extends Base
 * @constructor
 */

var Frame = $.Frame = $.Base.create('frame', $.Base, [], {
	
	/**
	* @static
	* @property DEFAULT_CSS
	* @description The default css used when creating the document.
	* @type String
	*/
	DEFAULT_CSS: 'body { margin: 0; padding: 0; border: none; }',
	/**
	* @static
	* @property HTML
	* @description The template string used to create the iframe
	* @type String
	*/
	HTML: '<iframe border="0" frameBorder="0" marginWidth="0" marginHeight="0" leftMargin="0" topMargin="0" width="100%" height="100%"></iframe>',
	/**
	* @static
	* @property PAGE_HTML
	* @description The template used to create the page when created dynamicall$.
	* @type String
	*/
	PAGE_HTML: '<html dir="{DIR}" lang="{LANG}"><head><title>{TITLE}</title>{META}{LINKED_CSS}<style id="editor_css">{DEFAULT_CSS}</style>{EXTRA_CSS}</head><body>{CONTENT}</body></html>',

	/**
	* @static
	* @method getDocType
	* @description Parses document.doctype and generates a DocType to match the parent page, if supported.
	* For IE8, it grabs document.all[0].nodeValue and uses that. For IE < 8, it falls back to Frame.DOC_TYPE.
	* @returns {String} The normalized DocType to apply to the iframe
	*/
	getDocType: function() {
		var dt = $.config.doc.doctype,
			str = Frame.DOC_TYPE;

		if (dt) {
			str = '<!DOCTYPE ' + dt.name + ((dt.publicId) ? ' ' + dt.publicId : '') + ((dt.systemId) ? ' ' + dt.systemId : '') + '>';
		} else {
			if ($.config.doc.all) {
				dt = $.config.doc.all[0];
				if (dt.nodeType) {
					if (dt.nodeType === 8) {
						if (dt.nodeValue) {
							if (dt.nodeValue.toLowerCase().indexOf('doctype') !== -1) {
								str = '<!' + dt.nodeValue + '>';
							}
						}
					}
				}
			}
		}
		return str;
	},
	/**
	* @static
	* @property DOC_TYPE
	* @description The DOCTYPE to prepend to the new document when created. Should match the one on the page being served.
	* @type String
	*/
	DOC_TYPE: '<!DOCTYPE HTML PUBLIC "-/'+'/W3C/'+'/DTD HTML 4.01/'+'/EN" "http:/'+'/www.w3.org/TR/html4/strict.dtd">',
	/**
	* @static
	* @property META
	* @description The meta-tag for Content-Type to add to the dynamic document
	* @type String
	*/
	//META: '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/><meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7">',
	META: '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>',
	/**
	* @static
	* @property NAME
	* @description The name of the class (frame)
	* @type String
	*/
	ATTRS: {
		/**
		* @attribute title
		* @description The title to give the blank page.
		* @type String
		*/
		title: {
			value: 'Blank Page'
		},
		/**
		* @attribute dir
		* @description The default text direction for this new frame. Default: ltr
		* @type String
		*/
		dir: {
			value: 'ltr'
		},
		/**
		* @attribute lang
		* @description The default language. Default: en-US
		* @type String
		*/
		lang: {
			value: 'en-US'
		},
		/**
		* @attribute src
		* @description The src of the iframe/window. Defaults to javascript:;
		* @type String
		*/
		src: {
			//Hackish, IE needs the false in the Javascript URL
			value: 'javascript' + (($.UA.ie) ? ':false' : ':') + ';'
		},
		/**
		* @attribute content
		* @description The string to inject into the body of the new frame/window.
		* @type String
		*/
		content: {
			value: '',
			setter: '_setHTML',
			getter: '_getHTML'
		},
		/**
		* @attribute use
		* @description Array of modules to include in the scoped YUI instance at render time. Default: ['none', 'selector-css2']
		* @writeonce
		* @type Array
		*/
		use: {
			writeOnce: true,
			value: ['node']
		},
		/**
		* @attribute container
		* @description The container to append the iFrame to on render.
		* @type String/HTMLElement/Node
		*/
		container: {
			value: 'body',
			setter: function(n) {
				return $(n).item(0);
			}
		},
		/**
		* @attribute node
		* @description The Node instance of the iframe.
		* @type Node
		*/
		node: {
			readOnly: true,
			value: null,
			getter: function() {
				return this._iframe;
			}
		},
		/**
		* @attribute id
		* @description Set the id of the new Node. (optional)
		* @type String
		* @writeonce
		*/
		id: {
			writeOnce: true,
			getter: function(id) {
				if (!id) {
					id = 'iframe-' + (++jet.Widget._uid);
				}
				return id;
			}
		},
		/**
		* @attribute linkedcss
		* @description An array of url's to external linked style sheets
		* @type String
		*/
		linkedcss: {
			value: '',
			getter: '_getLinkedCSS',
			setter: '_setLinkedCSS'
		},
		/**
		* @attribute extracss
		* @description A string of CSS to add to the Head of the Editor
		* @type String
		*/
		extracss: {
			value: '',
			setter: '_setExtraCSS'
		},
		/**
		* @private
		* @attribute rendered
		* @description Internal reference set when render is called.
		* @type Boolean
		*/
		rendered: {
			value: false
		}
	}
}, {
	/**
	* @private
	* @property _ready
	* @description Internal reference set when the content is read$.
	* @type Boolean
	*/
	_ready: null,
	/**
	* @private
	* @property _iframe
	* @description Internal Node reference to the iFrame or the window
	* @type Node
	*/
	_iframe: null,
	/**
	* @private
	* @property _instance
	* @description Internal reference to the YUI instance bound to the iFrame or window
	* @type YUI
	*/
	_instance: null,
	/**
	* @private
	* @method _create
	* @description Create the iframe or Window and get references to the Document & Window
	* @return {Object} Hash table containing references to the new Document & Window
	*/
	_create: function(cb) {
		var win, doc, res, node;
		
		this._iframe = $('<div/>').html(Frame.HTML).first();
		this._iframe.css('visibility', 'hidden');
		this._iframe.attr('src', this.get('src'));
		this.get('container').append(this._iframe);

		this._iframe.css('height', '100%');

		
		var html = '',
			extra_css = ((this.get('extracss')) ? '<style id="extra_css">' + this.get('extracss') + '</style>' : '');

		html = substitute(Frame.PAGE_HTML, {
			DIR: this.get('dir'),
			LANG: this.get('lang'),
			TITLE: this.get('title'),
			META: Frame.META,
			LINKED_CSS: this.get('linkedcss'),
			CONTENT: this.get('content'),
			DEFAULT_CSS: Frame.DEFAULT_CSS,
			EXTRA_CSS: extra_css
		});
		if ($.config.doc.compatMode != 'BackCompat') {
			
			//html = Frame.DOC_TYPE + "\n" + html;
			html = Frame.getDocType() + "\n" + html;
		}

		res = this._resolveWinDoc();
		res.doc.open();
		res.doc.write(html);
		res.doc.close();

		if (!res.doc.documentElement) {
			var timer = setInterval(function () {
				if (res.doc && res.doc.documentElement) {
					cb(res);
					clearInterval(timer);
				}
			}, 1);
		} else {
			cb(res);
		}

	},
	/**
	* @private
	* @method _resolveWinDoc
	* @description Resolves the document and window from an iframe or window instance
	* @param {Object} c The YUI Config to add the window and document to
	* @return {Object} Object hash of window and document references, if a YUI config was passed, it is returned.
	*/
	_resolveWinDoc: function(c) {
		var config = (c) ? c : {};
		config.win = this._iframe.getDOMNode().contentWindow;
		config.doc = this._iframe.getDOMNode().contentWindow.document;
		if (!config.doc) {
			config.doc = $.config.doc;
		}
		if (!config.win) {
			config.win = $.config.win;
		}
		return config;
	},
	initializer: function() {
		
	},
	destructor: function() {
		var inst = this.getInstance();

		inst(inst.config.doc).off();
		inst = null;
		this._iframe.remove(true);
	},
	/**
	* @private
	* @method _onContentReady
	* @description Called once the content is available in the frame/window and calls the final use call
	* on the internal instance so that the modules are loaded properl$.
	*/
	_onContentReady: function(e) {
		if (!this._ready) {
			this._ready = true;
			this._iframe.css('visibility', '');
			var inst = this.getInstance();
			
			/**
			 * @event contentReady
			 * @description Fires when the content is ready to use
			 */
			this.fire('contentReady');

			/*if (e) {
				inst.config.doc = e.target.getDOMNode() || e.target;
			}*/
			//TODO Circle around and deal with CSS loading...
			/*args.push($.bind(function() {
				this.fire('ready');
			}, this));*/
			//inst.use.apply(inst, args);

			inst(inst.config.doc.documentElement).addClass('jet-js-enabled');
		}
	},
	/**
	* @private
	* @method _getHTML
	* @description Get the content from the iframe
	* @param {String} html The raw HTML from the body of the iframe.
	* @return {String}
	*/
	_getHTML: function(html) {
		if (this._ready) {
			var inst = this.getInstance();
			html = inst('body').html();
		}
		return html;
	},
	/**
	* @private
	* @method _setHTML
	* @description Set the content of the iframe
	* @param {String} html The raw HTML to set the body of the iframe to.
	* @return {String}
	*/
	_setHTML: function(html) {
		if (this._ready) {
			var inst = this.getInstance();
			inst('body').html(html);
		} else {
			//This needs to be wrapped in a contentReady callback for the !_ready state
			this.on('contentReady', $.bind(function(html, e) {
				var inst = this.getInstance();
				inst('body').html(html);
			}, this, html));
		}
		return html;
	},
	/**
	* @private
	* @method _setLinkedCSS
	* @description Set's the linked CSS on the instance..
	*/
	_getLinkedCSS: function(urls) {
		if (!$.Lang.isArray(urls)) {
			urls = [urls];
		}
		var str = '';
		if (!this._ready) {
			A.each(urls, function(v) {
				if (v !== '') {
					str += '<link rel="stylesheet" href="' + v + '" type="text/css">';
				}
			});
		} else {
			str = urls;
		}
		return str;
	},
	/**
	* @private
	* @method _setLinkedCSS
	* @description Set's the linked CSS on the instance..
	*/
	_setLinkedCSS: function(css) {
		if (this._ready) {
			var inst = this.getInstance();
			inst.Get.css(css);
		}
		return css;
	},
	/**
	* @private
	* @method _setExtraCSS
	* @description Set's the extra CSS on the instance..
	*/
	_setExtraCSS: function(css) {
		if (this._ready) {
			var inst = this.getInstance(),
				node = inst.get('#extra_css');
			
			node.remove();
			inst.one('head').append($('<style/>').attr('id', 'extra_css').html(css));
		}
		return css;
	},
	/**
	* @private
	* @method _instanceLoaded
	* @description Called from the first YUI instance that sets up the internal instance.
	* This loads the content into the window/frame and attaches the contentReady event.
	* @param {jet} inst The internal YUI instance bound to the frame/window
	*/
	_instanceLoaded: function(inst) {
		this._instance = inst;
		this._onContentReady();
	},
	/**
	* @method getInstance
	* @description Get a reference to the internal YUI instance.
	* @return {jet} The internal YUI instance
	*/
	getInstance: function() {
		return this._instance;
	},
	/**
	* @method render
	* @description Render the iframe into the container config option or open the window.
	* @param {String/HTMLElement/Node} node The node to render to
	* @return {$.Frame}
	* @chainable
	*/
	render: function(node) {
		if (this.get('rendered')) {
			return this;
		}
		this.set('rendered', true);
		if (node) {
			this.set('container', node);
		}

		this._create($.bind(function(res) {

			res.win.jet = jet;

			var inst, timer,
			
				cb = $.bind(function(i) {
					i.config.win.jet_Config = $.mix({}, $.config);
					i.config.win.jet = jet;
					this._instanceLoaded(i);
				}, this),
				
				args = [],
				config = $.mix($.config, {
					win: res.win,
					doc: res.doc
				}, true, true),
				
				fn = $.bind(function() {
					config = this._resolveWinDoc(config);
					inst = jet(config);
					var req = this.get('use');
					req.push(cb);

					try {
						inst.use.apply(inst, req);
						if (timer) {
							clearInterval(timer);
						}
					} catch (e) {
						timer = setInterval(function() {
							fn();
						}, 350);
					}
				}, this);

			args.push(fn);

			$.use.apply($, args);

		}, this));

		return this;
	}
});
var FRAME = 'frame',
	CONTENT_WINDOW = 'contentWindow',
	CONTENT_DOCUMENT = 'contentDocument',
	A = $.Array;

/**
 * An extension that sandboxes a widget by putting its contentBox inside an iframe
 * @class Sandbox
 * @constructor
 */
function WidgetSandbox() {
	var frame = this.frame = new $.Frame({
		linkedcss: this.get('extraCss'),
		use: this.get('use'),
		on: {
			contentReady: $.bind(this._onFrameReady, this)
		}
	});
	this.after('render', this._renderFrame);
}

$.WidgetSandbox = $.mix(WidgetSandbox, {
	
	ATTRS: {
		extraScripts: {
			writeOnce: true,
			value: []
		},
		
		extraCss: {
			writeOnce: true,
			value: []
		},
		use: {
			value: []
		}
	}
	
});

WidgetSandbox.prototype = {
	
	/**
	 * @method getInstance
	 * @description Returns the jet instance inside the frame
	 */
	getInstance: function () {
		return this.frame.getInstance();
	},
	
	_renderFrame: function () {
		this.frame.render(this.get('boundingBox'));
	},
	
	_onFrameReady: function () {
		var self = this;
		var frame = this.frame;
		var inst = frame.getInstance();
		var contentDoc = inst.config.doc;
		var body = contentDoc.body;
		var contentBox = this.get('contentBox');
		var newContentBox;
		
		if (contentDoc.importNode) {
			newContentBox = contentDoc.importNode(contentBox.getDOMNode(), true);
		} else {
			// @TODO use a document fragment instead of a div
			newContentBox = contentDoc.createElement(this.get('boundingBox').attr('nodeName'));
			newContentBox.innerHTML = contentBox.attr('outerHTML');
			newContentBox = newContentBox.firstChild;
		}
		body.appendChild(newContentBox);
		$.wait(4, this, function () {
			A.each(this.get('extraScripts'), inst.Get.script, inst.Get);
			this.fire('ready');
		});
		this.set('contentBox', newContentBox);
		contentBox.remove();
	}
	 
};

			
});
