
/*
 * History handling adapted from http://code.google.com/p/reallysimplehistory/
 * 
 * Really simple History Copyright (c) 2007 Brian Dillard and Brad Neuberg:
 * Brian Dillard | Project Lead | bdillard@pathf.com | http://blogs.pathf.com/agileajax/
 * Brad Neuberg | Original Project Creator | http://codinginparadise.org
 */

var UA = $.UA,
	Lang = $.Lang,
	A = $.Array,
	Hash = $.Hash;
	
var body = $.config.doc.body;

var safari = false;
	
/*Private - CSS strings utilized by both objects to hide or show behind-the-scenes DOM elements*/
var showStyles = {
	border: "0",
	margin: "0",
	padding: "0"
};
var hideStyles = {
	left: "-1000px",
	top: "-1000px",
	width: "1px",
	height: "1px",
	position: "absolute"
};

var HistoryNS = jet.namespace('History');
if (!HistoryNS.iframe) {
	HistoryNS.iframe = new $.EventTarget();
}

/*
	historyStorage: An object that uses a hidden form to store history state across page loads. The mechanism for doing so relies on
	the fact that browsers save the text in form data for the life of the browser session, which means the text is still there when
	the user navigates back to the page. This object can be used independently of the dhtmlHistory object for caching of Ajax
	session information.
*/
var historyStorage = (function () {
	
	/*Private - debug mode flag*/
	var debugMode;
	
	var fake = function (a) {
		return a;
	};
	var encode, decode;

	/*Private: Our hash of key name/values.*/
	var storageHash = {};

	/*Private: If true, we have loaded our hash table out of the storage form.*/
	var hashLoaded = false;

	/*Private: DOM reference to our history field*/
	var storageField;

	var isValidKey = function (key) {
		return Lang.isString(key);
		//TODO - should we ban hash signs and other special characters?
	};

	/*Private: Assert that a key is valid; throw an exception if it not.*/
	var assertValidKey = function (key) {
		var isValid = isValidKey(key);
		if (!isValid && debugMode) {
			throw new Error("Please provide a valid key for window.historyStorage. Invalid key = " + key + ".");
		}
	};

	/*Private: Load the hash table up from the form.*/
	var loadHashTable = function () {
		if (!hashLoaded) {	
			var serializedHashTable = storageField.value;
			if (serializedHashTable !== "" && serializedHashTable !== null) {
				storageHash = $.JSON.stringify(serializedHashTable);
				hashLoaded = true;
			}
		}
	};
	/*Private: Save the hash table into the form.*/
	var saveHashTable = function () {
		loadHashTable();
		storageField.value = $.JSON.stringify(storageHash);
	};
	
	return {
		/*Public: Set up our historyStorage object for use by dhtmlHistory or other objects*/
		setup: function (options) {
			options = options || {};
			debugMode = !!options.debugMode;
			encode = options.encodeURI ? encodeURIComponent : fake;
			decode = options.encodeURI ? decodeURIComponent : fake;
						
			/*write a hidden form and textarea into the page; we'll stow our history stack here*/
			var formStyles = debugMode ? showStyles : hideStyles;
			var textareaStyles = debugMode	? {
				width: "800px",
				height: "80px",
				border: "1px solid black"
			} : hideStyles;
			
			var form = $('<form><textarea id="jet-storage-field"></textarea></form>').attr("id", "jet-storage-form");
			storageField = form.css(formStyles).first().css(textareaStyles)[0];
			if (UA.opera) {
				storageField.focus();/*Opera needs to focus this element before persisting values in it*/
			}
			return this;
		},
		
		/*Public*/
		put: function (key, value) {
			
			var encodedKey = encode(key);
			
			assertValidKey(encodedKey);
			/*if we already have a value for this, remove the value before adding the new one*/
			if (this.hasKey(key)) {
				this.remove(key);
			}
			/*store this new key*/
			storageHash[encodedKey] = value;
			/*save and serialize the hashtable into the form*/
			saveHashTable();
			return this;
		},
	
		/*Public*/
		get: function (key) {
	
			var encodedKey = encode(key);
			
			assertValidKey(encodedKey);
			/*make sure the hash table has been loaded from the form*/
			loadHashTable();
			var value = storageHash[encodedKey];
			if (value === undefined) {
				value = null;
			}
			return value;
		},
	
		/*Public*/
		remove: function (key) {
			
			var encodedKey = encode(key);
	
			assertValidKey(encodedKey);
			/*make sure the hash table has been loaded from the form*/
			loadHashTable();
			/*delete the value*/
			delete storageHash[encodedKey];
			/*serialize and save the hash table into the form*/
			saveHashTable();
			return this;
		},
	
		/*Public: Clears out all saved data.*/
		reset: function () {
			storageField.value = "";
			storageHash = {};
			return this;
		},
	
		/*Public*/
		hasKey: function (key) {
			
			var encodedKey = encode(key);
	
			assertValidKey(encodedKey);
			/*make sure the hash table has been loaded from the form*/
			loadHashTable();
			return !Lang.isUndefined(storageHash[encodedKey]);
		},
	
		/*Public*/
		isValidKey: isValidKey
	};
}());

/**
 * History management class
 * @class History
 * @extends Base
 * @constructor
 * @param {Object} config Object literal specifying configuration properties
 */
var History = function () {
	History.superclass.constructor.apply(this, arguments);

	var isSupported = false;
	
	/*Private: A variable that indicates whether this is the first time this page has been loaded. If you go to a web page, leave it
	for another one, and then return, the page's onload listener fires again. We need a way to differentiate between the first page
	load and subsequent ones. This variable works hand in hand with the pageLoaded variable we store into historyStorage.*/
	var firstLoad;
	
	var fake = function (a) {
		return a;
	};
	var encode = fake,
		decode = fake;

	var myself = this.addAttrs({
		/**
		 * @attribute firstLoad
		 * @description Whether this is the first time the History loaded or not
		 * @type Boolean
		 * @readOnly
		 */
		firstLoad: {
			readOnly: true,
			value: firstLoad
		},
		/**
		 * @attribute baseTitle
		 * @description pattern for title changes. Example: "Armchair DJ [@@@]" - @@@ will be replaced
		 * @type String
		 */
		baseTitle: {
			validator: function (value) {
				var ok = value.indexOf("@@@") >= 0;
				if (!ok && myself.get("debugMode")) {
					throw new Error("Programmer error: options.baseTitle must contain the replacement parameter '@@@' to be useful.");
				}
				return ok;
			}
		},
		/**
		 * @attribute blankURL
		 * @description URL for the blank html file we use for IE; can be overridden via the options bundle. 
		 * Otherwise it must be served in same directory as this library
		 * @type String
		 * @default "blank.html?"
		 */
		blankURL: {
			setter: function (value) {
				return value.substr(-1) != "?" ? value + "?" : value;
			},
			value: "blank.html?"
		},
		/**
		 * @attribute encodeURI
		 * @description Whether to encode the URI or not
		 * @type Boolean
		 */
		encodeURI: {
			setter: function (value) {
				encode = value ? encodeURIComponent : fake;
				decode = value ? decodeURIComponent : fake;
			},
			value: false
		}
	});
	
	/*Private: Constant for our own internal history event called when the page is loaded*/
	var PAGELOADEDSTRING = "DhtmlHistory_pageLoaded";
	
	/*
		Private: Pattern for title changes. Example: "Armchair DJ [@@@]" where @@@ will be relaced by values passed to add();
		Default is just the title itself, hence "@@@"
	*/
	var baseTitle = "@@@";
	
	/*Private: Placeholder variable for the original document title; will be set in ititialize()*/
	var originalTitle = document.title;
	
	/*Private: MS to wait between add requests - will be reset for certain browsers*/
	var waitTime = 200;
	
	/*Private: MS before an add request can execute*/
	var currentWaitTime = 0;

	/*Private: Our current hash location, without the "#" symbol.*/
	var currentLocation;

	/*Private: Hidden iframe used to IE to detect history changes*/
	var iframe;

	/*Private: Flags and DOM references used only by Safari*/
	var safariHistoryStartPoint, safariStack, safariLength;

	/*Private: Flag used to keep checkLocation() from doing anything when it discovers location changes we've made ourselves
	programmatically with the add() method. Basically, add() sets this to true. When checkLocation() discovers it's true,
	it refrains from firing our listener, then resets the flag to false for next cycle. That way, our listener only gets fired on
	history change events triggered by the user via back/forward buttons and manual hash changes. This flag also helps us set up
	IE's special iframe-based method of handling history changes.*/
	var ignoreLocationChange;

	/*Private: A flag that indicates that we should fire a history change event when we are ready, i.e. after we are initialized and
	we have a history change listener. This is needed due to an edge case in browsers other than IE; if you leave a page entirely
	then return, we must fire this as a history change event. Unfortunately, we have lost all references to listeners from earlier,
	because JavaScript clears out.*/
	var fireOnNewListener;

	/*Private: A variable to handle an important edge case in IE. In IE, if a user manually types an address into their browser's
	location bar, we must intercept this by calling checkLocation() at regular intervals. However, if we are programmatically
	changing the location bar ourselves using the add() method, we need to ignore these changes in checkLocation(). Unfortunately,
	these changes take several lines of code to complete, so for the duration of those lines of code, we set this variable to true.
	That signals to checkLocation() to ignore the change-in-progress. Once we're done with our chunk of location-change code in
	add(), we set this back to false. We'll do the same thing when capturing user-entered address changes in checkLocation itself.*/
	var ieAtomicLocationChange;
	
	/*Private: Create IE-specific DOM nodes and overrides*/
	var createIE = function (initialHash) {
		/*write out a hidden iframe for IE and set the amount of time to wait between add() requests*/
		waitTime = 400;/*IE needs longer between history updates*/
		var styles = myself.get("debugMode") ? {
			width: "800px",
			height: "80px",
			border: "1px solid black"
		} : hideStyles;
		iframe = $("<iframe/>").css(styles).attr({
			frameborder: "0",
			id: "jet-history-frame",
			src: myself.get("blankURL") + initialHash
		}).appendTo(body)[0];
	};
	
	/*Private: Create Opera-specific DOM nodes and overrides*/
	var createOpera = function () {
		waitTime = 400;/*Opera needs longer between history updates*/
		$("<img/>").style(hideStyles).attr("src", "javascript:location.href=\'javascript:dhtmlHistory.checkLocation();\';").appendTo(body);
	};
	
	/*Private: Create Safari-specific DOM nodes and overrides*/
	var createSafari = function () {
		var debugMode = myself.get("debugMode");
		var formStyles = debugMode ? showStyles : hideStyles;
		var stackStyles = debugMode ? {
			width: "800px",
			height: "80px",
			border: "1px solid black"
		} : hideStyles;
		var lengthStyles = debugMode ? {
			width: "800px",
			height: "20px",
			border: "1px solid black",
			margin: "0",
			padding: "0"
		} : hideStyles;
		var form = $('<form><textarea id="jet-webkit-stack">[]</textarea><input type="text" id="jet-webkit-length" value="" /></form>').attr("id", "").css(formStyles).appendTo(body);
		safariStack = form.first().css(stackStyles)[0];
		safariLength = form.last().css(lengthStyles)[0];
		if (!historyStorage.hasKey(PAGELOADEDSTRING)) {
			safariHistoryStartPoint = history.length;
			safariLength.value = safariHistoryStartPoint;
		} else {
			safariHistoryStartPoint = safariLength.value;
		}
	};
	
	/*TODO: make this public again?*/
	/*Private: Manually parse the current url for a hash; tip of the hat to YUI*/
    var getCurrentHash = function () {
		var r = window.location.href;
		var i = r.indexOf("#");
		return i >= 0 ? r.substr(i + 1) : "";
    };
    
	/*Private: Safari method to read the history stack from a hidden form field*/
	var getSafariStack = function () {
		return $.JSON.parse(safariStack.value);
	};
	
	/*Private: Safari method to read from the history stack*/
	var getSafariState = function () {
		var stack = getSafariStack();
		return stack[history.length - safariHistoryStartPoint - 1];
	};
		
	/*TODO: make this public again?*/
	/*Private: Get browser's current hash location; for Safari, read value from a hidden form field*/
	var getCurrentLocation = function () {
		return safari ? getSafariState() : getCurrentHash();
	};
	
	/*Private: Safari method to write the history stack to a hidden form field*/
	var putSafariState = function (newLocation) {
	    var stack = getSafariStack();
	    stack[history.length - safariHistoryStartPoint] = newLocation;
	    safariStack.value = historyStorage.toJSON(stack);
	};

	/*Private: Remove any leading hash that might be on a location.*/
	var removeHash = function (hashValue) {
		var r;
		if (hashValue === null || hashValue === undefined) {
			r = null;
		}
		else if (hashValue === "") {
			r = "";
		}
		else if (hashValue.length == 1 && hashValue.charAt(0) == "#") {
			r = "";
		}
		else if (hashValue.length > 1 && hashValue.charAt(0) == "#") {
			r = hashValue.substring(1);
		}
		else {
			r = hashValue;
		}
		return r;
	};

	/*Private: Notify the listener of new history changes.*/
	var fireHistoryEvent = function (newHash) {
		var decodedHash = removeHash(decode(newHash));
		/*extract the value from our history storage for this hash*/
		var historyData = historyStorage.get(decodedHash);
		var hashData = {};
		A.each(decodedHash.split("&"), function (val) {
			var parts = val.split("=");
			hashData[parts[0]] = parts[1];
		});
		/**
		 * Fires when the history changes
		 * @event change
		 * @param {Hash} hashData A hash with the URI data
		 * @param {Object} Additional data associated with the current state
		 */
		myself.changeTitle(historyData).fire("change", hashData, historyData);
	};
	
	/*Private: Get the current location of IE's hidden iframe.*/
	var getIframeHash = function () {
		var doc = iframe.contentWindow.document;
		var hash = String(doc.location.search);
		if (hash.length == 1 && hash.charAt(0) == "?") {
			hash = "";
		}
		else if (hash.length >= 2 && hash.charAt(0) == "?") {
			hash = hash.substring(1);
		}
		return hash;
	};

	/*Private: See if the browser has changed location. This is the primary history mechanism for Firefox. For IE, we use this to
	handle an important edge case: if a user manually types in a new hash value into their IE location bar and press enter, we want to
	to intercept this and notify any history listener.*/
	var checkLocation = function () {
		
		/*Ignore any location changes that we made ourselves for browsers other than IE*/
		if (!UA.ie && ignoreLocationChange) {
			ignoreLocationChange = false;
			return;
		}

		/*If we are dealing with IE and we are in the middle of making a location change from an iframe, ignore it*/
		if (!UA.ie && ieAtomicLocationChange) {
			return;
		}
		
		/*Get hash location*/
		var hash = getCurrentLocation();
		/*Do nothing if there's been no change*/
		if (hash == currentLocation) {
			return;
		}
		
		/*In IE, users manually entering locations into the browser; we do this by comparing the browser's location against the
		iframe's location; if they differ, we are dealing with a manual event and need to place it inside our history, otherwise
		we can return*/
		ieAtomicLocationChange = true;

		if (UA.ie && UA.ie < 8 && getIframeHash() != hash) {
			iframe.src = myself.get("blankURL") + hash;
		}
		else if (UA.ie) {
			/*the iframe is unchanged*/
			return;
		}

		/*Save this new location*/
		currentLocation = hash;

		ieAtomicLocationChange = false;

		/*Notify listeners of the change*/
		fireHistoryEvent(hash);
	};

	var useHashEvent = function () {
		$($.config.win).on("hashchange", function () {
			fireHistoryEvent($.config.win.location.hash);
		});
	};
	
	/*Private: For IE, tell when the hidden iframe has finished loading.*/
	HistoryNS.iframe.on("load", function (e, newLocation) {
		/*ignore any location changes that we made ourselves*/
		if (ignoreLocationChange) {
			ignoreLocationChange = false;
			return;
		}

		/*Get the new location*/
		var hash = String(newLocation.search);
		if (hash.charAt(0) == "?") {
			hash = hash.length == 1 ? "" : hash.substring(1);
		}
		/*Keep the browser location bar in sync with the iframe hash*/
		window.location.hash = hash;

		/*Notify listeners of the change*/
		fireHistoryEvent(hash);
	});

	/**
	 * @method initialize
	 * @description Initialize our DHTML history. You must call this after the page is finished loading
	 * @chainable
	 */
	this.initialize = function () {

		/*save original document title to plug in when we hit a null-key history point*/
		originalTitle = document.title;
		
		/*IE needs to be explicitly initialized. IE doesn't autofill form data until the page is finished loading, so we have to wait*/
		if (UA.ie) {
			/*If this is the first time this page has loaded*/
			if (!historyStorage.hasKey(PAGELOADEDSTRING)) {
				/*For IE, we do this in initialize(); for other browsers, we do it in create()*/
				fireOnNewListener = false;
				firstLoad = true;
				historyStorage.put(PAGELOADEDSTRING, true);
			}
			/*Else if this is a fake onload event*/
			else {
				fireOnNewListener = true;
				firstLoad = false;   
			}
		}
		return myself;
	};

	/**
	 * @method changeTitle
	 * @description Change the current HTML title
	 * @chainable
	 */
	this.changeTitle = function (historyData) {
		/*Plug the new title into the pattern*/
		/*Otherwise, if there is no new title, use the original document title. This is useful when some
		history changes have title changes and some don't; we can automatically return to the original
		title rather than leaving a misleading title in the title bar. The same goes for our "virgin"
		(hashless) page state.*/
		var winTitle = historyData && historyData.newTitle ? myself.get("baseTitle").replace('@@@', historyData.newTitle) : originalTitle;
		/*No need to do anything if the title isn't changing*/
		if (document.title == winTitle) {
			return myself;
		}
		/*Now change the DOM*/
		document.title = winTitle;
		/*Change it in the iframe, too, for IE*/
		if (UA.ie) {
			iframe.contentWindow.document.title = winTitle;
		}
		
		/*If non-IE, reload the hash so the new title "sticks" in the browser history object*/
		if (!UA.ie && !UA.opera) {
			var hash = decode(document.location.hash);
			if (hash !== "") {
				var encodedHash = encode(removeHash(hash));
				document.location.hash = encodedHash;
			}
		}
		return myself;
	};
	
	/**
	 * @method go
	 * @description Add a history point
	 * @param {String} newLocation required - This will be the #hash value in the URL. Users can bookmark it. It will persist across sessions, so
	 * your application should be able to restore itself to a specific state based on just this value. It
	 * should be either a simple keyword for a viewstate or else a pseudo-querystring.
	 * @param {Hash} historyData optional - This is for complex data that is relevant only to the current browsing session. It will be available
	 * to your application until the browser is closed. If the user comes back to a bookmarked history point
	 * during a later session, this data will no longer be available. Don't rely on it for application
	 * re-initialization from a bookmark.
	 * @param {String} historyData.newTitle optional - This will swap out the html <code><title></code> attribute with a new value. 
	 * If you have set a baseTitle using the options bundle, the value will be plugged into the baseTitle by swapping out the @@@ replacement param.
	 * @chainable
	 */
	this.go = function (newLocation, historyData) {
		
		var that = myself, newData = [];
		if (Lang.isHash(newLocation)) {
			Hash.each(newLocation, function (key, val) {
				newData.push(key + "=" + val);
			});
			newLocation = newData.join("&");
		}
		/*Escape the location and remove any leading hash symbols*/
		var encodedLocation = encode(removeHash(newLocation));
		
		if (safari) {

			/*Store the history data into history storage - pass in unencoded newLocation since
			historyStorage does its own encoding*/
			historyStorage.put(newLocation, historyData);

			/*Save this as our current location*/
			currentLocation = encodedLocation;
	
			/*Change the browser location*/
			window.location.hash = encodedLocation;
		
			/*Save this to the Safari form field*/
			putSafariState(encodedLocation);
			myself.changeTitle(historyData);

		} else {
			
			/*Most browsers require that we wait a certain amount of time before changing the location, such
			as 200 MS; rather than forcing external callers to use window.setTimeout to account for this,
			we internally handle it by putting requests in a queue.*/
			var addImpl = function () {
				
				/*Indicate that the current wait time is now less*/
				if (currentWaitTime > 0) {
					currentWaitTime = currentWaitTime - waitTime;
				}

				/*IE has a strange bug; if the encodedLocation is the same as _any_ preexisting id in the
				document, then the history action gets recorded twice; throw a programmer exception if
				there is an element with this ID*/
				if (document.getElementById(encodedLocation) && myself.get("debugMode")) {
					var e = "Exception: History locations can not have the same value as _any_ IDs that might be in the document,";
					e += " due to a bug in IE; please ask the developer to choose a history location that does not match any HTML";
					e += " IDs in this document. The following ID is already taken and cannot be a location: " + newLocation;
					throw new Error(e); 
				}

				/*Store the history data into history storage - pass in unencoded newLocation since
				historyStorage does its own encoding*/
				historyStorage.put(newLocation, historyData);

				/*Indicate to the browser to ignore this upcomming location change since we're making it programmatically*/
				ignoreLocationChange = true;

				/*Indicate to IE that this is an atomic location change block*/
				ieAtomicLocationChange = true;

				/*Save this as our current location*/
				currentLocation = encodedLocation;
				
				/*Change the browser location*/
				window.location.hash = encodedLocation;

				/*Change the hidden iframe's location if on IE*/
				if (UA.ie) {
					iframe.src = myself.get("blankURL") + encodedLocation;
				}

				/*End of atomic location change block for IE*/
				ieAtomicLocationChange = false;
				
				myself.changeTitle(historyData);
				
			};

			/*Now queue up this add request*/
			window.setTimeout(addImpl, currentWaitTime);

			/*Indicate that the next request will have to wait for awhile*/
			currentWaitTime = currentWaitTime + waitTime;
		}
		return myself;
	};
				
	/*Set up the historyStorage object; pass in options bundle*/
	historyStorage.setup({
		debugMode: myself.get("debugMode")
	});
	
	/*Get our initial location*/
	var initialHash = getCurrentLocation();

	/*Save it as our current location*/
	currentLocation = initialHash;

	if ("onhashchange" in $.config.win) {
		useHashEvent();
	} else {
		/*Create Safari/Opera-specific code*/
		if (safari) {
			createSafari();
		} else if (UA.opera) {
			createOpera();
		}
		
		/*Now that we have a hash, create IE-specific code*/
		if (UA.ie) {
			createIE(initialHash);
		}
		/*Add an unload listener for the page; this is needed for FF 1.5+ because this browser caches all dynamic updates to the
		page, which can break some of our logic related to testing whether this is the first instance a page has loaded or whether
		it is being pulled from the cache*/

		$($.config.win).on("unload", function () {
			firstLoad = null;
		});

		/*Determine if this is our first page load; for IE, we do this in this.iframeLoaded(), which is fired on pageload. We do it
		there because we have no historyStorage at this point, which only exists after the page is finished loading in IE*/
		if (UA.ie) {
			/*The iframe will get loaded on page load, and we want to ignore this fact*/
			ignoreLocationChange = true;
		} else {
			if (!historyStorage.hasKey(PAGELOADEDSTRING)) {
				/*This is our first page load, so ignore the location change and add our special history entry*/
				ignoreLocationChange = true;
				firstLoad = true;
				historyStorage.put(PAGELOADEDSTRING, true);
			} else {
				/*This isn't our first page load, so indicate that we want to pay attention to this location change*/
				ignoreLocationChange = false;
				firstLoad = false;
				/*For browsers other than IE, fire a history change event; on IE, the event will be thrown automatically when its
				hidden iframe reloads on page load. Unfortunately, we don't have any listeners yet; indicate that we want to fire
				an event when a listener is added.*/
				fireOnNewListener = true;
			}
		}

		/*Other browsers can use a location handler that checks at regular intervals as their primary mechanism; we use it for IE as
		well to handle an important edge case; see checkLocation() for details*/
		setInterval(checkLocation, 100);
	}
};
$.extend(History, $.Base);

$.History = History;