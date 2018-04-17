'use strict';

/*
Function to pull the layer groups out and call the appropriate function
for layer group or layer to be added to the menu.
 */
function add_active_storm_to_menu(active_storms) {

    active_storms.forEach(function (item) {
        var active_storm_template = $('#activeStorm').clone(true);
        $(active_storm_template).find('span#storm_name').html(item);
    });
}