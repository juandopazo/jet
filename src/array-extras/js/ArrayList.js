
$.Array.forEach(['filter', 'every', 'some', 'lastIndexOf', 'reduce', 'reduceRight'], function (method) {
	
	$.ArrayList.prototype[method] = function () {
		return $.Array[method].apply(null, [this._items].concat(arguments));
	};
	
});
