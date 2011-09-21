
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
			newContentBox = contentDoc.createElement('div');
			newContentBox.innerHTML = contentBox.attr('outerHTML');
		}
		body.appendChild(newContentBox.firstChild);
		$.later(4, this, function () {
			A.each(this.get('extraScripts'), inst.Get.script, inst.Get);
			this.fire('ready');
		});
		this.set('contentBox', newContentBox);
		contentBox.remove();
	}
	 
};
