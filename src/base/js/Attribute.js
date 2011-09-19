
/**
 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
 * @class Attribute
 * @extends EventTarget
 * @constructor
 */
function Attribute(state) {
	Attribute.superclass.constructor.apply(this, arguments);
	this._state = state ? $.clone(state) : {};
	this._attrs = {};
}
$.extend(Attribute, EventTarget, {
	
	/**
	 * Adds a configuration attribute, along with its options
	 * @method addAttr
	 * @param {String} attrName
	 * @param {$Object} config
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
	
	_set: function (attrName, attrValue, extraArgs) {
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
					prevVal: oldValue,
					attrName: attrName
				};
				if (Lang.isObject(extraArgs)) {
					$.mix(args, extraArgs);
				}
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
			state[attrName] = config.valueFn ? config.valueFn.call(this) : config.value;
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
	set: function (attrName, attrValue, args) {
		var self = this;
		if (Lang.isObject(attrName)) {
			$Object.each(attrName, function (name, value) {
				this._set(name, value, args);
			}, this);
		} else {
			this._set(attrName, attrValue, args);
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
	 * @param {$Object} config - key/value pairs of attribute names and configs
	 * @chainable
	 */
	addAttrs: function (config) {
		$Object.each(config, this.addAttr, this);
		return this;
	},
	/**
	 * Returns a key/value paired object with all attributes
	 * @method getAttrs
	 * @return {$Object}
	 */
	getAttrs: function () {
		var result = {};
		var self = this;
		$Object.each(this._state, function (key) {
			result[key] = self.get(key);
		});
		return result;
	}
});

$.Attribute = Attribute;