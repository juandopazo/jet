
/**
 * Provides get() and set() methods, along with getters, setters and options for configuration attributres
 * @class Attribute
 * @extends EventTarget
 * @constructor
 */
var Attribute = function (classConfig) {
	Attribute.superclass.constructor.apply(this);
	classConfig = classConfig || {};
	var self = this;
	
	var attrConfig = {};
	
	function addAttr(attrName, config) {
		attrConfig[attrName] = config;
		var isValue = Lang.isValue(classConfig[attrName]);
		if (config.required && config.readOnly) {
			$.error("You can't have both 'required' and 'readOnly'");
		}
		if (config.readOnly && isValue) {
			delete classConfig[attrName];
		}
		if (config.required && !isValue) {
			$.error("Missing required attribute: " + attrName);
		}
		if (isValue && config.setter) {
			classConfig[attrName] = config.setter.call(self, classConfig[attrName]);
		}
		return self;
	}
	
	function set(attrName, attrValue) {
		attrConfig[attrName] = attrConfig[attrName] || {};
		var config = attrConfig[attrName];
		var oldValue = classConfig[attrName];
		if (!config.readOnly) {
			if (!config.validator || config.validator.call(self, attrValue)) {
				attrValue = config.setter ? config.setter.call(self, attrValue) : attrValue;
				if (!Lang.isValue(classConfig[attrName]) && config.value) {
					classConfig[attrName] = config.value;
				}
				if (attrValue !== oldValue) {
					classConfig[attrName] = classConfig[attrName] == attrValue ? attrValue :
											self.fire(attrName + "Change", attrValue, classConfig[attrName]) ? attrValue :
											classConfig[attrName];
					self.fire('after' + Lang.capitalize(attrName) + 'Change', attrValue, oldValue);
				}
			}
			if (config.writeOnce && !config.readOnly) {
				attrConfig[attrName].readOnly = true;
			}
		} else {
			$.error(attrName + " is a " + (config.writeOnce ? "write-once" : "read-only") + " attribute");
		}
	}
	
	/**
	 * Returns a configuration attribute
	 * @method get
	 * @param {String} attrName
	 */	
	this.get = function (attrName) {
		attrConfig[attrName] = attrConfig[attrName] || {};
		var config = attrConfig[attrName];
		/*
		 * If it is write-once and it wasn't set before, use the default value and mark it as written (readOnly works as written)
		 */
		if (config.writeOnce && !config.readOnly) {
			attrConfig[attrName].readOnly = true;
		}
		if (!Lang.isValue(classConfig[attrName])) {
			classConfig[attrName] = config.value;
		}
		return	config.getter ? config.getter.call(self, classConfig[attrName], attrName) :
				classConfig[attrName];
	};
	/**
	 * Sets a configuration attribute
	 * @method set
	 * @param {String} attrName
	 * @param {Object} attrValue
	 * @chainable
	 */
	this.set = function (attrName, attrValue) {
		if (Lang.isObject(attrName)) {
			Hash.each(attrName, function (name, value) {
				set(name, value);
			});
		} else {
			set(attrName, attrValue);
		}
		return self;
	};
	/**
	 * Unsets a configuration attribute
	 * @method unset
	 * @param {String} attrName
	 * @chainable
	 */
	this.unset = function (attrName) {
		delete classConfig[attrName];
		return self;
	};
	/**
	 * Adds a configuration attribute, along with its options
	 * @method addAttr
	 * @param {String} attrName
	 * @param {Hash} config
	 * @chainable
	 */
	this.addAttr = addAttr;
	/**
	 * Adds several configuration attributes
	 * @method addAttrs
	 * @param {Hash} config - key/value pairs of attribute names and configs
	 * @chainable
	 */
	this.addAttrs = function (config) {
		Hash.each(config, addAttr);
		return self;
	};
	/**
	 * Returns a key/value paired object with all attributes
	 * @method getAttrs
	 * @return {Hash}
	 */
	this.getAttrs = function () {
		var result = {};
		Hash.each(classConfig, function (key) {
			result[key] = self.get(key);
		});
		return result;
	};
	/**
	 * Returns whether an attribute is set or not
	 * @method isSet
	 * @param {String} attrName
	 * @return {Boolean}
	 */
	this.isSet = function (attrName) {
		return Lang.isValue(classConfig[attrName]);
	};
};
extend(Attribute, EventTarget);