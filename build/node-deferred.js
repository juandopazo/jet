/**
 * Adds promises to Node
 * @module node-deferred
 * @requires deferred
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('node-deferred', function ($) {
"use strict";

			
var OldNodeList = $.NodeList;

function NodeList() {
	OldNodeList.apply(this, arguments);
	$.Promise.call(this);
}
NodeList.prototype = $.mix(OldNodeList.prototype, $.Promise.prototype);

$.NodeList = NodeList;
			
});
