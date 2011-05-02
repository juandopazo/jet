
/**
 * Basic class for all utilities
 * @class Utility
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.Utility = $.Base.create('utility', $.Base, [], {
	
	CSS_PREFIX: 'jet',
	
	ATTRS: {
		/**
		 * @attribute cssPrefix
		 * @default Utility.CSS_PREFIX
		 * @writeOnce
		 */
		cssPrefix: {
			getter: function (val) {
				return val || $.Utility.CSS_PREFIX;
			},
			writeOnce: true
		}
	}
	
}, {
	getClassName: function () {
		return [this.get(CLASS_PREFIX), this.constructor.NAME].concat(SLICE.call(arguments)).join(DASH);
	}
});