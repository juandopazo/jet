jet().add('combobox', function ($) {
	
	var Lang = $.Lang,
		A = $.Array,
		Widget = $.Widget;
		
	var BOUNDING_BOX = 'boundingBox',
		CONTENT_BOX = 'contentBox',
		TAB_INDEX = 'tabindex',
		INPUT = 'input',
		ROLE = 'role';
	
	$.ComboOption = Widget.create('option', [$.WidgetChild], {
		
		ATTRS: {
			
		},
		
		EVENTS: {
			
			render: function () {
				var boundingBox = this.get(BOUNDING_BOX).attr(ROLE, 'option');
			},
			afterRender: function () {
				this.get(BOUNDING_BOX).attr(TAB_INDEX, this.get('index'));
			},
			afterIndexChange: function (e, newVal) {
				this.get(BOUNDING_BOX).attr(TAB_INDEX, newVal);
			}
		}
		
	}, {
		
		BOUNDING_TEMPLATE: '<li/>',
		CONTENT_TEMPLATE: null
		
	});
	
	if (!jet.ComboBox) {
		jet.ComboBox = {};
	}
	if (!Lang.isNumber(jet.ComboBox.id)) {
		jet.ComboBox.id = 0;
	}
	
	$.ComboBox = Widget.create('combobox', [$.WidgetParent, $.WidgetAlignment], {
		
		ATTRS: {
			input: {
				setter: $,
				writeOnce: true
			},
			alignedNode: {
				value: CONTENT_BOX
			}
		},
		
		EVENTS: {
			
			render: function () {
				var contentBox = this.get(CONTENT_BOX).attr(ROLE, 'listbox');
				var boundingBox = this.get(BOUNDING_BOX).attr({
					role: 'combobox',
					'aria-expanded': 'true',
					'aria-autocomplete': 'list',
					'aria-owns': contentBox.attr('id')
				});
				var input = this.get(INPUT).on('keypress', this._comboKeyPress, this);
				input.prependTo(boundingBox);
				

			},
			
			afterAddChild: function (e, child, i) {
				if (child.get('selected')) {
					this.get(BOUNDING_BOX).attr('aria-activedescendant', child.get('id'));
				}
			}
			
		}
		
	}, {
		
		CONTENT_TEMPLATE: '<ul/>',
		INPUT_TEMPLATE: '<input/>',
		
		_comboKeyPress: function (e) {
			
			var children = this.get('children');
			var value = this.get(INPUT).value();
			
			if (value) {
				A.each(children, function (child) {
					if (child.get(CONTENT_BOX).innerHTML.indexOf(value) > -1) {
						child.show();
					} else {
						child.hide();
					}
				});
			}
			
		},
		
		initializer: function () {
			if (!this.get(INPUT)) {
				this.set(INPUT, this.INPUT_TEMPLATE);
			}
			this.get(INPUT).attr('type', 'text');
			this.set('align', {
				node: this.get(INPUT),
				align: {
					points: [$.WidgetAlignment.TopLeft, $.WidgetAlignment.BottomLeft]
				}
			});
		}
		
	});
	
});