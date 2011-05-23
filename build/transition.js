/**
 * FX Transitions
 * @module transition
 * @requires node,anim,deferred
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('transition', function ($) {

			
function TransitionNative() {
	
}

function TransitionTimer() {
	
}

function Transition() {
	($.UA.support.cssTransitions ? TransitionNative : TransitionTimer).apply(this, arguments);
}
$.Object.each(($.UA.support.cssTransitions ? TransitionNative : TransitionTimer).prototype, function (name, fn) {
	Transition.prototype[name] = fn;
});

$.Transition = Transition;
			
});
