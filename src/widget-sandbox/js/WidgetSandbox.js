
var FRAME = 'frame',
	CONTENT_WINDOW = 'contentWindow',
	CONTENT_DOCUMENT = 'contentDocument',
	A = $.Array;

/**
 * An extension that sandboxes a widget by putting its contentBox inside an iframe
 * @class Sandbox
 * @constructor
 */
$.WidgetSandbox = $.mix(function WidgetSandbox() {
	this.set(FRAME, this.get(FRAME));
}, {
	
	ATTRS: {
		/**
		 * @config frame
		 * @description Pointer to the iframe node
		 * @readOnly
		 */
		frame: {
			value: '<iframe/>',
			setter: $
		},
		/**
		 * @config contentWindow
		 * @description Pointer to the window inside the iframe
		 * @readOnly
		 */
		contentWindow: {
			readOnly: true,
			getter: function () {
				return this.get(FRAME).attr(CONTENT_WINDOW);
			}
		},
		/**
		 * @config contentDocument
		 * @description Pointer to the document inside the iframe
		 * @readOnly
		 */
		contentDocument: {
			readOnly: true,
			getter: function () {
				var frame = this.get(FRAME)[0];
				return frame.contentDocument || frame.contentWindow.document || frame.document;
			}
		},
		
		src: {
			value:  'javascript' + (($.UA.ie) ? ':false' : ':') + ';'
		},
		
		extraScripts: {
			value: []
		},
		
		extraCss: {
			value: []
		}
	},
	
	EVENTS: {
		
		render: function () {
			this.get(FRAME).attr({
				frameborder: 0,
				src: this.get('src'),
				width: '100%',
				height: '100%'
			}).css('border', 'none').addClass(this.getClassName(FRAME)).prependTo(this.get('boundingBox'));
		},
		
		afterRender: function () {
			var self = this;
			var contentWindow = this.get(CONTENT_WINDOW);
			var contentDoc = this.get(CONTENT_DOCUMENT);
			var contentBox = this.get('contentBox');
			var body = contentDoc.body;
			var newContentBox;
			var onCssLoad = function (node) {
				self.fire('cssLoad', node);
			};
			
			contentWindow.jet = jet;
			
			try {
				contentBox.appendTo(body);
			} catch (e) {
				newContentBox = contentDoc.importNode(contentBox[0], true);
				body.appendChild(newContentBox);
				this.set('contentBox', newContentBox);
				contentBox.remove();
			}
			
			jet({
				win: contentWindow,
				doc: contentDoc
			}).use(function (j) {
				A.each(self.get('extraCss'), function (url) {
					j.Get.css(url, onCssLoad);
				}, j.Get);
				A.each(self.get('extraScripts'), j.Get.script, j.Get);
				self.fire('ready');
			});
		}
		
	}
	
});