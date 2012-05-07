
$.PasswordField = $.Base.create('password', $.FormField, [], {}, {
	initializer: function () {
		this.get('contentBox').attr('type', 'password');
	}
});
