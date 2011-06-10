
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
