jet().add('sandbox', function ($) {

	var FRAME = 'frame',
		CONTENT_WINDOW = 'contentWindow',
		CONTENT_DOCUMENT = 'contentDocument';
	
	/**
	 * An extension that sandboxes a widget by putting its contentBox inside an iframe
	 * @class Sandbox
	 * @constructor
	 */
	$.Sandbox = $.mix(function Sandbox() {}, {
		
		EVENTS: {
			
			render: function () {
				this.get(FRAME).addClass(this.getClassNAme(FRAME)).attr({
					src: 'javascript:false',
					frameborder: 0
				}).prependTo(this.get('boundingBox'));
			},
			
			afterRender: function () {
				this.get('contentBox').appendTo(this.get(CONTENT_DOCUMENT).body);
			}
			
		},
		
		ATTRS: {
			/**
			 * @config frame
			 * @description Pointer to the iframe node
			 * @readOnly
			 */
			frame: {
				value: '<iframe/>',
				getter: $,
				writeOnce: true
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
					return this.get(CONTENT_WINDOW).document;
				}
			}
		}
		
	});
	
});