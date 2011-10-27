jet.add('reactive-treeview', function($) {
	
	var CHILDREN_GETTER = 'getChildren',
		getClassName = $.Widget.getClassName,
		collapsedControlClass = getClassName('treenode', 'control', 'collapsed'),
		expandedControlClass = getClassName('treenode', 'control', 'expanded');
		
	function makeChildReactive(e) {
		var child = e.child,
			getChildren = this.get(CHILDREN_GETTER);
		if ($.instanceOf(child, $.Widget)) {
			child.set('setChildren', getChildren);
		} else {
			child.getChildren = getChildren;
		}
	}
	
	$.ReactiveTreeNode = $.Base.create('reactive-treenode', $.TreeNode, [], {
		ATTRS: {
			selectable: {
				valueFn: function () {
					return this.size() > 0;
				}
			},
			getChildren: {
				value: function() {}
			},
			defaultChildType: {
				value: 'ReactiveTreeNode'
			}
		}
	}, {
		
		_rtnToggleSelectable: function(e) {
			this.get('boundingBox').toggleClass(this.getClassName('selectable'), e.newVal);
		},
		
		syncChildren: function() {
			var children = this.get(CHILDREN_GETTER).call(this, this.get('id'));
			if (children) {
				this.removeAll().add(children);
			}
			return this;
		},
		
		renderUI: function(boundingBox) {
			if (this.get('selectable')) {
				boundingBox.addClass(this.getClassName('selectable'));
			}
		},
		
		initializer: function() {
			this.on('addChild', makeChildReactive);
			this.after('selectableChange', this._rtnToggleSelectable);
			this.after('selectedChange', function (e) {
				if (e.newVal) {
					this.syncChildren();
				}
			});
		},
		
		_uiTNSelectedChange: function (e) {
			var newVal = e.newVal;
			var boundingBox = this.get('boundingBox');
			var eventType = e.prevVal ? 'collapse' : 'expand';
			var controlNode = this.get('controlNode');
			var contentBox = this.get('contentBox');
			var expandedContentClass = this.getClassName('content', 'expanded'); 
			var collapsedContentClass = this.getClassName('content', 'collapsed'); 
			if (this.get('selectable') && this.fire(eventType) && this.get('root').fire("node:" + eventType, this)) {
				controlNode.toggleClass(expandedControlClass, newVal).toggleClass(collapsedControlClass, !newVal);
				contentBox.toggleClass(expandedContentClass, newVal).toggleClass(collapsedContentClass, !newVal);
			}
		}
		
	});
	
	$.ReactiveTreeView = $.Base.create('reactive-treeview', $.TreeView, [], {
		ATTRS: {
			getChildren: {
				value: function() {}
			},
			defaultChildType: {
				value: 'ReactiveTreeNode'
			}
		}
	}, {
		initializer: function() {
			this.on('addChild', makeChildReactive);
		}
	});
	
});