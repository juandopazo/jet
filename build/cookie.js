jet().add('cookie', function (L) {
	L.cookie = {
	    set: function (name, value, days) {
	        var expires = "",
	            date;
	        if (days) {
	            date = new Date();
	            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	            expires = "; expires=" + date.toGMTString();
	        } 
	        document.cookie = name + "=" + value + expires + "; path=/";
	    },
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
	    remove: function (name) {
	        this.set(name, "", -1);
	    },
	    isSet: function (name) {
	        return (this.get(name) !== null);
	    }
	};
});