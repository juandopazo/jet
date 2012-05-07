
$.TextField = $.Base.create('textfield', $.FormField, [], {}, {
	initializer: function () {
		this.get('contentBox').attr('type', 'text');
	}
});
