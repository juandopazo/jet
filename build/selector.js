/**
 * Small selector engine powered by Qwery
 * @module selector
 * @requires 
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('selector', function ($) {

			/*!
  * Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz & Jacob Thornton 2011
  * MIT License
  */

!function (context, doc) {

  var c, i, j, k, l, m, o, p, r, v,
      el, node, len, found, classes, item, items, token,
      id = /#([\w\-]+)/,
      clas = /\.[\w\-]+/g,
      idOnly = /^#([\w\-]+$)/,
      classOnly = /^\.([\w\-]+)$/,
      tagOnly = /^([\w\-]+)$/,
      tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/,
      html = doc.documentElement,
      tokenizr = /\s(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\])/,
      specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g,
      simple = /^([a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/,
      attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/,
      chunker = new RegExp(simple.source + '(' + attr.source + ')?');

  function array(ar) {
    r = [];
    for (i = 0, len = ar.length; i < len; i++) {
      r[i] = ar[i];
    }
    return r;
  }

  var cache = function () {
    this.c = {};
  };
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined;
    },
    s: function (k, v) {
      this.c[k] = v;
      return v;
    }
  };

  var classCache = new cache(),
      cleanCache = new cache(),
      attrCache = new cache(),
      tokenCache = new cache();

  function q(query) {
    return query.match(chunker);
  }

  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value) {
    var m, c, k;
    if (tag && this.tagName.toLowerCase() !== tag) {
      return false;
    }
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) {
      return false;
    }
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) {
        c = classes[i].slice(1);
        if (!(classCache.g(c) || classCache.s(c, new RegExp('(^|\\s+)' + c + '(\\s+|$)'))).test(this.className)) {
          return false;
        }
      }
    }
    if (wholeAttribute && !value) {
      o = this.attributes;
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this;
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, this.getAttribute(attribute) || '', value)) {
      return false;
    }
    return this;
  }

  function loopAll(tokens) {
    var r = [], token = tokens.pop(), intr = q(token), tag = intr[1] || '*', i, l, els,
        root = tokens.length && (m = tokens[0].match(idOnly)) ? doc.getElementById(m[1]) : doc;
    if (!root) {
      return r;
    }
    els = root.getElementsByTagName(tag);
    for (i = 0, l = els.length; i < l; i++) {
      el = els[i];
      if (item = interpret.apply(el, intr)) {
        r.push(item);
      }
    }
    return r;
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'));
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val;
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, new RegExp('^' + clean(val))));
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, new RegExp(clean(val) + '$')));
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, new RegExp(clean(val))));
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, new RegExp('(?:^|\\s+)' + clean(val) + '(?:\\s+|$)')));
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, new RegExp('^' + clean(val) + '(-|$)')));
    }
    return false;
  }

  function _qwery(selector) {
    var r = [], ret = [], i, l,
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr));
    tokens = tokens.slice(0);
    if (!tokens.length) {
      return r;
    }
    r = loopAll(tokens);
    if (!tokens.length) {
      return r;
    }
    // loop through all descendent tokens
    for (j = 0, l = r.length, k = 0; j < l; j++) {
      node = r[j];
      p = node;
      // loop through each token
      for (i = tokens.length; i--;) {
        z: // loop through parent nodes
        while (p !== html && (p = p.parentNode)) {
          if (found = interpret.apply(p, q(tokens[i]))) {
            break z;
          }
        }
      }
      found && (ret[k++] = node);
    }
    return ret;
  }

  function boilerPlate(selector, _root, fn) {
    var root = (typeof _root == 'string') ? fn(_root)[0] : (_root || doc);
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : [];
    }
    if (selector && typeof selector === 'object' && isFinite(selector.length)) {
      return array(selector);
    }
    if (m = selector.match(idOnly)) {
      return (el = doc.getElementById(m[1])) ? [el] : [];
    }
    if (m = selector.match(tagOnly)) {
      return array(root.getElementsByTagName(m[1]));
    }
    return false;
  }

  function isNode(el) {
    return (el && el.nodeType && (el.nodeType == 1 || el.nodeType == 9));
  }

  function uniq(ar) {
    var a = [], i, j;
    label:
    for (i = 0; i < ar.length; i++) {
      for (j = 0; j < a.length; j++) {
        if (a[j] == ar[i]) {
          continue label;
        }
      }
      a[a.length] = ar[i];
    }
    return a;
  }

  function qwery(selector, _root) {
    var root = (typeof _root == 'string') ? qwery(_root)[0] : (_root || doc);
    if (!root || !selector) {
      return [];
    }
    if (m = boilerPlate(selector, _root, qwery)) {
      return m;
    }
    return select(selector, root);
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16;
    } : 'contains' in html ?
    function (element, container) {
      container = container == doc || container == window ? html : container;
      return container !== element && container.contains(element);
    } :
    function (element, container) {
      while (element = element.parentNode) {
        if (element === container) {
          return 1;
        }
      }
      return 0;
    },

  select = (doc.querySelector && doc.querySelectorAll) ?
    function (selector, root) {
      if (doc.getElementsByClassName && (m = selector.match(classOnly))) {
        return array((root).getElementsByClassName(m[1]));
      }
      return array((root).querySelectorAll(selector));
    } :
    function (selector, root) {
      var result = [], collection, collections = [], i;
      if (m = selector.match(tagAndOrClass)) {
        items = root.getElementsByTagName(m[1] || '*');
        r = classCache.g(m[2]) || classCache.s(m[2], new RegExp('(^|\\s+)' + m[2] + '(\\s+|$)'));
        for (i = 0, l = items.length, j = 0; i < l; i++) {
          r.test(items[i].className) && (result[j++] = items[i]);
        }
        return result;
      }
      for (i = 0, items = selector.split(','), l = items.length; i < l; i++) {
        collections[i] = _qwery(items[i]);
      }
      for (i = 0, l = collections.length; i < l && (collection = collections[i]); i++) {
        var ret = collection;
        if (root !== doc) {
          ret = [];
          for (j = 0, m = collection.length; j < m && (element = collection[j]); j++) {
            // make sure element is a descendent of root
            isAncestor(element, root) && ret.push(element);
          }
        }
        result = result.concat(ret);
      }
      return uniq(result);
    };

  qwery.uniq = uniq;
  var oldQwery = context.qwery;
  qwery.noConflict = function () {
    context.qwery = oldQwery;
    return this;
  };
  context['qwery'] = qwery;

}(this, document);

$.find = function (query, root) {
	root = root || $.context;
	var test, node = null;
	if (query.charAt(0) === '<' && query.charAt(query.length - 1) === '>') {
		if (query.match(/</g).length === 1) {
			// suport for '<div/>' and '<div>'
			return root.createElement(query.substr(1, query.length - (query.charAt(query.length - 2) === '/' ? 3 : 2)));
		} else {
			// Check for strings like "<div><span><a/></span></div>"
			test = query.match(/<([a-z]+)>(.+)<\/([a-z]+)>/i);
			if (test.length == 4 && test[1] == test[3]) {
				node = root.createElement(test[1]);
				node.innerHTML = test[2];
			}
			return node;
		}
	} else {
		return query(query, root);
	}
};
			
});
