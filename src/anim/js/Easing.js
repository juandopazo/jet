
var Lang = $.Lang,
	Hash = $.Hash,
	Base = $.Base,
	A = $.Array;

var PLAYING = "playing",
	ENTER_FRAME = "enterFrame";
	
var pxToFloat = function (str) {
	return !Lang.isString(str) ? str :
		str.substr(-2, str.length) == "px" ? parseFloat(str.substr(0, str.length - 2)) : parseFloat(str);
};

var oneDBezier = function (points, t) {  
    var n = points.length;
    var tmp = [];

    for (var i = 0; i < n; ++i) {
        tmp[i] = points[i]; // save input
    }
    
    for (var j = 1; j < n; ++j) {
        for (i = 0; i < n - j; ++i) {
            tmp[i] = (1 - t) * tmp[i] + t * tmp[parseInt(i + 1, 10)];
        }
    }

    return tmp[0];

};

/**
 * Easing modes
 * @class Easing
 * @static
 */
var Easing = {
	/**
	 * @method linear
	 * @description Linear easing
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 */
	linear: function (x, y0, yf, dur) {
		return (yf - y0) * x / dur + y0;
	},
	/**
	 * @method easein
	 * @description An easing that's stronger at the beginning and softer at the end
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 * @param {Number} pw Easing strengh
	 */
	easein: function (x, y0, yf, dur, pw) {
		return yf - (yf - y0) * Math.pow((yf >= y0 ? -1 : 1) * (x / dur - 1), pw);
	},
	/**
	 * @method easeout
	 * @description An easing that's softer at the beginning and stronger at the end
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 * @param {Number} pw Easing strengh
	 */
	easeout: function (x, y0, yf, dur, pw) {
		return y0 + (yf - y0) * Math.pow(x / dur, pw);
	},
	/*bounce: function (x, y0, yf, dur, pw) {
		return oneDBezier([y0, yf + pw, yf], x / dur);
	},*/
	/**
	 * @method sling
	 * @description An easing that goes back before going forward
	 * @param {Number} x The time variable
	 * @param {Number} y0 The start value of the property that will be changed
	 * @param {Number} yf The final value of the property that will be changed
	 * @param {Number} dur Duration of the animation
	 * @param {Number} pw Easing strengh
	 */
	sling: function (x, y0, yf, dur, pw) {
		return oneDBezier([y0, y0 + (yf < y0 ? 1 : -1) * pw, yf], x / dur);
	}
};