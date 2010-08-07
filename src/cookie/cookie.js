/**
 * Provides abstracion for easier use of cookies
 * @module cookie
 */
jet().add('cookie', function (L) {
	/**
	 * Provides abstracion for easier use of cookies
	 * @class Cookie
	 * @static
	 */
	L.cookie = {
		/**
		 * Sets the value of a cookie variable
		 * @method set
		 * @param {String} name
		 * @param {String} value
		 * @param {Number} optional - duration of the variable in days
		 * @chainable
		 */
	    set: function (name, value, days) {
	        var expires = "",
	            date;
	        if (days) {
	            date = new Date();
	            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	            expires = "; expires=" + date.toGMTString();
	        } 
	        document.cookie = name + "=" + value + expires + "; path=/";
	        return this;
	    },
	    /**
	     * Get the value of a cookie
	     * @method get
	     * @param {String} name
	     */
	    get: function (name) {
	        var nameEQ = name + "=",
	            ca = document.cookie.split(';'),
	            calength = ca.length,
	            c,
	            i;
	        for (i = 0; i < calength; i = i + 1) {
	            c = ca[i];
	            while (c.charAt(0) === " ") {
	                c = c.substring(1, c.length);
	            }
	            if (c.indexOf(nameEQ) === 0) {
	                return c.substring(nameEQ.length, c.length);
	            }
	        }
	        return null;
	    },
	    /**
	     * Removes a cookir
	     * @method unset
	     * @param {String} name
	     * @chainable
	     */
	    unset: function (name) {
	        return this.set(name, "", -1);
	    },
	    /**
	     * Returns whether a cookir variable is set
	     * @method isSet
	     * @param {String} name
	     */
	    isSet: function (name) {
	        return (this.get(name) !== null);
	    }
	};
});