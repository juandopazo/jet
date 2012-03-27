
$.PasswordField = $.Base.create('password', $.FormField, [], {}, {
	renderUI: function () {
		this.get('contentBox').attr('type', 'password');
	}
});
