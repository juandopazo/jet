
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
