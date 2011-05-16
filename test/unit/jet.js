module("jet");

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

test("create fragments", function() {

	jet(function ($) {
	    var fragment = $("<div>");
	    equals(1, fragment.size(), '$("<div>").size()');
	    equals("<div></div>", fragment.getDOMNode().outerHTML, '$("<div>").getDOMNode().outerHTML');
	
	    fragment = $("<div>hello world</div>");
	    equals(1, fragment.size(), '$("<div>hello world</div>").size()');
	    equals("<div>hello world</div>", fragment.getDOMNode().outerHTML, '$("<div>hello world</div>").getDOMNode().outerHTML');
	
	    fragment = $("<div>hello</div> <span>world</span>");
	    equals(3, fragment.size(), '$("<div>hello</div> <span>world</span>").size()');
	    equals("<div>hello</div>", fragment.getDOMNode().outerHTML, '$("<div>hello</div> <span>world</span>").getDOMNode().outerHTML');
	    equals("<span>world</span>", fragment.getDOMNode(2).outerHTML, '$("<div>hello</div> <span>world</span>").getDOMNode(2).outerHTML');
	
	    fragment = $("<div>\nhello</div> \n<span>world</span>");
	    equals(3, fragment.size());
	    equals("<div>\nhello</div>", fragment.getDOMNode().outerHTML, '$("<div>\nhello</div> \n<span>world</span>").getDOMNode().outerHTML');
	    equals(Node.TEXT_NODE, fragment.getDOMNode(1).nodeType, '$("<div>\nhello</div> \n<span>world</span>").getDOMNode(1).nodeType');
	    equals("<span>world</span>", fragment.getDOMNode(2).outerHTML, '$("<div>\nhello</div> \n<span>world</span>").getDOMNode(2).outerHTML');
	});

});
