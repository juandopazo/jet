
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
			value: {
				points: ['tl', 'bl']
			}
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
	}
}, {
	
	_uiShowTooltip: function () {
		var offset = this.get("srcNode").offset();
		var fadeIn = this.get("fadeIn");
		this.set("left", offset.left).set("top", offset.top + offset.height);
		if (fadeIn) {
			this.get(BOUNDING_BOX).css("opacity", 0).fadeIn(fadeIn);
		}
	},
	
	renderUI: function () {
		this.set('align', {
			node: this.get('srcNode'),
			points: this.get('align').points
		});
	},
	
	bindUI: function () {
		var srcNode = this.get('srcNode');
		this.after('show', this._uiShowTooltip);
		this._handlers.push(srcNode.on('mouseover', this.show, this), srcNode.on('mouseout', this.hide, this));
	},
	
	syncUI: function () {
		this.hide().set('bodyContent', this.get('bodyContent') || this.get('srcNode').attr('title'));
	}
	
});