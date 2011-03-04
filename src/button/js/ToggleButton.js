
/**
 * A button widget that selects/unselects itself when clicked
 * @class ToggleButton
 * @extends Button
 * @param {Object} config Object literal specifying widget configuration properties
 */
$.ToggleButton = Base.create('button-toggle', Button, [], {
	EVENTS: {
		click: function () {
			this.toggle();
		}
	}
});