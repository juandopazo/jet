module("node");

test("Basic requirements", function() {
	expect(9);
	ok( Array.prototype.push, "Array.push()" );
	ok( Function.prototype.apply, "Function.apply()" );
	ok( document.getElementById, "getElementById" );
	ok( document.getElementsByTagName, "getElementsByTagName" );
	ok( RegExp, "RegExp" );
	ok( jet, "jet" );
	ok( jet(), "jet()");
	ok( jet().use && jet.add, "jet().use && jet.add");
	jet().use(function ($) {
		ok( $ != window.$, "jet doesn't pollute the global object" )
	});
});

jet().use(function ($) {
	
	var NodeList = $.NodeList;
	
	test("$ types", function () {
		
		ok( $("div") instanceof $.NodeList, "$('div') is NodeList" );
		ok( $([]) instanceof $.NodeList, "$([]) is NodeList" );
		ok( $([])._items.length == 0, "$([]) is empty NodeList" );
		
		ok( $(document) instanceof $.NodeList, "$(document) is a NodeList" );
		equals( $(document)._items[0], document, "$(document)._items[0] is the document" );
		
		
	});
	
	test("Selector", function () {
		
		equals($("div").size(), document.getElementsByTagName("div").length, '$("div").size()');
		equals($("#qunit-header").getDOMNode(), document.getElementById("qunit-header"), '$("#qunit-header").getDOMNode()');
		equals($(".chain").size(), 10, '$(".chain").size()');
		equals($("<div/>").getDOMNode().nodeName, "DIV", '$("<div/>").getDOMNode().nodeName');
		equals($("<div><a href='#'>a</a></div>").getDOMNode().nodeName, "DIV", '$("<div/>").getDOMNode().nodeName');
		
	});
	
});
