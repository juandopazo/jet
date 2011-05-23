
var DOCUMENT_ELEMENT = "documentElement";
var GET_COMPUTED_STYLE = "getComputedStyle";
var CURRENT_STYLE = "currentStyle";

/**
 * Bla
 * @class DOM
 * @static
 */
var DOM = $.DOM = {
	/**
	 * Returns the window object to which the current document belongs
	 * @method getWindowFromDocument
	 * @param {Document} document
	 */
	getWindowFromDocument: function (doc) {
		doc = doc || $.context;
		return doc.defaultView || doc.parentWindow || $.win;
	},
	/**
	 * Gets the scrolling width or makes the browser scroll
	 * @method scrollLeft
	 * @param {Number} value
	 * @chainable
	 */
	scrollLeft: function (value) {
		if (Lang.isValue(value)) {
			$.win.scrollTo(value, this.scrollTop());
		} else {
			var doc = $.context;
			var dv = doc.defaultView;
	        return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, (dv) ? dv.pageXOffset : 0);
		}
		return this;
	},
	/**
	 * Gets the scrolling height or makes the browser scroll
	 * @method scrollTop
	 * @param {Number} value
	 * @chainable
	 */
	scrollTop: function (value) {
		if (Lang.isValue(value)) {
			$.win.scrollTo(this.scrollTop(), value);
		} else {
			var doc = $.context;
			var dv = doc.defaultView;
	        return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, (dv) ? dv.pageYOffset : 0);
		}
		return this;
	},
	/**
	 * Returns the inner size of the screen
	 * @method screenSize
	 */
	screenSize: function (win) {
		var doc = win ? win.document : $.config.doc,
			de = doc.documentElement,
			db = doc.body;
		return {
			height: de.clientHeight || $.win.innerHeight || db.clientHeight,
			width: de.clientWidth || $.win.innerWidth || db.clientWidth
		};
	},
	/**
	 * Returns the complete size of the page
	 * @method pageSize
	 */
	pageSize: function (win) {
		win = win || $.win;
		var doc = win.document,
			compatMode = doc.compatMode != "CSS1Compat",
			innerWidth = win.innerWidth,
			innerHeight = win.innerHeight,
			root = compatMode ? doc.body : doc.documentElement;
		if (doc.compatMode && !$.UA.opera) {
			innerWidth = root.clientWidth;
			innerHeight = root.clientHeight;
		}
		return {
			width: Math.max(root.scrollWidth, innerWidth),
			height: Math.max(root.scrollHeight, innerHeight)
		};
	}
};