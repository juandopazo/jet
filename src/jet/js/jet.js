
/*
 * Variables used by the loader to hold states and information.
 * - "queueList" contains the requests made to the loader. 
 *   Once a request is delivered, it is deleted from this array.
 * - "queuedScripts" keeps track of which scripts were started to load, 
 *   so as not to insert them twice in the page if the loader is called before
 *   the script loaded
 * - "modules" contains all the modules already loaded 
 */
var queueList = [], queuedScripts = {}, modules = {};

/**
 * Checks the state of each queue. If a queue has finished loading it executes it
 * @private
 */
var update = function () {
	var core, i = 0, j, required, requiredLength, ready;
	while (i < queueList.length) {
		required = queueList[i].req;
		requiredLength = required.length;
		ready = 0;
		/*
		 * Check if every module in this queue was loaded 
		 */
		for (j = 0; j < requiredLength; j++) {
			if (modules[required[j].name]) {
				ready++;
			}
		}
		if (Lang.isFunction(queueList[i].onProgress)) {
			queueList[i].onProgress(ready / requiredLength);
		}
		if (ready == requiredLength) {
			/*
			 * Create a new instance of the core, call each module and the queue's callback 
			 */
			core = buildJet(queueList[i].config);
			core.use = makeUse(queueList[i].config, core.Get);
			for (j = 0; j < requiredLength; j++) {
				modules[required[j].name](core);
			}
			domReady(queueList.splice(i, 1)[0].main, core);
		} else {
			i++;
		}
	}
};

function getModuleFromString(module, config) {
	var moduleName = module.toLowerCase();
	if (config.modules[moduleName]) {
		module = config.modules[moduleName];
	} else {
		for (var name in config.groups) {
			if (config.groups.hasOwnProperty(name) && config.groups[name].modules[moduleName]) {
				module = config.groups[name].modules[moduleName];
				if (Lang.isArray(module)) {
					module = {
						requires: module
					};
				}
				module.name = moduleName;
				module.group = name;
				break;
			}
		}
	}
	return module;
}

function handleRequirements(request, config) {
	var i = 0, j, moveForward;
	var module, required;
	var index;
	// handle requirements
	while (i < request.length) {
		module = request[i];
		moveForward = 1;
		if (Lang.isString(module)) {
			module = getModuleFromString(module, config);
		}
		if (module && module.requires) {
			required = module.requires;
			for (j = required.length - 1; j >= 0; j--) {
				index = _Array.indexOf(required[j], request);
				if (index == -1) {
					request.splice(i, 0, required[j]);
					moveForward = 0;
				} else if (index > i) {
					request.splice(i, 0, request.splice(index, 1)[0]);
					moveForward = 0;
				}
			}
		}
		i += moveForward;
	}
	
	// remove JSON module if there's native JSON support
	if (config.win.JSON) {
		_Array.remove('json', request);
	}
		
	return request;
}

function makeUse(config, get) {

	var base = config.base;
	
	var loadCssModule = function (module) {
		var url = module.fullpath || (module.path ? (base + module.path) : (base + module.name + (config.minify ? ".min.css" : ".css")));
		get.css(url, function () {
			jet.add(module.name, function () {});
		});
	};
	
	return function () {
		var request = SLICE.call(arguments);
		var i = 0, module, minify, groupReqId, groupName, modName;
		var fn = request.pop();
		var groupRequests = {};
		
		// if "*" is used, include everything
		if (_Array.indexOf("*", request) > -1) {
			request = [];
			AP.unshift.apply(request, Hash.keys(config.modules));
			
		// add widget-parentchild by default
		} else if (_Array.indexOf('node', request) == -1) {
			request.unshift('node');
		}
		
		while (i < request.length) {
			if (!Lang.isString(request[i])) {
				request.splice(i, 1);
			} else {
				i++;
			}
		}
		
		request = handleRequirements(request, config);
		
		// transform every module request into an object and load the required css/script if not already loaded
		for (i = 0; i < request.length; i++) {
			module = request[i];
			/*
			 * If a module is a string, it is considered a predefined module.
			 * If it isn't defined, it's probably a mistake and will lead to errors
			 */
			if (Lang.isString(module)) {
				request[i] = module = getModuleFromString(module, config);
				module.type = module.type || 'js';
				if (!module.path) {
					minify = module.group ? config.groups[module.group].minify : config.minify;
					module.path = module.name + (minify ? '.min.' : '.') + module.type; 
				}
			}
			if (!Lang.isObject(module) || (module.type == CSS && !config.loadCss)) {
				request.splice(i, 1);
				i--;
			} else {
				module.fullpath = module.fullpath || base + module.path;
				if (module.group && config.groups[module.group] && config.groups[module.group].combine) {
					if (!groupRequests[module.group + module.type]) {
						groupRequests[module.group + module.type] = [];
					}
					groupRequests[module.group + module.type].type = module.type;
					if (!modules[module.name]) {
						groupRequests[module.group + module.type].push(module.path);
					}
					queuedScripts[module.name] = 1;
				} else if (!(modules[module.name] || queuedScripts[module.name])) {
					if (!module.type || module.type == "js") {
						get.script(module.fullpath); 
					} else if (module.type == CSS) {
						domReady(loadCssModule, module);
					}
					queuedScripts[module.name] = 1;
				}
			}
		}
		
		for (groupReqId in groupRequests) {
			if (groupRequests.hasOwnProperty(groupReqId)) {
				if (groupRequests[groupReqId].length > 0) {
					groupName = groupReqId.substr(0, groupReqId.length - groupRequests[groupReqId].type.length);
					get[groupRequests[groupReqId].type == 'css' ? 'css' : 'script'](config.groups[groupName].root + groupName + '?' + groupRequests[groupReqId].join('&'));
				}
			}
		}
		
		// add the queue to the waiting list
		queueList.push({
			main: fn,
			req: request,
			// onProgress handlers are managed by queue
			onProgress: config.onProgress,
			config: config
		});
		update();
	};
};

function moduleToObj(name, opts, modules) {
	if (Lang.isArray(opts)) {
		opts = {
			requires: opts
		};
	}
	opts.name = name;
	modules[name] = opts;
}

var buildConfig = function (config, next) {
	if (!Lang.isObject(next)) {
		next = config;
		config = {};
	}
	next.modules = next.modules || {};
	next.groups = next.groups || {};
	Hash.each(next.modules, moduleToObj);
	Hash.each(next.groups, function (groupName, group) {
		var modules = group.modules = group.modules || {};
		for (var x in modules) {
			if (modules.hasOwnProperty(x)) {
				if (Lang.isArray(modules[x])) {
					modules[x] = {
						requires: modules[x],
						name: x
					};
				}
			}
		}
	});
	Hash.each(next, function (name, opts) {
		if (Lang.isObject(opts) && name != 'win' && name != 'doc' && opts.hasOwnProperty) {
			if (!Lang.isObject(config[name])) {
				config[name] = {};
			}
			if (name == 'groups') {
				var configGroups = config[name];
				Hash.each(opts, function (groupName, group) {
					if (!configGroups[groupName]) {
						configGroups[groupName] = {};
					}
					Hash.each(group, function (prop, val) {
						if (prop == 'modules') {
							if (!configGroups[groupName].modules) {
								configGroups[groupName].modules = {};
							}
							mix(configGroups[groupName].modules, val, true);
						} else {
							configGroups[groupName][prop] = val;
						}
					});
				});
			} else {
				mix(config[name], opts, true);
			}
		} else {
			config[name] = opts;
		}
	});
	return config;
};

/**
 * <p>Global function. Returns an object with 2 methods: use() and add().</p>
 *  
 * <code>jet().use("node", function ($) {
 *	 //do something with $
 * });</code>
 * 
 * <p>This snippet will load the Node module, and when it finishes loading it'll execute
 * the function. Each module must call the jet.add() method to tell the loader
 * it has finished loading:</p>
 * 
 * <code>jet.add("node", function ($) {
 *	 $.method = function () {};
 * });</code>
 * 
 * <p>A variable is passed to every module and the function defined in the use() method. 
 * This variable acts as a main library and is shared by each module and the main
 * function, but not between different calls to the "use" method. Ie:</p>
 * 
 * <code>jet().use("node", function ($) {
 *	 $.testProperty = "test";
 * });
 * 
 * jet().use("node", function ($) {
 *	 alert($.testProperty); //alerts "undefined"
 * });</code>
 * 
 * <p>Since it is a parameter, it can have any name but it still acts the same way. Also,
 * each module is called in the order defined by the "use" method. So:</p>
 * 
 * <code>jet().use("node", "anim", function (L) {
 *	 // Here the L variable contains both Node and Anim
 *	 // The Node module is called first on L and the Anim module after,
 *	 // so it can overwrite anything Node did, extend classes, etc
 * });</code>
 * 
 * <p>New modules can be defined by passing an object literal instead of a string to the
 * "use" method with a "name" property and a "path" or "fullpath" property.</p> 
 * 
 * <code>jet().use("node", {name:"myModule", fullpath:"http://localhost/myModule.js"}, function ($) {
 *	 //do something
 * });</code>
 * 
 * <p>If "path" is defined instead of "fullpath", the loader will append "path"
 * to a predefined base URL. This base URL can be modified by passing
 * the jet() function an object literal with a "base" property:</p>
 * 
 *  <code>jet({
 *	  base: "http://www.mydomain.com/modules/"
 *  }).use("node", function ($) {
 *	  //in this case the "core" module is loaded from http://www.mydomain.com/modules/node.min.js
 *  });</code>
 * 
 * @class jet
 * @constructor
 * @param {Object} config Object literal with configuration options
 */
window.jet = function (o) {
	
	var config = buildConfig(GlobalConfig);
	config = buildConfig(config, (o && o.win) ? o.win.jet_Config : window.jet_Config);
	config = buildConfig(config, o);
	
	config.groups.jet.minify = !!config.minify;
	config.groups.jet.combine = Lang.isBoolean(config.combine) ? config.combine : true;
	config.groups.jet.root = config.root;

	var base = config.base;
	/**
	 * @attribute base
	 * @description prefix for all script and css urls
	 * @type String
	 * @default "//jet-js.googlecode.com/svn/trunk/src/"
	 */
	base = config.base = base.substr(base.length - 1, 1) == "/" ? base : base + "/";
	/**
	 * @attribute base
	 * @description defines whether predefined modules should be minified or not
	 * @type Boolean
	 * @default true
	 */
	config.minify = Lang.isBoolean(config.minify) ? config.minify : false;
	/**
	 * @attribute loadCss
	 * @description If true, css modules are loaded
	 * @type Boolean
	 * @default true
	 */
	config.loadCss = Lang.isBoolean(config.loadCss) ? config.loadCss : true;
	/**
	 * @attribute modules
	 * @description Allows to define your own modules. Currently the same as using object literals in the use() method
	 * @type Array
	 */
	
	/**
	 * @attribute win
	 * @description A reference to the global object that is accesible later with $.win
	 */
	config.win = config.win || window;
	/**
	 * @attribute doc
	 * @description A reference to the document that is accesible later with $.doc
	 */
	config.doc = config.doc || config.win.document;
	
	/**
	 * @attribute before
	 * @description id of a node before which to insert all scripts and css files
	 */
	
	var get = new Get(config);
	var use = makeUse(config, get);
	
	/*
	 * Allows for the following pattern:
	 * jet(function ($) {
	 *	...
	 * });
	 */
	if (Lang.isFunction(o)) {
		use(o);
	}
	
	return {
		/**
		 * Allows to load modules and obtain a unique reference to the library augmented by the requested modules 
		 * 
		 * This method works by overloading its parameters. It takes names (String) of predefined modules
		 * or objects defining name and path/fullpath of a module. The last parameter must be a function 
		 * that contains the main logic of the application.
		 * @method use 
		 */
		use: use
	};
};
/**
 * Adds a module to the loaded module list and calls update() to check if a queue is ready to fire
 * This method must be called from a module to register it
 * @method add
 * @static
 * @param {String} moduleName
 * @param {Function} expose
 */
jet.add = function (moduleName, expose) {
	/*
	 * Modules are overwritten by default.
	 * Maybe it would be a good idea to add an option not to overwrite if present?
	 */ 
	modules[moduleName] = expose;
	update();
};