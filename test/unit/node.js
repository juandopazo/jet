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
	ok( jet().use && jet().add, "jet().use && jet().add");
	jet().use(function ($) {
		ok( $ != window.$, "jet doesn't pollute the global object" )
	});
});

jet().use(function ($) {
	
	var Node = $.Node,
		NodeList = $.NodeList;
	
	test("$ types", function () {
		
		ok( NodeList.is(new $.NodeList()) );
		ok( NodeList.is($("div")), "$('div') is NodeList" );
		ok( NodeList.is($([])), "$([]) is NodeList" );
		ok( $([])._nodes.length == 0, "$([]) is empty NodeList" );
		
		ok( Node.is($(document)), "$(document) is a Node" );
		equals( $(document)._node, document, "$$(document)._node" );
		
		
	});
	
	test("Selector", function () {
		
		equals($("div")._nodes.length, document.getElementsByTagName("div").length, '$("div")._nodes.length');
		equals($("#qunit-header")._node, document.getElementById("qunit-header"), '$("#qunit-header").node');
		equals($(".chain")._nodes.length, 10, '$(".chain")._nodes.length');
		equals($("<div/>")._node.nodeName, "DIV", '$("<div/>")._node.nodeName');
		equals($("<div><a href='#'>a</a></div>")._node.nodeName, "DIV", '$("<div/>")._node.nodeName');
		
	});
	
});
