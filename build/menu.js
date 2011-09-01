/**
 * OS-like menus for navigation
 * @module menu
 * @requires base,widget-parentchild,widget-alignment
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('menu', function ($) {

			
$.MenuItem = $.Base.create('menuitem', $.Widget, [$.WidgetChild, $.WidgetParent, $.WidgetAlignment], {
	ATTRS: {
		/**
		 * @attribute labelNode
		 * @description A pointer to the node containing the label
		 * @default <span/>
		 */
		labelNode: {
			value: '<span/>',
			setter: $
		},
		/**
		 * @attribute label
		 * @description The content of the Menu's label
		 */
		label: {
			value: ''
		},
		align: {
			valueFn: function() {
				return {
					points: ['tl', 'bl'],
					offset: [0, 0]
				};
			}
		},
		constrain: {
			value: true
		},
		defaultChildType: {
			value: 'MenuItem'
		}
	}
	
}, {
	BOUNDING_TEMPLATE: '<li/>',
	CONTENT_TEMPLATE: '<a/>',
	CONTAINER_TEMPLATE: '<ul/>',
	
	_toggleContainer: function(selected) {
		this._container.toggleClass(this.getClassName('container', 'hidden'), this.size() == 0 ? true : !selected);
	},
	_updateLabel: function(content) {
		this.get('labelNode').html(content);
	},
	
	initializer: function(config) {
		this.set('labelNode', this.get('labelNode'));
		this._container = $(this.CONTAINER_TEMPLATE);
		
		this.set('childrenContainer', this._container);
		this.set('alignedNode', 'childrenContainer');
		this.get('align').node = this.get('contentBox');
		
		this.after('labelContentChange', function(e) {
			this._updateLabel(e.newVal);
		});
		this.after('selectedChange', function () {
			$.later(0, this, this._repositionUI);
		});
	},
	
	renderUI: function(boundingBox, contentBox) {
		contentBox.attr('href', '#').append(this.get('labelNode').addClass(this.getClassName('label')));
		
		this._container.addClass(this.getClassName('container')).appendTo(boundingBox);
	},
	
	bindUI: function(boundingBox, contentBox) {
		this.after('selectedChange', function(e) {
			this._toggleContainer(e.newVal);
		});
		this.on('click', function(e) {
			if (e.currentTarget === this) {
				e.domEvent.preventDefault();
				this.select();
			}
		});
	},
	
	syncUI: function() {
		this._toggleContainer(this.get('selected'));
		this._updateLabel(this.get('label'));
	}
});

$.MenuBar = $.Base.create('menubar', $.Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'MenuItem'
		}
	}
}, {
	CONTENT_TEMPLATE: '<ul/>',
	renderUI: function() {
		if (this.size() > 0) {
			this.item(0).unselect();
		}
	},
	bindUI: function(boundingBox) {
		this._handlers.push(
			$($.config.doc).on('click', function(e) {
				var selection = this.get('selection');
				if (selection && !boundingBox.contains(e.target)) {
					selection.unselect();
				}
			}, this)
		);
	}
});
$.SimpleMenu = $.Base.create('simplemenu', $.Widget, [$.WidgetParent], {
	ATTRS: {
		defaultChildType: {
			value: 'MenuItem'
		},
		multiple: {
			value: false
		}
	}
}, {
	CONTENT_TEMPLATE: '<ul/>',
	_smPreventNoSelection: function(e) {
		var selection = this.get('selection');
		if (!e.newVal && (!selection || selection === e.target)) {
			e.preventDefault();
		}
	},
	initializer: function() {
		this.after('addChild', function(e) {
			e.child.on('selectedChange', this._smPreventNoSelection, this);
		});
	}
});

			
});
