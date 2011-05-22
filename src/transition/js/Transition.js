
$.Transition = $.Base.create('transition', $.Base, [$.UA.support.cssTransitions ? TransitionNative : TransitionTimer]);