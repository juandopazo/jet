
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
			core = Core(queueList[i].config);
			for (j = 0; j < requiredLength; j++) {
				modules[required[j].name](core);
			}
			domReady(queueList.splice(i, 1)[0].main, core);
		} else {
			i++;
		}
	}
};

var buildConfig = function (config, next) {
	if (!Lang.isObject(next)) {
		next = config;
		config = {};
	}
	next.modules = next.modules || {};
	Hash.each(next.modules, function (name, opts) {
		if (Lang.isArray(opts)) {
			opts = {
				requires: opts
			};
		}
		if (!opts.path) {
			opts.path = name + (opts.type == CSS ? '.css' : '.js');
		}
		opts.name = name;
		next.modules[name] = opts;
	});
	Hash.each(next, function (name, opts) {
		if (Lang.isObject(opts) && name != 'win' && name != 'doc') {
			if (!Lang.isObject(config[name])) {
				config[name] = {};
			}
			mix(config[name], opts, true);
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
	var base = config.base;
	/**
	 * @config base
	 * @description prefix for all script and css urls
	 * @type String
	 * @default "//jet-js.googlecode.com/svn/trunk/src/"
	 */
	base = base.substr(base.length - 1, 1) == "/" ? base : base + "/";
	/**
	 * @config base
	 * @description defines whether predefined modules should be minified or not
	 * @type Boolean
	 * @default true
	 */
	config.minify = Lang.isBoolean(config.minify) ? config.minify : false;
	/**
	 * @config loadCss
	 * @description If true, css modules are loaded
	 * @type Boolean
	 * @default true
	 */
	config.loadCss = Lang.isBoolean(config.loadCss) ? config.loadCss : true;
	/**
	 * @config modules
	 * @description Allows to define your own modules. Currently the same as using object literals in the use() method
	 * @type Array
	 */
	
	/**
	 * @config win
	 * @description A reference to the global object that is accesible later with $.win
	 */
	config.win = config.win || window;
	/**
	 * @config doc
	 * @description A reference to the document that is accesible later with $.doc
	 */
	config.doc = config.doc || config.win.document;
	
	/**
	 * @config before
	 * @description id of a node before which to insert all scripts and css files
	 */
	
	var createTrackerDiv = function () {
		var trackerDiv = createNode("div", {
			id: "jet-tracker"
		}, {
			position: "absolute",
			width: "1px",
			height: "1px",
			top: "-1000px",
			left: "-1000px",
			visibility: "hidden"
		});
		config.doc.body.appendChild(trackerDiv);
		return trackerDiv;
	};
	var trackerDiv = config.doc.getElementById('jet-tracker') || createTrackerDiv();
	
	var get = new GetFactory(config);
	
	var loadCssModule = function (module) {
		var url = module.fullpath || (module.path ? (base + module.path) : (base + module.name + (config.minify ? ".min.css" : ".css")));
		get.css(url);
		var loaded = false;
		var t = setInterval(function () {
			if (getCurrentStyle(trackerDiv, config.win)[module.beacon.name] == module.beacon.value) {
				clearInterval(t);
				loaded = true;
				jet.add(module.name, function () {});
			}
		}, 50);
		setTimeout(function () {
			if (!loaded) {
				clearInterval(t);
				jet.add(module.name, function () {});
			}
		}, 5000);
	};
	
	var use = function () {
		
		var request = SLICE.call(arguments);
		var i = 0, j = 0, k, module, moveForward;
		
		// if "*" is used, include everything
		if (ArrayHelper.indexOf("*", request) > -1) {
			request = [];
			AP.unshift.apply(request, Hash.keys(config.modules));
			
		// add widget-parentchild by default
		} else if (ArrayHelper.indexOf(BASE, request) == -1) {
			request.unshift(BASE);
		}
		
		// handle requirements
		while (i < request.length - 1) {
			module = request[i];
			moveForward = 1;
			if (Lang.isString(module)) {
				module = config.modules[module.toLowerCase()];
			}
			if (module && module.requires) {
				module = module.requires;
				for (j = module.length - 1; j >= 0; j--) {
					if (!ArrayHelper.inArray(module[j], request)) {
						request.splice(i, 0, module[j]);
						moveForward = 0;
					}
				}
			}
			i += moveForward;
		}
		
		// remove JSON module if there's native JSON support
		if (config.win.JSON) {
			ArrayHelper.remove('json', request);
		}
		
		// transform every module request into an object and load the required css/script if not already loaded
		for (i = 0; i < request.length - 1; i++) {
			module = request[i];
			/*
			 * If a module is a string, it is considered a predefined module.
			 * If it isn't defined, it's probably a mistake and will lead to errors
			 */
			if (Lang.isString(module) && config.modules[module]) {
				request[i] = module = config.modules[module];
			}
			if (!Lang.isObject(module) || (module.type == CSS && !config.loadCss)) {
				request.splice(i, 1);
				i--;
			} else {
				module.fullpath = module.fullpath || base + module.path;
				if (!(modules[module.name] || queuedScripts[module.fullpath])) {
					if (!module.type || module.type == "js") {
						get.script(module.fullpath); 
					} else if (module.type == CSS) {
						domReady(loadCssModule, module);
					}
					queuedScripts[module.fullpath] = 1;
				}
			}
		}
		
		// add the queue to the waiting list
		queueList.push({
			main: request.pop(),
			req: request,
			// onProgress handlers are managed by queue
			onProgress: config.onProgress,
			config: config
		});
		update();
	};

	/**
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