/*
 Copyright (c) 2010, Juan Ignacio Dopazo. All rights reserved.
 Code licensed under the BSD License
 http://code.google.com/p/jet-js/wiki/Licence
*/
/**
 * A TabView
 * @module tabs
 * @requires jet, lang, node, base
 */
jet().add("tabs", function ($) {
	var SELECTED = "selected";
	var Lang = $.Lang;
	var ArrayHelper = $.Array;
	
	var LI = "li",
		LABEL = "label",
		PANEL = "panel";
	
	/**
	 * A tab instance has a label and a panel
	 * @class Tab
	 * @extends Base
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
	var Tab = function () {
		Tab.superclass.constructor.apply(this);
		
		var myself = this.addAttrs({
			/**
			 * @config label
			 * @description The text to use as label
			 * @type String | LI Node
			 * @required
			 */
			label: {
				required: true,
				setter: function (value) {
					return Lang.isString(value) ? $.create(LI).append($.create("a").html(value)) : $(value);
				}
			},
			/**
			 * @config panel
			 * @description The element or text to use as a panel
			 * @type String | DOM Node
			 * @required
			 */
			panel: {
				required: true,
				setter: function (value) {
					return Lang.isString(value) ? $.create("div").html(value) : $(value);
				} 
			},
			/**
			 * @config selected
			 * @description True if this is the currently selected tab of a TabView
			 * @type Boolean
			 * @default false
			 */
			selected: {
				value: false
			}
		}).addAttrs({
			labelContent: {
				setter: function (value) {
					var label = myself.get(LABEL);
					label.children().remove();
					label.append(value);
					return value;
				}
			},
			triggerEvent: {
				value: "click"
			},
			panelContent: {
				setter: function (value) {
					var panel = myself.get(PANEL);
					panel.children().remove();
					panel.append(value);
					return value;
				}
			}
		});
		var selectHandler = function (e) {
			e.preventDefault();
			e.stopPropagation();
			myself.select();
		};
		this.get(LABEL).first().on(myself.get("triggerEvent"), selectHandler);
		this.on("triggerEventChange", function (e, oldVal, newVal) {
			this.get(LABEL).first().unbind(oldVal, selectHandler).on(newVal, selectHandler);
		});
	};
	$.extend(Tab, $.Base, {
		/**
		 * @mehtod select
		 * @description Selects this tab
		 * @param {Boolean} silent If true, the "selected" event is not fired
		 * @chainable
		 */
		select: function (silent) {
			silent = silent || false;
			var myself = this.set(SELECTED, true);
			myself.get(LABEL).addClass(SELECTED);
			myself.get(PANEL).show();
			if (!silent) {
				myself.fire(SELECTED);
			}
			return myself;
		},
		/**
		 * @mehtod unselect
		 * @description Deselects this tab
		 * @param {Boolean} silent If true, the "selected" event is not fired
		 * @chainable
		 */
		unselect: function (silent) {
			silent = silent || false;
			var myself = this.set(SELECTED, false);
			myself.get(LABEL).removeClass(SELECTED);
			myself.get(PANEL).hide();
			if (!silent) {
				myself.fire("un" + SELECTED);
			}
			return myself;
		},
		/**
		 * @method remove
		 * @description Removes this tab from the DOM
		 */
		remove: function () {
			var myself = this;
			if (myself.fire("remove")) {
				myself.get(LABEL).remove();
				myself.get(PANEL).remove();
			}
		}
	});
	
	/**
	 * A view of tabs
	 * @class TabView
	 * @extends Widget
	 * @constructor
	 * @param {Object} config Object literal specifying configuration properties
	 */
    var TabView = function () {
		TabView.superclass.constructor.apply(this, arguments);
		var myself = this;
		
		var container = myself.get("srcNode");
		myself.set("boundingBox", container);
		
        var nav, pages;
		
		var tabs = [];
		
		var onTabSelect = function (e) {
			var selectedTab = this;
			ArrayHelper.each(tabs, function (tab) {
				if (tab != selectedTab) {
					tab.unselect();
				}
			});
			/**
			 * @event tabSelect
			 * @description Fires when a tab is selected
			 * @param {Tab} selectedTab
			 */
			myself.fire("tabSelect", selectedTab);
		};
		
		var onTabRemoved = function (e) {
			tabs.splice(this.index, 1);
			if (this.selected) {
				myself.select(0);
			}
			for (var i = this.index; i < tabs.length; i++) {
				tabs[i].index = i;
			}
		};
        
		myself.on("render", function (e, node) {
			if (node) {
				myself.set("boundingBox", $(node));
			}
			nav = container.children("ul").eq(0);
	        pages = container.children("div");
			
	        if (pages.getNodes().length > 0) {
	            pages.notEq(0).hide();
	        }
			
			if (nav.getNodes().length > 0) {
				nav.children().each(function (node, i) {
					var newTab = new Tab({
						label: node,
						panel: pages.eq(i).getNode() ? pages.eq(i) : ""
					});
					newTab.index = i;
					newTab.on(SELECTED, onTabSelect);
					newTab.on("remove", onTabRemoved);
					tabs[tabs.length] = newTab;
				});
			}
			return myself;
		});
		
		/**
		 * @method add
		 * @description Adds a tab at the specified point of the list
		 * @param {Tab} tab
		 * @param {Number} index
		 * @chainable
		 */
		this.add = function (tab, index) {
			if (!(tab instanceof Tab)) {
				tab = new Tab(tab);
			}
			if (Lang.isNumber(index) && index < tabs.length - 1) {
				tab.get(LABEL).insertBefore(nav.children(index));
				tab.get(PANEL).insertBefore(pages.eq(index));
			} else {
				tab.get(LABEL).appendTo(nav);
				tab.get(PANEL).appendTo(container);
			}
			tabs.splice(index, 0, tab);
			return myself;
		};
		/**
		 * @method remove
		 * @description Removes a tab from the tabview
		 * @param {Tab} tab
		 * @chainable
		 */
		this.remove = function (tab) {
			if (Lang.isNumber(tab)) {
				tabs[tab].remove();
			} else if (tab.nodeType) {
				ArrayHelper.each(tabs, function (someTab) {
					if (someTab.label == tab || someTab.panel == tab) {
						someTab.remove();
					}
				});
			} else {
				tab.remove();
			}
			return myself;
		};
		/**
		 * @method select
		 * @description Selects a certain tab
		 * @param {Tab} tab
		 * @chainable
		 */
		this.select = function (tab) {
			if (Lang.isNumber(tab)) {
				tabs[tab].select();
			} else {
				tab.select();
			}
			return myself;
		};
		/**
		 * @method getTab
		 * @description Returns the tab in the specified position
		 * @param {Number} index
		 * @return {Tab} tab
		 */
		this.getTab = function (index) {
			return tabs[index];
		};
    };
	$.extend(TabView, $.Widget);
	
	$.add({
		Tab: Tab,
		TabView: TabView
	});
});