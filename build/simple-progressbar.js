jet().add('simple-progressbar', function ($) {
	
	var CLASS_PREFIX = "jet-spbar-",
		NEW_SPAN = "<span/>";
	
	$.SimpleProgressBar = function (config) {
		config = config || {};
		config.width = config.width || 200;
		config.height = config.height || 20;
		
		var boundingBox = $("<div/>");
		var container = $(NEW_SPAN).addClass(CLASS_PREFIX + "container").height(config.height).width(config.width).appendTo(boundingBox);
		var bar = $(NEW_SPAN).addClass(CLASS_PREFIX + "bar").height(config.height).appendTo(container);
		var text;
		if (config.text) {
			 text = $(NEW_SPAN).addClass(CLASS_PREFIX + "text").html("0%").height(config.height).css("line-height", config.height).appendTo(container);
		}
		
		this.update = function (progress) {
			progress = Math.round(progress * 100) + "%";
			bar.width(progress);
			if (text) {
				text.html(progress);
			}
		};
		this.render = function (target) {
			boundingBox.appendTo(target);
		};
	};
	
});