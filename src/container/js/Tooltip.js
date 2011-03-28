
/**
 * A simple tooltip implementation
 * @class Tooltip
 * @extends Widget
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Tooltip = Base.create('tooltip', Widget, [$.WidgetAlignment], {
	ATTRS: {
		align: {
			points: ['tl', 'bl']
		},
		/**
		 * @attribute fadeIn
		 * @description Whether to use a fade animation when appearing. Requires Anim module
		 * @default false
		 */
		fadeIn: {
			value: false,
			validator: function () {
				return !!$.Tween;
			}
		}
	},
	
	EVENTS: {
		render: function () {
			var srcNode = this.get('srcNode');
			var points = this.get('align').points;
			this.set('align', {
				node: srcNode,
				points: points
			});
			this.hide().set("bodyContent", this.get("bodyContent") || srcNode.attr("title"));
			srcNode.on("mouseover", this.show).on("mouseout", this.hide);
		},
		show: function () {
			var offset = this.get("srcNode").offset();
			var fadeIn = this.get("fadeIn");
			this.set("left", offset.left).set("top", offset.top + offset.height);
			if (fadeIn) {
				this.get(BOUNDING_BOX).css("opacity", 0).fadeIn(fadeIn);
			}
		}
	}
});