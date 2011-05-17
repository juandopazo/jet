
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
	this.frame = new $.Frame({
		linkedcss: this.get('extraCss')
	});
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
		}
	},
	
	EVENTS: {
		
		afterRender: function () {
			var frame = this.frame;
			frame.on('contentReady', this._onFrameReady, this);
			frame.render(this.get('boundingBox'));
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
	
	_onFrameReady: function () {
		var self = this;
		var frame = this.frame;
		var inst = frame.getInstance();
		var contentDoc = inst.config.doc;
		var body = contentDoc.body;
		var contentBox = this.get('contentBox');
		var newContentBox;
		
		try {
			contentBox.appendTo(body);
		} catch (e) {
			newContentBox = contentDoc.importNode(contentBox.getDOMNode(), true);
			body.appendChild(newContentBox);
			this.set('contentBox', newContentBox);
			contentBox.remove();
		}
		
		A.each(this.get('extraScripts'), inst.Get.script, inst.Get);
		this.fire('ready');
	}
	 
};
