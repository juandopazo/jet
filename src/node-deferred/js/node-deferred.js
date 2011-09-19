
var OldNodeList = $.NodeList;

function NodeList() {
	OldNodeList.apply(this, arguments);
	$.Promise.call(this);
}
NodeList.prototype = $.mix(OldNodeList.prototype, $.Promise.prototype);

$.NodeList = NodeList;