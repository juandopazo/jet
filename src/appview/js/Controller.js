
	var Lang = $.Lang,
		Hash = $.Hash,
		Base = $.Base;
		
	var BOUNDING_BOX = 'boundingBox',
		CLASS_PREFIX = 'classPrefix';
	
	var parseUrl = function (url) {
		url = url.split('/');
		return {
			name: url[1],
			method: url[2],
			args: url.slice(3)
		};
	};

	if (!jet.controllers) {
		jet.controllers = {};

		// TEMPORARY. Use HTML5 History instead
		$($.win).on('hashchange', function () {
			var action = parseUrl($.win.location.hash);
			var controller = jet.controllers[action.name]; 
			if (controller && controller[action.method]) {
				controller[action.method].apply(controller, action.args);
			}
		});
	}
	
	$.Controller = Base.create('controller', Base, [], {
		
		ATTRS: {
			name: {
				required: true,
				validator: Lang.isString
			},
			methods: {
				value: {}
			}
		}
		
	}, {
		
		initializer: function () {
			var name = this.get('name');
			var action = parseUrl($.win.location.hash);
			Hash.each(this.get('methods'), function (name, fn) {
				myself[name] = fn;
			});
			jet.controllers[name] = this;
			if (action.name == name && myself[action.method]) {
				myself[action.method].apply(myself, action.args);
			}
		}
		
	});	
	
