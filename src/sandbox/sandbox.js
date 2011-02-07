jet().add('sandbox', function ($) {

	var FRAME = 'frame',
		CONTENT_WINDOW = 'contentWindow',
		CONTENT_DOCUMENT = 'contentDocument';
	
	$.Sandbox = $.mix(function Sandbox() {}, {
		
		EVENTS: {
			
			render: function () {
				this.get(FRAME).addClass(this.getClassNAme(FRAME));
			},
			
			afterRender: function () {
				this.get('contentBox').appendTo(this.get(CONTENT_DOCUMENT).body);
			}
			
		},
		
		ATTRS: {
			frame: {
				value: $('<iframe/>').attr({
					src: 'javascript:false',
					frameborder: 0
				}),
				readOnly: true
			},
			contentWindow: {
				readOnly: true,
				getter: function () {
					return this.get(FRAME).attr(CONTENT_WINDOW);
				}
			},
			contentDocument: {
				readOnly: true,
				getter: function () {
					return this.get(CONTENT_WINDOW).document;
				}
			}
		}
		
	});
	
});