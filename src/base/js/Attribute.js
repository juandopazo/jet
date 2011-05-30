
/**
 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
 * @class Attribute
 * @extends EventTarget
 * @constructor
 */
function Attribute(state) {
	Attribute.superclass.constructor.apply(this, arguments);
	this._state = state || {};
	this._attrs = {};
	
	var classes = [];
	var constructor = this.constructor;
	while (constructor) {
		classes.unshift(constructor);
		constructor = constructor.superclass && constructor.superclass.constructor;
	}
	
	this._classes = classes;
	
	$Array.each(classes, function (constructor) {
		if (constructor.ATTRS) {
			this.addAttrs(constructor.ATTRS);
		}
	}, this);
}
$.extend(Attribute, EventTarget, {
	
	/**
	 * Adds a configuration attribute, along with its options
	 * @method addAttr
	 * @param {String} attrName
	 * @param {Hash} config
	 * @chainable
	 */
	addAttr: function (attrName, config) {
		this._attrs[attrName] = config;
		var state = this._state;
		var isValue = Lang.isValue(state[attrName]);
		/*if (config.required && config.readOnly) {
			$.error("You can't have both 'required' and 'readOnly'");
		}*/
		if (config.readOnly && isValue) {
			delete state[attrName];
		}
		/*if (config.required && !isValue) {
			$.error("Missing required attribute: " + attrName);
		}*/
		if (Lang.isString(config.setter)) {
			config.setter = this[config.setter];
		}
		if (Lang.isString(config.getter)) {
			config.getter = this[config.getter];
		}
		if (isValue && config.setter) {
			state[attrName] = config.setter.call(this, state[attrName]);
		}
		return this;
	},
	
	_set: function (attrName, attrValue) {
		var attrConfig = this._attrs;
		var state = this._state;
		var config = attrConfig[attrName] = attrConfig[attrName] || {};
		var oldValue = state[attrName];
		var args;
		if (!config.readOnly) {
			if (!config.validator || config.validator.call(this, attrValue)) {
				if (config.setter) {
					attrValue = config.setter.call(this, attrValue);
				}
				if (!Lang.isValue(state[attrName]) && config.value) {
					state[attrName] = oldValue = config.value;
				}
				args = {
					newVal: attrValue,
					prevVal: oldValue
				};
				if (attrValue !== oldValue && this.fire(attrName + "Change", args)) {
					state[attrName] = attrValue;
					this.fire('after' + Lang.capitalize(attrName) + 'Change', args);
				}
			}
			if (config.writeOnce && !config.readOnly) {
				attrConfig[attrName].readOnly = true;
			}
		} /*else {
			$.error(attrName + " is a " + (config.writeOnce ? "write-once" : "read-only") + " attribute");
		}*/
		return this;
	},
	/**
	 * Returns a configuration attribute
	 * @method get
	 * @param {String} attrName
	 */	
	get: function (attrName) {
		var attrConfig = this._attrs;
		var state = this._state;
		attrConfig[attrName] = attrConfig[attrName] || {};
		var config = attrConfig[attrName];
		/*
		 * If it is writstateit wasn't set before, use the default value and mark it as written (readOnly works as written)
		 */
		if (config.writeOnce && !config.readOnly) {
			attrConfig[attrName].readOnly = true;
		}
		if (!Lang.isValue(state[attrName])) {
			state[attrName] = config.value;
		}
		return config.getter ? config.getter.call(this, state[attrName], attrName) : state[attrName];
	},
	/**
	 * Sets a configuration attribute
	 * @method set
	 * @param {String} attrName
	 * @param {Object} attrValue
	 * @chainable
	 */
	set: function (attrName, attrValue) {
		var self = this;
		if (Lang.isObject(attrName)) {
			Hash.each(attrName, this._set, this);
		} else {
			this._set(attrName, attrValue);
		}
		return this;
	},
	/**
	 * Unsets a configuration attribute
	 * @method unset
	 * @param {String} attrName
	 * @chainable
	 */
	unset: function (attrName) {
		delete this._state[attrName];
		return this;
	},
	/**
	 * Adds several configuration attributes
	 * @method addAttrs
	 * @param {Hash} config - key/value pairs of attribute names and configs
	 * @chainable
	 */
	addAttrs: function (config) {
		Hash.each(config, this.addAttr, this);
		return this;
	},
	/**
	 * Returns a key/value paired object with all attributes
	 * @method getAttrs
	 * @return {Hash}
	 */
	getAttrs: function () {
		var result = {};
		var self = this;
		Hash.each(this._state, function (key) {
			result[key] = self.get(key);
		});
		return result;
	}
});

$.Attribute = Attribute;