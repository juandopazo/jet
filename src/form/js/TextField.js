
$.TextField = $.Base.create('textfield', $.FormField, [], {}, {
	renderUI: function () {
		this.get('contentBox').attr('type', 'text');
	}
});
