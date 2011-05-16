module("traversing");

test("find(String)", function() {
	jet(function ($) {
		expect(5);
		equals( "Yahoo", $("#foo").find(".blogTest").text(), "Check for find" );
	
		// using contents will get comments regular, text, and comment nodes
		var j = $("#nonnodes").contents();
		equals( j.find("div").size(), 0, "Check node,textnode,comment to find zero divs" );
	
		same( $("#qunit-fixture").find("> div").getDOMNode(), q("foo", "moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest"), "find child elements" );
		same( $("#qunit-fixture").find("> #foo, > #moretests").getDOMNode(), q("foo", "moretests"), "find child elements" );
		same( $("#qunit-fixture").find("> #foo > p").getDOMNode(), q("sndp", "en", "sap"), "find child elements" );
	});
});

test("find(node|$ object)", function() {
	jet(function ($) {
		expect( 11 );
		
		var $foo = $("#foo"),
			$blog = $(".blogTest"),
			$first = $("#first"),
			$two = $blog.add( $first ),
			$fooTwo = $foo.add( $blog );
	
		equals( $foo.find( $blog ).text(), "Yahoo", "Find with blog $ object" );
		equals( $foo.find( $blog.getDOMNode() ).text(), "Yahoo", "Find with blog node" );
		equals( $foo.find( $first ).size(), 0, "#first is not in #foo" );
		equals( $foo.find( $first.getDOMNode()).size(), 0, "#first not in #foo (node)" );
		ok( $foo.find( $two ).is(".blogTest"), "Find returns only nodes within #foo" );
		ok( $fooTwo.find( $blog ).is(".blogTest"), "Blog is part of the collection, but also within foo" );
		ok( $fooTwo.find( $blog.getDOMNode() ).is(".blogTest"), "Blog is part of the collection, but also within foo(node)" );
		
		equals( $two.find( $foo ).size(), 0, "Foo is not in two elements" );
		equals( $two.find( $foo.getDOMNode() ).size(), 0, "Foo is not in two elements(node)" );
		equals( $two.find( $first ).size(), 0, "first is in the collection and not within two" );
		equals( $two.find( $first ).size(), 0, "first is in the collection and not within two(node)" );
	});	
});

test("indexOf(Object|String|undefined)", function() {
	expect(16);

	var elements = $([window, document]),
		inputElements = $("#radio1,#radio2,#check1,#check2");

	// Passing a node
	equals( elements.indexOf(window), 0, "Check for index of elements" );
	equals( elements.indexOf(document), 1, "Check for index of elements" );
	equals( inputElements.indexOf(document.getElementById("radio1")), 0, "Check for index of elements" );
	equals( inputElements.indexOf(document.getElementById("radio2")), 1, "Check for index of elements" );
	equals( inputElements.indexOf(document.getElementById("check1")), 2, "Check for index of elements" );
	equals( inputElements.indexOf(document.getElementById("check2")), 3, "Check for index of elements" );
	equals( inputElements.indexOf(window), -1, "Check for not found index" );
	equals( inputElements.indexOf(document), -1, "Check for not found index" );

	// Passing a $ object
	// enabled since [5500]
	equals( elements.indexOf( elements ), 0, "Pass in a $ object" );
	equals( elements.indexOf( elements.eq(1) ), 1, "Pass in a $ object" );
	equals( $("#form :radio").indexOf( $("#radio2") ), 1, "Pass in a $ object" );

	// Passing a selector or nothing
	// enabled since [6330]
	equals( $("#text2").indexOf(), 2, "Check for index amongst siblings" );
	equals( $("#form").children().eq(4).indexOf(), 4, "Check for index amongst siblings" );
	equals( $("#radio2").indexOf("#form :radio") , 1, "Check for index within a selector" );
	equals( $("#form :radio").indexOf( $("#radio2") ), 1, "Check for index within a selector" );
	equals( $("#radio2").indexOf("#form :text") , -1, "Check for index not found within a selector" );
});

test("filter(Selector|undefined)", function() {
	expect(9);
	same( $("#form input").filter(":checked").getDOMNode(), q("radio2", "check1"), "filter(String)" );
	same( $("p").filter("#ap, #sndp").getDOMNode(), q("ap", "sndp"), "filter('String, String')" );
	same( $("p").filter("#ap,#sndp").getDOMNode(), q("ap", "sndp"), "filter('String,String')" );
	
	same( $("p").filter(null).getDOMNode(),      [], "filter(null) should return an empty $ object");
	same( $("p").filter(undefined).getDOMNode(), [], "filter(undefined) should return an empty $ object");
	same( $("p").filter(0).getDOMNode(),         [], "filter(0) should return an empty $ object");
	same( $("p").filter("").getDOMNode(),        [], "filter('') should return an empty $ object");

	// using contents will get comments regular, text, and comment nodes
	var j = $("#nonnodes").contents();
	equals( j.filter("span").size(), 1, "Check node,textnode,comment to filter the one span" );
	equals( j.filter("[name]").size(), 0, "Check node,textnode,comment to filter the one span" );
});

test("filter(Function)", function() {
	expect(2);

	same( $("#qunit-fixture p").filter(function() { return !$("a", this).size() }).getDOMNode(), q("sndp", "first"), "filter(Function)" );

	same( $("#qunit-fixture p").filter(function(i, elem) { return !$("a", elem).size() }).getDOMNode(), q("sndp", "first"), "filter(Function) using arg" );
});

test("filter(Element)", function() {
	expect(1);

	var element = document.getElementById("text1");
	same( $("#form input").filter(element).getDOMNode(), q("text1"), "filter(Element)" );
});

test("filter(Array)", function() {
	expect(1);

	var elements = [ document.getElementById("text1") ];
	same( $("#form input").filter(elements).getDOMNode(), q("text1"), "filter(Element)" );
});

test("filter($)", function() {
	expect(1);

	var elements = $("#text1");
	same( $("#form input").filter(elements).getDOMNode(), q("text1"), "filter(Element)" );
})

test("closest()", function() {
	expect(13);
	same( $("body").closest("body").getDOMNode(), q("body"), "closest(body)" );
	same( $("body").closest("html").getDOMNode(), q("html"), "closest(html)" );
	same( $("body").closest("div").getDOMNode(), [], "closest(div)" );
	same( $("#qunit-fixture").closest("span,#html").getDOMNode(), q("html"), "closest(span,#html)" );

	same( $("div:eq(1)").closest("div:first").getDOMNode(), [], "closest(div:first)" );
	same( $("div").closest("body:first div:last").getDOMNode(), q("fx-tests"), "closest(body:first div:last)" );

	// Test .closest() limited by the context
	var jq = $("#nothiddendivchild");
	same( jq.closest("html", document.body).getDOMNode(), [], "Context limited." );
	same( jq.closest("body", document.body).getDOMNode(), [], "Context limited." );
	same( jq.closest("#nothiddendiv", document.body).getDOMNode(), q("nothiddendiv"), "Context not reached." );

	//Test that .closest() returns unique'd set
	equals( $("#qunit-fixture p").closest("#qunit-fixture").size(), 1, "Closest should return a unique set" );

	// Test on disconnected node
	equals( $("<div><p></p></div>").find("p").closest("table").size(), 0, "Make sure disconnected closest work." );

	// Bug #7369
	equals( $("<div foo='bar'></div>").closest("[foo]").size(), 1, "Disconnected nodes with attribute selector" );
	equals( $("<div>text</div>").closest("[lang]").size(), 0, "Disconnected nodes with text and non-existent attribute selector" );
});

test("closest(Array)", function() {
	expect(7);
	same( $("body").closest(["body"]), [{selector:"body", elem:document.body, level:1}], "closest([body])" );
	same( $("body").closest(["html"]), [{selector:"html", elem:document.documentElement, level:2}], "closest([html])" );
	same( $("body").closest(["div"]), [], "closest([div])" );
	same( $("#yahoo").closest(["div"]), [{"selector":"div", "elem": document.getElementById("foo"), "level": 3}, { "selector": "div", "elem": document.getElementById("qunit-fixture"), "level": 4 }], "closest([div])" );
	same( $("#qunit-fixture").closest(["span,#html"]), [{selector:"span,#html", elem:document.documentElement, level:4}], "closest([span,#html])" );

	same( $("body").closest(["body","html"]), [{selector:"body", elem:document.body, level:1}, {selector:"html", elem:document.documentElement, level:2}], "closest([body, html])" );
	same( $("body").closest(["span","html"]), [{selector:"html", elem:document.documentElement, level:2}], "closest([body, html])" );
});

test("closest($)", function() {
	expect(8);
	var $child = $("#nothiddendivchild"),
		$parent = $("#nothiddendiv"),
		$main = $("#qunit-fixture"),
		$body = $("body");
	ok( $child.closest( $parent ).is("#nothiddendiv"), "closest( $('#nothiddendiv') )" );
	ok( $child.closest( $parent.getDOMNode() ).is("#nothiddendiv"), "closest( $('#nothiddendiv') ) :: node" );
	ok( $child.closest( $child ).is("#nothiddendivchild"), "child is included" );
	ok( $child.closest( $child.getDOMNode() ).is("#nothiddendivchild"), "child is included  :: node" );
	equals( $child.closest( document.createElement("div") ).size(), 0, "created element is not related" );
	equals( $child.closest( $main ).size(), 0, "Main not a parent of child" );
	equals( $child.closest( $main.getDOMNode() ).size(), 0, "Main not a parent of child :: node" );
	ok( $child.closest( $body.add($parent) ).is("#nothiddendiv"), "Closest ancestor retrieved." );
});

test("not(Selector|undefined)", function() {
	expect(11);
	equals( $("#qunit-fixture > p#ap > a").not("#google").size(), 2, "not('selector')" );
	same( $("p").not(".result").getDOMNode(), q("firstp", "ap", "sndp", "en", "sap", "first"), "not('.class')" );
	same( $("p").not("#ap, #sndp, .result").getDOMNode(), q("firstp", "en", "sap", "first"), "not('selector, selector')" );
	same( $("#form option").not("option.emptyopt:contains('Nothing'),[selected],[value='1']").getDOMNode(), q("option1c", "option1d", "option2c", "option3d", "option3e", "option4e","option5b"), "not('complex selector')");

	same( $("#ap *").not("code").getDOMNode(), q("google", "groups", "anchor1", "mark"), "not('tag selector')" );
	same( $("#ap *").not("code, #mark").getDOMNode(), q("google", "groups", "anchor1"), "not('tag, ID selector')" );
	same( $("#ap *").not("#mark, code").getDOMNode(), q("google", "groups", "anchor1"), "not('ID, tag selector')");

	var all = $("p").getDOMNode();
	same( $("p").not(null).getDOMNode(),      all, "not(null) should have no effect");
	same( $("p").not(undefined).getDOMNode(), all, "not(undefined) should have no effect");
	same( $("p").not(0).getDOMNode(),         all, "not(0) should have no effect");
	same( $("p").not("").getDOMNode(),        all, "not('') should have no effect");
});

test("not(Element)", function() {
	expect(1);

	var selects = $("#form select");
	same( selects.not( selects.getDOMNode(1) ).getDOMNode(), q("select1", "select3", "select4", "select5"), "filter out DOM element");
});

test("not(Function)", function() {
	same( $("#qunit-fixture p").not(function() { return $("a", this).size() }).getDOMNode(), q("sndp", "first"), "not(Function)" );
});

test("not(Array)", function() {
	expect(2);

	equals( $("#qunit-fixture > p#ap > a").not(document.getElementById("google")).size(), 2, "not(DOMElement)" );
	equals( $("p").not(document.getElementsByTagName("p")).size(), 0, "not(Array-like DOM collection)" );
});

test("not($)", function() {
	expect(1);

	same( $("p").not($("#ap, #sndp, .result")).getDOMNode(), q("firstp", "en", "sap", "first"), "not($)" );
});

test("has(Element)", function() {
	expect(2);

	var obj = $("#qunit-fixture").has($("#sndp").getDOMNode());
	same( obj.getDOMNode(), q("qunit-fixture"), "Keeps elements that have the element as a descendant" );

	var multipleParent = $("#qunit-fixture, #header").has($("#sndp").getDOMNode());
	same( obj.getDOMNode(), q("qunit-fixture"), "Does not include elements that do not have the element as a descendant" );
});

test("has(Selector)", function() {
	expect(3);

	var obj = $("#qunit-fixture").has("#sndp");
	same( obj.getDOMNode(), q("qunit-fixture"), "Keeps elements that have any element matching the selector as a descendant" );

	var multipleParent = $("#qunit-fixture, #header").has("#sndp");
	same( obj.getDOMNode(), q("qunit-fixture"), "Does not include elements that do not have the element as a descendant" );

	var multipleHas = $("#qunit-fixture").has("#sndp, #first");
	same( multipleHas.getDOMNode(), q("qunit-fixture"), "Only adds elements once" );
});

test("has(Arrayish)", function() {
	expect(3);

	var simple = $("#qunit-fixture").has($("#sndp"));
	same( simple.getDOMNode(), q("qunit-fixture"), "Keeps elements that have any element in the $ list as a descendant" );

	var multipleParent = $("#qunit-fixture, #header").has($("#sndp"));
	same( multipleParent.getDOMNode(), q("qunit-fixture"), "Does not include elements that do not have an element in the $ list as a descendant" );

	var multipleHas = $("#qunit-fixture").has($("#sndp, #first"));
	same( simple.getDOMNode(), q("qunit-fixture"), "Only adds elements once" );
});

test("andSelf()", function() {
	expect(4);
	same( $("#en").siblings().andSelf().getDOMNode(), q("sndp", "en", "sap"), "Check for siblings and self" );
	same( $("#foo").children().andSelf().getDOMNode(), q("foo", "sndp", "en", "sap"), "Check for children and self" );
	same( $("#sndp, #en").parent().andSelf().getDOMNode(), q("foo","sndp","en"), "Check for parent and self" );
	same( $("#groups").parents("p, div").andSelf().getDOMNode(), q("qunit-fixture", "ap", "groups"), "Check for parents and self" );
});

test("siblings([String])", function() {
	expect(5);
	same( $("#en").siblings().getDOMNode(), q("sndp", "sap"), "Check for siblings" );
	same( $("#sndp").siblings(":has(code)").getDOMNode(), q("sap"), "Check for filtered siblings (has code child element)" );
	same( $("#sndp").siblings(":has(a)").getDOMNode(), q("en", "sap"), "Check for filtered siblings (has anchor child element)" );
	same( $("#foo").siblings("form, b").getDOMNode(), q("form", "floatTest", "lengthtest", "name-tests", "testForm"), "Check for multiple filters" );
	var set = q("sndp", "en", "sap");
	same( $("#en, #sndp").siblings().getDOMNode(), set, "Check for unique results from siblings" );
});

test("children([String])", function() {
	expect(3);
	same( $("#foo").children().getDOMNode(), q("sndp", "en", "sap"), "Check for children" );
	same( $("#foo").children(":has(code)").getDOMNode(), q("sndp", "sap"), "Check for filtered children" );
	same( $("#foo").children("#en, #sap").getDOMNode(), q("en", "sap"), "Check for multiple filters" );
});

test("parent([String])", function() {
	expect(5);
	equals( $("#groups").parent().getDOMNode().id, "ap", "Simple parent check" );
	equals( $("#groups").parent("p").getDOMNode().id, "ap", "Filtered parent check" );
	equals( $("#groups").parent("div").size(), 0, "Filtered parent check, no match" );
	equals( $("#groups").parent("div, p").getDOMNode().id, "ap", "Check for multiple filters" );
	same( $("#en, #sndp").parent().getDOMNode(), q("foo"), "Check for unique results from parent" );
});

test("parents([String])", function() {
	expect(5);
	equals( $("#groups").parents().getDOMNode().id, "ap", "Simple parents check" );
	equals( $("#groups").parents("p").getDOMNode().id, "ap", "Filtered parents check" );
	equals( $("#groups").parents("div").getDOMNode().id, "qunit-fixture", "Filtered parents check2" );
	same( $("#groups").parents("p, div").getDOMNode(), q("ap", "qunit-fixture"), "Check for multiple filters" );
	same( $("#en, #sndp").parents().getDOMNode(), q("foo", "qunit-fixture", "dl", "body", "html"), "Check for unique results from parents" );
});

test("parentsUntil([String])", function() {
	expect(9);

	var parents = $("#groups").parents();

	same( $("#groups").parentsUntil().getDOMNode(), parents.getDOMNode(), "parentsUntil with no selector (nextAll)" );
	same( $("#groups").parentsUntil(".foo").getDOMNode(), parents.getDOMNode(), "parentsUntil with invalid selector (nextAll)" );
	same( $("#groups").parentsUntil("#html").getDOMNode(), parents.not(":last").getDOMNode(), "Simple parentsUntil check" );
	equals( $("#groups").parentsUntil("#ap").size(), 0, "Simple parentsUntil check" );
	same( $("#groups").parentsUntil("#html, #body").getDOMNode(), parents.slice( 0, 3 ).getDOMNode(), "Less simple parentsUntil check" );
	same( $("#groups").parentsUntil("#html", "div").getDOMNode(), $("#qunit-fixture").getDOMNode(), "Filtered parentsUntil check" );
	same( $("#groups").parentsUntil("#html", "p,div,dl").getDOMNode(), parents.slice( 0, 3 ).getDOMNode(), "Multiple-filtered parentsUntil check" );
	equals( $("#groups").parentsUntil("#html", "span").size(), 0, "Filtered parentsUntil check, no match" );
	same( $("#groups, #ap").parentsUntil("#html", "p,div,dl").getDOMNode(), parents.slice( 0, 3 ).getDOMNode(), "Multi-source, multiple-filtered parentsUntil check" );
});

test("next([String])", function() {
	expect(4);
	equals( $("#ap").next().getDOMNode().id, "foo", "Simple next check" );
	equals( $("#ap").next("div").getDOMNode().id, "foo", "Filtered next check" );
	equals( $("#ap").next("p").size(), 0, "Filtered next check, no match" );
	equals( $("#ap").next("div, p").getDOMNode().id, "foo", "Multiple filters" );
});

test("prev([String])", function() {
	expect(4);
	equals( $("#foo").prev().getDOMNode().id, "ap", "Simple prev check" );
	equals( $("#foo").prev("p").getDOMNode().id, "ap", "Filtered prev check" );
	equals( $("#foo").prev("div").size(), 0, "Filtered prev check, no match" );
	equals( $("#foo").prev("p, div").getDOMNode().id, "ap", "Multiple filters" );
});

test("nextAll([String])", function() {
	expect(4);

	var elems = $("#form").children();

	same( $("#label-for").nextAll().getDOMNode(), elems.not(":first").getDOMNode(), "Simple nextAll check" );
	same( $("#label-for").nextAll("input").getDOMNode(), elems.not(":first").filter("input").getDOMNode(), "Filtered nextAll check" );
	same( $("#label-for").nextAll("input,select").getDOMNode(), elems.not(":first").filter("input,select").getDOMNode(), "Multiple-filtered nextAll check" );
	same( $("#label-for, #hidden1").nextAll("input,select").getDOMNode(), elems.not(":first").filter("input,select").getDOMNode(), "Multi-source, multiple-filtered nextAll check" );
});

test("prevAll([String])", function() {
	expect(4);

	var elems = $( $("#form").children().slice(0, 12).getDOMNode().reverse() );

	same( $("#area1").prevAll().getDOMNode(), elems.getDOMNode(), "Simple prevAll check" );
	same( $("#area1").prevAll("input").getDOMNode(), elems.filter("input").getDOMNode(), "Filtered prevAll check" );
	same( $("#area1").prevAll("input,select").getDOMNode(), elems.filter("input,select").getDOMNode(), "Multiple-filtered prevAll check" );
	same( $("#area1, #hidden1").prevAll("input,select").getDOMNode(), elems.filter("input,select").getDOMNode(), "Multi-source, multiple-filtered prevAll check" );
});

test("nextUntil([String])", function() {
	expect(11);

	var elems = $("#form").children().slice( 2, 12 );

	same( $("#text1").nextUntil().getDOMNode(), $("#text1").nextAll().getDOMNode(), "nextUntil with no selector (nextAll)" );
	same( $("#text1").nextUntil(".foo").getDOMNode(), $("#text1").nextAll().getDOMNode(), "nextUntil with invalid selector (nextAll)" );
	same( $("#text1").nextUntil("#area1").getDOMNode(), elems.getDOMNode(), "Simple nextUntil check" );
	equals( $("#text1").nextUntil("#text2").size(), 0, "Simple nextUntil check" );
	same( $("#text1").nextUntil("#area1, #radio1").getDOMNode(), $("#text1").next().getDOMNode(), "Less simple nextUntil check" );
	same( $("#text1").nextUntil("#area1", "input").getDOMNode(), elems.not("button").getDOMNode(), "Filtered nextUntil check" );
	same( $("#text1").nextUntil("#area1", "button").getDOMNode(), elems.not("input").getDOMNode(), "Filtered nextUntil check" );
	same( $("#text1").nextUntil("#area1", "button,input").getDOMNode(), elems.getDOMNode(), "Multiple-filtered nextUntil check" );
	equals( $("#text1").nextUntil("#area1", "div").size(), 0, "Filtered nextUntil check, no match" );
	same( $("#text1, #hidden1").nextUntil("#area1", "button,input").getDOMNode(), elems.getDOMNode(), "Multi-source, multiple-filtered nextUntil check" );

	same( $("#text1").nextUntil("[class=foo]").getDOMNode(), $("#text1").nextAll().getDOMNode(), "Non-element nodes must be skipped, since they have no attributes" );
});

test("prevUntil([String])", function() {
	expect(10);

	var elems = $("#area1").prevAll();

	same( $("#area1").prevUntil().getDOMNode(), elems.getDOMNode(), "prevUntil with no selector (prevAll)" );
	same( $("#area1").prevUntil(".foo").getDOMNode(), elems.getDOMNode(), "prevUntil with invalid selector (prevAll)" );
	same( $("#area1").prevUntil("label").getDOMNode(), elems.not(":last").getDOMNode(), "Simple prevUntil check" );
	equals( $("#area1").prevUntil("#button").size(), 0, "Simple prevUntil check" );
	same( $("#area1").prevUntil("label, #search").getDOMNode(), $("#area1").prev().getDOMNode(), "Less simple prevUntil check" );
	same( $("#area1").prevUntil("label", "input").getDOMNode(), elems.not(":last").not("button").getDOMNode(), "Filtered prevUntil check" );
	same( $("#area1").prevUntil("label", "button").getDOMNode(), elems.not(":last").not("input").getDOMNode(), "Filtered prevUntil check" );
	same( $("#area1").prevUntil("label", "button,input").getDOMNode(), elems.not(":last").getDOMNode(), "Multiple-filtered prevUntil check" );
	equals( $("#area1").prevUntil("label", "div").size(), 0, "Filtered prevUntil check, no match" );
	same( $("#area1, #hidden1").prevUntil("label", "button,input").getDOMNode(), elems.not(":last").getDOMNode(), "Multi-source, multiple-filtered prevUntil check" );
});

test("contents()", function() {
	expect(12);
	equals( $("#ap").contents().size(), 9, "Check element contents" );
	ok( $("#iframe").contents().getDOMNode(), "Check existance of IFrame document" );
	var ibody = $("#loadediframe").contents().getDOMNode().body;
	ok( ibody, "Check existance of IFrame body" );

	equals( $("span", ibody).text(), "span text", "Find span in IFrame and check its text" );

	$(ibody).append("<div>init text</div>");
	equals( $("div", ibody).size(), 2, "Check the original div and the new div are in IFrame" );

	equals( $("div:last", ibody).text(), "init text", "Add text to div in IFrame" );

	$("div:last", ibody).text("div text");
	equals( $("div:last", ibody).text(), "div text", "Add text to div in IFrame" );

	$("div:last", ibody).remove();
	equals( $("div", ibody).size(), 1, "Delete the div and check only one div left in IFrame" );

	equals( $("div", ibody).text(), "span text", "Make sure the correct div is still left after deletion in IFrame" );

	$("<table/>", ibody).append("<tr><td>cell</td></tr>").appendTo(ibody);
	$("table", ibody).remove();
	equals( $("div", ibody).size(), 1, "Check for JS error on add and delete of a table in IFrame" );

	// using contents will get comments regular, text, and comment nodes
	var c = $("#nonnodes").contents().contents();
	equals( c.length, 1, "Check node,textnode,comment contents is just one" );
	equals( c.getDOMNode().nodeValue, "hi", "Check node,textnode,comment contents is just the one from span" );
});

test("add(String|Element|Array|undefined)", function() {
	expect(16);
	same( $("#sndp").add("#en").add("#sap").getDOMNode(), q("sndp", "en", "sap"), "Check elements from document" );
	same( $("#sndp").add( $("#en").getDOMNode() ).add( $("#sap") ).getDOMNode(), q("sndp", "en", "sap"), "Check elements from document" );

	// We no longer support .add(form.elements), unfortunately.
	// There is no way, in browsers, to reliably determine the difference
	// between form.elements and form - and doing .add(form) and having it
	// add the form elements is way to unexpected, so this gets the boot.
	// ok( $([]).add($("#form").getDOMNode().elements).size() >= 13, "Check elements from array" );

	// For the time being, we're discontinuing support for $(form.elements) since it's ambiguous in IE
	// use $([]).add(form.elements) instead.
	//equals( $([]).add($("#form").getDOMNode().elements).size(), $($("#form").getDOMNode().elements).size(), "Array in constructor must equals array in add()" );

	var divs = $("<div/>").add("#sndp");
	ok( !divs.getDOMNode().parentNode, "Make sure the first element is still the disconnected node." );

	divs = $("<div>test</div>").add("#sndp");
	equals( divs.getDOMNode().parentNode.nodeType, 11, "Make sure the first element is still the disconnected node." );

	divs = $("#sndp").add("<div/>");
	ok( !divs.getDOMNode(1).parentNode, "Make sure the first element is still the disconnected node." );

	var tmp = $("<div/>");

	var x = $([]).add($("<p id='x1'>xxx</p>").appendTo(tmp)).add($("<p id='x2'>xxx</p>").appendTo(tmp));
	equals( x.getDOMNode().id, "x1", "Check on-the-fly element1" );
	equals( x.getDOMNode(1).id, "x2", "Check on-the-fly element2" );

	var x = $([]).add($("<p id='x1'>xxx</p>").appendTo(tmp).getDOMNode()).add($("<p id='x2'>xxx</p>").appendTo(tmp).getDOMNode());
	equals( x.getDOMNode().id, "x1", "Check on-the-fly element1" );
	equals( x.getDOMNode(1).id, "x2", "Check on-the-fly element2" );

	var x = $([]).add($("<p id='x1'>xxx</p>")).add($("<p id='x2'>xxx</p>"));
	equals( x.getDOMNode().id, "x1", "Check on-the-fly element1" );
	equals( x.getDOMNode(1).id, "x2", "Check on-the-fly element2" );

	var x = $([]).add("<p id='x1'>xxx</p>").add("<p id='x2'>xxx</p>");
	equals( x.getDOMNode().id, "x1", "Check on-the-fly element1" );
	equals( x.getDOMNode(1).id, "x2", "Check on-the-fly element2" );

	var notDefined;
	equals( $([]).add(notDefined).size(), 0, "Check that undefined adds nothing" );

	equals( $([]).add( document.getElementById("form") ).size(), 1, "Add a form" );
	equals( $([]).add( document.getElementById("select1") ).size(), 1, "Add a select" );
});

test("add(String, Context)", function() {
	expect(6);
	
	deepEqual( $( "#firstp" ).add( "#ap" ).getDOMNode(), q( "firstp", "ap" ), "Add selector to selector " );
	deepEqual( $( document.getElementById("firstp") ).add( "#ap" ).getDOMNode(), q( "firstp", "ap" ), "Add gEBId to selector" );
	deepEqual( $( document.getElementById("firstp") ).add( document.getElementById("ap") ).getDOMNode(), q( "firstp", "ap" ), "Add gEBId to gEBId" );

	var ctx = document.getElementById("firstp");
	deepEqual( $( "#firstp" ).add( "#ap", ctx ).getDOMNode(), q( "firstp" ), "Add selector to selector " );
	deepEqual( $( document.getElementById("firstp") ).add( "#ap", ctx ).getDOMNode(), q( "firstp" ), "Add gEBId to selector, not in context" );
	deepEqual( $( document.getElementById("firstp") ).add( "#ap", document.getElementsByTagName("body").getDOMNode() ).getDOMNode(), q( "firstp", "ap" ), "Add gEBId to selector, in context" );
});
