
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
	this.set(FRAME, new $.Frame({
		linkedcss: this.get('extraCss')
	}));
}

$.WidgetSandbox = $.mix(WidgetSandbox, {
	
	ATTRS: {
		/**
		 * @config frame
		 * @description Pointer to the iframe node
		 * @readOnly
		 */
		frame: {
			value: null
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
			writeOnce: true,
			value: []
		},
		
		extraCss: {
			writeOnce: true,
			value: []
		}
	},
	
	EVENTS: {
		
		render: function () {
			var frame = this.get(FRAME);
			frame.on('contentready', this._onFrameReady, this);
			frame.render(this.get('boundingBox'));
		}
		
	}
	
});

WidgetSandbox.prototype = {
	_onFrameReady: function () {
		var self = this;
		var frame = this.get(FRAME);
		var inst = frame.getInstance();
		var contentDoc = inst.config.doc;
		var body = contentDoc.body;
		var contentBox = this.get('contentBox');
		var newContentBox;
		
		try {
			contentBox.appendTo(body);
		} catch (e) {
			newContentBox = contentDoc.importNode(contentBox[0], true);
			body.appendChild(newContentBox);
			this.set('contentBox', newContentBox);
			contentBox.remove();
		}
		
		A.each(this.get('extraScripts'), inst.Get.script, inst.Get);
		this.fire('ready');
	} 
};
