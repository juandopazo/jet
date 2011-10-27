
/**
 * Base class for all widgets and utilities.
 * @class Base
 * @extends Attribute
 * @constructor
 * @param {Object} config Object literal specifying widget configuration properties
 */
function Base(config) {
    config = arguments[0] = config || {};
    Base.superclass.constructor.call(this, config);
    
    this.name = this.constructor.NAME;
    
    var self = this, args = arguments;
    var attachEvent = function (type, name, fn) {
        this[type](name, Lang.isString(fn) ? this[fn] : fn);
    };

    var classes = this._classes = [];
    var constructor = this.constructor;
    while (constructor !== Attribute) {
        classes.unshift(constructor);
        constructor = constructor.superclass && constructor.superclass.constructor;
    }
    
    this._handlers = [$($.config.win).on(UNLOAD, this.destroy, this)];

    $Array.forEach(['on', 'after'], function (eventType) {
        $Object.each(self.get(eventType), $.bind(attachEvent, self, eventType));
    });
    
    $Array.forEach(classes, function (constructor) {
        if (constructor.ATTRS) {
            this.addAttrs(constructor.ATTRS);
        }
        if (constructor.EVENTS) {
            $Object.each(constructor.EVENTS, $.bind(attachEvent, this, 'on'));
        }
        $Array.each(constructor.EXTS || [], function (extension) {
    		extension.apply(self, args);
            $Object.each(extension.EVENTS || {}, function (type, fn) {
                self.on(type, fn);
            });
        });
        if (constructor[PROTO].hasOwnProperty('initializer')) {
            constructor[PROTO].initializer.call(this, config);
        }
    }, this);
    this.set('initialized', true);
}
$.extend(Base, Attribute, {
    
    /**
     * Starts the destruction lifecycle
     * @method destroy
     */
    destroy: function () {
        /**
         * Preventing the default behavior will stop the destroy process
         * @event destroy
         */
        if (this.fire(DESTROY)) {
            $Array.each(this._classes, function (constructor) {
                if (constructor.prototype.hasOwnProperty('destructor')) {
                    constructor.prototype.destructor.call(this);
                }
            }, this);

            $Array.each(this._handlers, function (handler) {
                if (handler.detach) {
                    handler.detach();
                }
            });
            
            this.unbind();
        }
    }
    
}, {
    
    ATTRS: {
        /**
         * Allows quick setting of custom events in the constructor
         * @config on
         */
        on: {
            valueFn: function () {
                return {};
            }
        },
        /**
         * Allows quick setting of 'after' event listeners in the constructor
         * @config after
         */
        after: {
            valueFn: function() {
                return {};
            }
        },
        initialized: {
        	value: false
        }
    },
    
    create: function (name, superclass, extensions, attrs, proto) {
        extensions = extensions || [];
        function BuiltClass() {
            BuiltClass.superclass.constructor.apply(this, arguments);
        }
        extend(BuiltClass, superclass || $.Base, proto, attrs);
        $.mix(BuiltClass, {
            NAME: name,
            EXTS: extensions
        }, true);
        $Array.each(extensions, function (extension) {
            $.mix(BuiltClass[PROTO], extension[PROTO]);
            $Object.each(extension, function (prop, val) {
                if (!BuiltClass[prop]) {
                    BuiltClass[prop] = val;
                } else if (Lang.isObject(BuiltClass[prop]) && Lang.isObject(val)) {
                    $.mix(BuiltClass[prop], val);
                }
            });
        });
        return BuiltClass;
    }
    
});

$.Base = Base;
