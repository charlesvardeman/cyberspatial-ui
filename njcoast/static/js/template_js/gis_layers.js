"use strict";

/*
Ajax call to the server. Returns JSON with layers in it.
TODO: Will need to update url to GeoServer eventually
 */
function get_gis_layers_from_server() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8000/static/gis_layers.json",
        data: {},
        dataType: "json",
        success: function success(result) {
            console.log("SUCCESS!");
            console.log(result.layers);
            process_layers(result.layers);
        },
        error: function error(result) {
            console.log("ERROR:", result);
        }
    });
}

/*
Function to pull the layer groups out and call the appropriate function
for layer group or layer to be added to the menu.
 */
function process_layers(layers) {

    layers.forEach(function (item) {
        // Get layer groups
        layer_groups.push(item.group);
    });
    layer_groups = layer_groups.unique();
    console.log(layer_groups);

    layer_groups.forEach(function (group) {
        // Add the layer category group to the menu
        add_layer_group_to_menu(group);

        // For each layer in the layers list, if the group matches the current group
        // add that layer to the unordered list
        layers.forEach(function (layer) {
            if (layer.group == group) {
                var ul_object = '#' + camelize(layer.group.toLowerCase());
                add_layer_to_menu(layer, ul_object);
            }
        });
    });
}

/*
The base #layerGroup template is hidden by default. Cloning the template and
it's children allows us to edit the attributes of each #layerGroup individually.

Attributes are formatted in the exact same way as Kristina's mockups to retain functionality.
Could likely be simplified, but camelizing the lowercase strings wasn't too difficult.
 */
function add_layer_group_to_menu(layerGroup) {
    var group_template = $('#layerGroup').clone(true);
    $(group_template).find('span').html(layerGroup);
    $(group_template).find('a').attr('href', '#' + camelize(layerGroup.toLowerCase())).attr('aria-controls', camelize(layerGroup.toLowerCase()));
    $(group_template).find('ul').attr('id', camelize(layerGroup.toLowerCase()));
    $(group_template).removeClass('hidden');
    $("#gisLayers").append(group_template);
}

/*
Add the individual layers to the menu under the appropriate layer category group.
Params: layer - the layer to add to the menu (complete layer object)
        ul_id - the id of the unordered list in which to append the layer.
 */
function add_layer_to_menu(layer, ul_id) {
    // Create the HTML <li> for each layer and append to the <ul>
    var layer_html = '<li><input id="' + $.trim(layer.id) + '" type="checkbox"> ' + $.trim(layer.name) + '</li>';
    $(ul_id).append(layer_html);
    layer.maplayer = L.tileLayer.betterWms(layer.layer_link, { layers: layer.layer, transparent: true, format: 'image/png' });
    layer_list.push(layer);

    $('#' + $.trim(layer.id)).click(function () {
        if ($(this).is(':checked')) {
            for (var i = 0; i < layer_list.length; i++) {
                if (layer_list[i].id == this.id) {
                    console.log("found matching layer: " + this.id);
                    layer_list[i].maplayer.addTo(mymap);
                }
            }
        } else {
            /* TODO: Figure out how to get layers off the map */
            for (var i = 0; i < layer_list.length; i++) {
                if (layer_list[i].id == this.id) {
                    console.log("found matching layer: " + this.id);
                    mymap.removeLayer(layer_list[i].maplayer);
                }
            }
        }
    });
}

// Add unique() to array
Array.prototype.unique = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.includes(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};

// Turn a string into camel-case. Note: If first letter of string is capitalized, will remain capitalized.
camelize = function camelize(str) {
    return str.replace(/\W+(.)/g, function (match, chr) {
        return chr.toUpperCase();
    });
};