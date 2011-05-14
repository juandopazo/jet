
var Sizzle = window.Sizzle;

delete window.Sizzle;

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
		return Sizzle(query, root);
	}
}