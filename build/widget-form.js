/**
 * Provides a WidgetForm extension
 * @module widget-form
 * @requires base,form
 * 
 * Copyright (c) 2012, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('widget-form', function ($) {
"use strict";

			
$.Record2 = $.Base.create('record', $.Base, [], {
	BLACKLIST: {
		on: 1,
		after: 1,
		initialized: 1
	}
}, {
	getData: function () {
		var result = {};
		$.Object.each(this.getAttrs(), function (name, value) {
			if (!$.Record2.BLACKLIST[name]) {
				result[name] = value;
			}
		});
		return result;
	}
});

function WidgetForm(config) {
	this._formContainer = this.get('contentBox');
	
	this.data = new $.Record2();
	this.form = new $.Form(this.get("form"));
	
	this.form.each(this._linkDataToView, this);
	
	this.on('renderUI', this._wfRenderUI);
}

WidgetForm.prototype = {
	_linkDataToView: function (field) {
		var name = field.get('name');
		if (field.get('type') == $.FieldSet) {
			field.each(function (child) {
				this._linkDataToView(child);
			}, this);
		} else {
			this.data.set(name, field.get('value'));
			this.data.after(name + 'Change', this._wfOnRecordChange, field);
			field.after('valueChange', this._wfOnFieldChange, this.data);
		}
	},
	_wfOnRecordChange: function (e) {
		if (e.src != 'form') {
			this.set('value', e.newVal, { src: 'record' });
		}
	},
	_wfOnFieldChange: function (e) {
		if (e.src != 'record') {
			this.set(e.target.get('name'), e.newVal);
		}
	},
	_wfRenderUI: function () {
		this.form.render(this._formContainer);
	}
};

$.WidgetForm = WidgetForm;
			
});
