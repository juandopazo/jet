jet().add('imageloader', function ($) {
	
	var Lang = $.Lang,
		ArrayHelper = $.Array;
	
	var TRUE = true,
		FALSE = false;
		
	var LOAD = "load",
		ERROR = "error",
		TIMEOUT = "timeout",
		COMPLETE = "complete",
		IMAGE_ = "image:";
	
	var Img = function () {
		Img.superclass.constructor.apply(this, arguments);
		var img = new Image();
		var node = $(img);
		var myself = this.addAttrs({
			src: {
				required: TRUE,
				writeOnce: TRUE,
				validator: Lang.isString
			},
			image: {
				readOnly: TRUE,
				value: img
			},
			node: {
				value: node
			},
			timeout: {
				value: 5000
			}
		});
		var loaded = FALSE;
		myself.addAttrs({
			type: {
				value: "",
				validator: Lang.isString,
				getter: function (name, value) {
					return value.toLowerCase();
				}
			},
			loaded: {
				readOnly: TRUE,
				getter: function () {
					return !!loaded;
				}
			}
		}).load = function () {
			var completed = FALSE;
			img.onload = function () {
				if (myself.get("type") == "png" && $.UA.ie) {
					myself.set("node", $("<span/>").css({
						display: "inline-block",
						filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + myself.get("src") + "',sizingMethod='crop');"
					}).height(img.height).width(img.width));
				}
				myself.fire(LOAD);
				myself.fire(COMPLETE);
				completed = TRUE;
				loaded = TRUE;
			};
			img.onerror = function () {
				myself.fire(ERROR);
				myself.fire(COMPLETE);
				completed = TRUE;
			};
			setTimeout(function () {
				if (!completed) {
					myself.fire(TIMEOUT);
					myself.fire(COMPLETE);
				}
			}, myself.get(TIMEOUT));
			img.src = myself.get("src");
			return myself;
		};
	};
	$.extend(Img, $.Base, {
		setAsBackground: function (node) {
			node = $(node);
			var myself = this;
			var setBg = function () {
				var src = myself.get("src");
				if (myself.get("type") == "png" && $.UA.ie) {
					node.css("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + src + "',sizingMethod='crop');");
				} else {
					node.css("backgroundImage", "url(" + src + ")");
				}
			};
			if (myself.get("loaded")) {
				setBg();
			} else {
				myself.on(LOAD, setBg);
			}
			return myself;
		}
	});
	
	var ImageLoader = function () {
		ImageLoader.superclass.constructor.apply(this, arguments);
		
		var myself = this.addAttrs({
			srcs: {
				validator: Lang.isArray
			}
		});
		
		var completed = 0;
		
		myself.load = function () {
			var srcs = myself.get("srcs");
			var length = srcs.length;
			ArrayHelper.each(srcs, function (src) {
				var img = new Img({
					src: src,
					on: {
						load: function () {
							myself.fire(IMAGE_ + LOAD, img);
						},
						error: function () {
							myself.fire(IMAGE_ + ERROR, img);
						},
						timeout: function () {
							myself.fire(IMAGE_ + TIMEOUT, img);
						},
						complete: function () {
							myself.fire(IMAGE_ + COMPLETE, img);
							completed++;
							myself.fire("progress", Math.round(completed * 100 / length), img);
							if (completed == length) {
								myself.fire(COMPLETE);
							}
						}
					}
				});
				img.load();
			});
		};
		
	};
	$.extend(ImageLoader, $.Base);
	
	$.add({
		Image: Img,
		ImageLoader: ImageLoader
	});
});