jet().add("tabs", function ($) {
	var SELECTED = "selected";
	var Lang = $.Lang;
	var ArrayHelper = $.Array;
	
	var TRUE = true,
		FALSE = false;
	
	var LI = "li",
		LABEL = "label",
		PANEL = "panel";
	
	var Tab = function () {
		Tab.superclass.constructor.apply(this);
		var myself = this;
		
		myself.addAttrs({
			label: {
				required: TRUE,
				setter: function (value) {
					return Lang.isString(value) ? $.create(LI).append($.create("a").html(value)) : $(value);
				}
			},
			panel: {
				required: TRUE,
				setter: function (value) {
					return Lang.isString(value) ? $.create("div").html(value) : $(value);
				} 
			},
			selected: {
				value: FALSE
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
			panelContent: {
				setter: function (value) {
					var panel = myself.get(PANEL);
					panel.children().remove();
					panel.append(value);
					return value;
				}
			}
		}).get(LABEL).first().on("click", function (e) {
			e.preventDefault();
			e.stopPropagation();
			myself.select();
		});
	};
	$.extend(Tab, $.Attribute, {
		select: function (silent) {
			silent = silent || FALSE;
			var myself = this.set(SELECTED, TRUE);
			myself.get(LABEL).addClass(SELECTED);
			myself.get(PANEL).show();
			if (!silent) {
				myself.fire(SELECTED);
			}
			return myself;
		},
		unselect: function (silent) {
			silent = silent || FALSE;
			var myself = this.set(SELECTED, FALSE);
			myself.get(LABEL).removeClass(SELECTED);
			myself.get(PANEL).hide();
			if (!silent) {
				myself.fire("un" + SELECTED);
			}
			return myself;
		},
		remove: function () {
			var myself = this;
			if (myself.fire("remove")) {
				myself.get(LABEL).remove();
				myself.get(PANEL).remove();
			}
		}
	});
	
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
		this.select = function (tab) {
			if (Lang.isNumber(tab)) {
				tabs[tab].select();
			} else {
				tab.select();
			}
			return myself;
		};
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