/**
 * SWFObject adapted to Jet
 * @module swf
 * @requires 
 * 
 * Copyright (c) 2011, Juan Ignacio Dopazo. All rights reserved.
 * Code licensed under the BSD License
 * https://github.com/juandopazo/jet/blob/master/LICENSE.md
*/
jet.add('swf', function ($) {

			
var FSCOMMAND_EVENT = 'FSCommand';

function makeAttrAlias(attrName) {
	return {
		setter: function(val) {
			this.set(attrName, val);
			return this.get(attrName);
		},
		getter: function() {
			return this.get(attrName);
		}
	};
}

/**
 * A widget based Flash implementation. Does not work with progressive enhancement yet
 * @class SWF
 * @extends Widget
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.SWF = $.Base.create('swf', $.Widget, [], {
	ATTRS: {
		/**
		 * @config src
		 * @description The URL of the Flash to create
		 * @required
		 */
		src: {
			required: true
		},
		/**
		 * @config swfNode
		 * @description A pointer to the Flash node
		 * @readOnly
		 */
		swfNode: {
			getter: function() {
				return this._swfNode;
			}
		},
		/**
		 * @config wmode
		 * @description Type of WMode to apply to the flash. May be 'transparent', 'window' or 'opaque'
		 * @type String
		 * @default 'transparent'
		 */
		wmode: {
			value: 'transparent'
		},
		/**
		 * @config nodeType
		 * @description Type attribute for the Flash node
		 * @type String
		 * @default 'application/x-shockwave-flash'
		 */
		nodeType: {
			value: 'application/x-shockwave-flash'
		},
		/**
		 * @config flashvars
		 * @description An object literal with variables to pass as flashvars to the SWF
		 */
		flashvars: {
			valueFn: function () {
				return {};
			},
			getter: function(vars) {
				return $.Array.map($.Object.keys(vars), function (key) { return key + '=' + escape(vars[key]); }).join('&');
			}
		},
		/**
		 * @config allowFullscreen
		 * @description Parameter to pass to the flash node that indicates if it can go into fullscreen mode or not
		 * @type Boolean
		 * @default true
		 */
		allowFullscreen: {
			value: true,
			validator: $.Lang.isBoolean,
			getter: function(val) {
				return val.toString();
			}
		},
		/**
		 * @config name
		 * @description Name SWF attribute. The SWF node's id will be the same as the name
		 */
		name: {
			valueFn: $.guid
		},
		/**
		 * @config allowScriptAccess
		 * @description allowScriptAccess SWF attribute
		 * @type String
		 * @default 'always'
		 */
		allowScriptAccess: {
			value: 'always'
		}
	},
	/**
	 * @property OBJECT_INLINE_ATTRS
	 * @description Attributes that are applied as tag attributes in an <object> instead of as <param> tags
	 * @static
	 */
	OBJECT_INLINE_ATTRS: {
		name: 1,
		id: 1,
		type: 1,
		width: 1,
		height: 1,
		data: 1
	},
	/**
	 * @property SWF_ATTRS
	 * @description Class attributes that are applied to the Flash
	 * @static
	 */
	SWF_ATTRS: {
		src: 1,
		wmode: 1,
		type: 'nodeType',
		flashvars: 1,
		allowFullscreen: 1,
		name: 1,
		movie: 'src',
		data: 'src',
		id: 'name',
		allowScriptAccess: 1,
		width: 1,
		height: 1
	}
}, {
	CONTENT_TEMPLATE: null,
	
	_getObjectString: function() {
		var str = '<object ',
			params = '';
		$.Object.each($.SWF.SWF_ATTRS, function(name, active) {
			if (active) {
				var attrName = active === 1 ? name : active;
				if ($.SWF.OBJECT_INLINE_ATTRS[name]) {
					str += name + '="' + this.get(attrName) + '"'
				} else {
					params += '<param name="' + name + '" value="' + this.get(attrName) + '">';
				}
			}
		}, this);
		str += 'style="width:' + this.get('width') + 'px;height:' + this.get('height') + 'px;"';
		return str + '>' + params + '</object>';
	},
	
	_setAttrObject: function(name, value) {
		var params = this._swfNode.children(),
			found = false;
		params.forEach(function (param) {
			if (param.getAttribute('name') === name) {
				param.setAttribute('value', value);
				found = true;
			}
		});
		if (!found) {
			$('<param/>').attr({
				name: name,
				value: value
			}).appendTo(this._swfNode);
		}
	},

	_syncSwfHeight: function(e) {
		this.setAttr(e.attrName, e.newVal);
		if (this._swfNode) {
			this._swfNode[e.attrName](e.newVal);
		}
	},
	
	/**
	 * Set a SWF attribute normalizing cross-browser behaviors.
	 * Use this to set attributes not defined as class attributes
	 * @method setAttr
	 * @param {String} name Attribute name
	 * @param {String} value
	 * @chainable
	 */
	setAttr: function(name, value) {
		if (this.get('rendered')) {
			this._setAttrObject(name, value);
		}
		return this;
	},
	/**
	 * Set multiple SWF parameters
	 * @method setAttrs
	 * @param {Object} attrs Object literal containing multiple parameters
	 * @chainable
	 */
	setAttrs: function(attrs) {
		$.Object.each(attrs, function(name, value) {
			this.setAttr(name, value);
		}, this);
		return this;
	},
	
	_relayFSCommand: function(cmd, args) {
		this.fire('fscommand', { cmd: cmd, args: args });
	},
	_attachFSCommand: function(swfNode) {
		if (swfNode.attachEvent) {
			this._fscmdHandler = $.bind(this._relayFSCommand, this);
			swfNode.attachEvent(FSCOMMAND_EVENT, this._fscmdHandler);
		} else {
			swfNode.ownerDocument.defaultView[swfNode.id + '_DoFSCommand'] = $.bind(this._relayFSCommand, this);
		}
	},
	
	_trackLoadStatus: function (swfNode) {
		var timeout,
			self = this,
			percentLoadedAvailable = true;
			loaded = false;
		try {
			swfNode.PercentLoaded();
		} catch (e) {
			percentLoadedAvailable = false;
		}
		function track() {
			if (swfNode.PercentLoaded() === 100) {
				loaded = true;
				self.fire('load');
			} else {
				timeout = setTimeout($.bind(track, self, swfNode), 50);
			}
		}
		if (percentLoadedAvailable) {
			track();
		}
		setTimeout(function () {
			if (timeout) {
				clearTimeout(timeout);
			}
			if (!loaded) {
				self.fire('load');
			}
		}, 3000);
	},
	
	initializer: function(config) {
		this.after('widthChange', this._syncSwfHeight);
		this.after('heightChange', this._syncSwfHeight);
	},
	
	renderUI: function(boundingBox, contentBox) {
		contentBox.html(this._getObjectString());
		this._swfNode = contentBox.first();
	},
	
	bindUI: function() {
		var swfNode = this._swfNode.getDOMNode();
		this._attachFSCommand(swfNode);
		//this._trackLoadStatus(swfNode);
	},
	
	syncUI: function() {
		this._swfNode.width(this.get('width')).height(this.get('height'));
	},
	
	destructor: function() {
		var swfNode = this._swfNode.getDOMNode();
		if (!swfNode.attachEvent) {
			delete swfNode.ownerDocument.defaultView[swfNode.id + '_DoFSCommand'];
		} else if (this._fscmdHandler) {
			swfNode.detachEvent(FSCOMMAND_EVENT, this._fscmdHandler);
			delete this._fscmdHandler;
		}
	}
});

			
});
