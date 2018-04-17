var storm_layer_dict = {}; // dictionary of layers added through active storm layer checkboxes
var update_map_layers = {}; // Dictionary of layers added through the explore scenarios box

$(document).ready(function () {
    get_rss_feed();
});

/*
Ajax call to the server. Returns JSON with layers in it.
TODO: Will need to update url
*/
function get_rss_feed() {
    console.log('Requesting RSS Feed......');
    $.ajax({
        type: "GET",
        url: simulationPath + "/metadata.json",
        data: {},
        dataType: "json",
        success: function (result) {
            console.log("RSS Feed -- SUCCESS!");
            console.log(result);
            add_active_storm_to_menu(result.active_storms)
        },
        error: function (result) {
            console.log("ERROR:", result)
        }
    });
}

/*
Function to pull the layer groups out and call the appropriate function
for layer group or layer to be added to the menu.
 */
function add_active_storm_to_menu(active_storms) {
    console.log("Adding storms to menu...");
    active_storms.forEach(function (item) {

        var camelcaseName = camelize(item.name.toLowerCase());

        var active_storm_template = $('#activeStorm').clone(true);
        $(active_storm_template).addClass(camelcaseName);
        $(active_storm_template).data("s3_base_path", item.s3_base_path);
        $(active_storm_template).find('a').attr('href', '#' + camelcaseName).attr('aria-controls', camelcaseName);
        var last_update_date = new Date(item.last_updated);
        $(active_storm_template).find('p#last_updated').text(last_update_date);

        // Set the correct badge icon for the storm type
        var badge_type = "";
        if (item.type == "H") {
            badge_type = "h-badge";
        } else if (item.type == "N") {
            badge_type = "n-badge";
        }

        $(active_storm_template).find('a#storm_link')
            .append("<i class=\"fa fa-chevron-right\" aria-hidden=\"true\"></i>")
            .append("<div id=\"storm_type\" class=\"storm_badge " + badge_type + "\">" + item.type + "</div>")
            .append(item.name)
            .append("<span title=\"Unfollow\"><i class=\"fa fa-minus-circle\" aria-hidden=\"true\" id=\"" +
                camelcaseName + "_unfollow\" onclick=\"unfollowClick($(this).parent().parent().parent().parent())\"></i></span>");

        $(active_storm_template).append("<div class=\"collapse active_storm\" id=\"" + camelcaseName + "\">\n" +
            "<ul class=\"map-layers\">\n" +
            "<div class=\"beta-feature-not-available\"><li><input type=\"checkbox\" id=\"" + camelcaseName + "_wind_field_box\" class=\"windfield_box scenario_box\" disabled onchange=\"storm_vis_check($(this), '" + camelcaseName + "')\"> Wind Field</li></div> \n" +
            "<li><input type=\"checkbox\" id=\"" + camelcaseName + "_surge_box\" class=\"surge_box scenario_box\" onchange=\"storm_vis_check($(this), '" + camelcaseName + "')\"> Surge</li>\n" +
            "<div class=\"beta-feature-not-available\"><li><input type=\"checkbox\" id=\"" + camelcaseName + "_total_run_up_box\" class=\"runup_box scenario_box\" disabled onchange=\"storm_vis_check($(this), '" + camelcaseName + "')\"> Total Run Up</li></div> </ul>" +
            "<div class=\"well plain orange scenarios\">\n" +
            "                  <h5>Explore Scenarios</h5>\n" +
            "                  <ul class=\"map-layers\">\n" +
            "                    <li class=\"explore-scenario-controls\">\n" +
            "                      <p>Sea Level Rise</p>\n" +
            "                      <div class=\"shp-controls\">\n" +
            "                        <input id=\"" + camelcaseName + "_slr_slider\" class=\"range-input sealevel " + camelcaseName + "_slr_range\" data-target=\"slr\" min=\"0\" max=\"1.5\" step=\"0.5\" value=\"0\" type=\"range\">\n" +
            "                        <input id=\"" + camelcaseName + "_input_slr\" class=\"sealevel num-input job-input " + camelcaseName + "_slr_input\" name=\"slr\" value=\"0\" type=\"text\"> m\n" +
            "                      </div>\n" +
            "                    </li>\n" +
            "                    <li class=\"explore-scenario-controls controls-" + camelcaseName + "\">\n" +
            "                      <p>Coastal Protection (e.g. dunes)</p>\n" +
            "                      <ul class=\"beta-feature-not-available one-line " + camelcaseName + "_dunes_radios\">\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_dunes\" value=\"current\" class=\"coastal_protection\" checked> Current</li>\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_dunes\" value=\"degraded\" class=\"coastal_protection\"> Degraded</li>\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_dunes\" value=\"compromised\" class=\"coastal_protection\"> Compromised</li>\n" +
            "                      </ul>\n" +
            "                    </li>\n" +
            "                    <li class=\"explore-scenario-controls controls-" + camelcaseName + "\">\n" +
            "                      <p>Tides</p>\n" +
            "                      <ul class=\"one-line " + camelcaseName + "_tide_radios\">\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_tides\" value=\"low\" class=\"tides\"> Low</li>\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_tides\" value=\"zero\" class=\"tides\" checked> Zero</li>\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_tides\" value=\"high\" class=\"tides\"> High</li>\n" +
            "                      </ul>\n" +
            "                    </li>\n" +
            "                    <li class=\"explore-scenario-controls controls-" + camelcaseName + "\">\n" +
            "                      <p>Analysis Type</p>\n" +
            "                      <ul class=\"beta-feature-not-available " + camelcaseName + "_analysis_radios\">\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_analysis\" value=\"deterministic\" class=\"analysistype\" checked> Deterministic</li>\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_analysis\" value=\"expected\" class=\"analysistype\"> Probabilistic <span>expected</span></li>\n" +
            "                        <li><input type=\"radio\" name=\"" + camelcaseName + "_analysis\" value=\"extreme\" class=\"analysistype\"> Probabilistic <span>extreme</span></li>\n" +
            "                      </ul>\n" +
            "                    </li>\n" +
            "                  </ul>\n" +
            "                  <a id=\"" + camelcaseName + "_update_btn\" class=\"btn btn-primary btn-md btn-block " + camelcaseName + "_update_button\" " +
            "onclick=\"updateMapClick('" + camelcaseName + "')\" style=\"margin-top: 30px\">Update Map</a>\n" +
            "                </div></div>");
        // Unhide the block and append to the list
        $(active_storm_template).removeClass('hidden');
        $("#activeStormGroup").append(active_storm_template);

        $('#' + camelcaseName + '_slr_slider').on('change', function () {
            $('#' + camelcaseName + '_input_slr').val($('#' + camelcaseName + '_slr_slider').val())
        });

        $('#' + camelcaseName + '_input_slr').on('keyup', function () {
            $('#' + camelcaseName + '_slr_slider').val($(this).val())
        });

        var scenario_controls = $('.controls-' + camelcaseName);
        scenario_controls.find(".sealevel").attr("disabled", true);
        scenario_controls.find(".coastal_protection").attr("disabled", true);
        scenario_controls.find(".tides").attr("disabled", true);
        scenario_controls.find(".analysistype").attr("disabled", true);
        $('#' + camelcaseName + '_update_btn').attr("disabled", true);

        // reapply the tooltip functionality since these were
        //  created asynchronously after the DOM is ready.
        $('.beta-feature-not-available').tooltip(
            {
                title: "Feature not available at this time",
                placement: "top",
                width: '300px'
            });

    });
}

/*
Function called when minus button is clicked on an active followed storm
 */
function unfollowClick(parent) {
    var storm_name = parent.attr('class');
    var classname = '.' + storm_name;

    // Hide the following active storm
    $(classname).addClass('hidden');

    // Add the unfollowed active storm
    var unfollow_storm_template = $('#unfollowActiveStorm').clone(true);
    $(unfollow_storm_template).addClass(storm_name);
    var badge_class = parent.find('div.storm_badge').attr("class");

    var badge_innerText = parent.find('div.storm_badge').text();
    $(unfollow_storm_template).find('div#unfollow-badge').addClass(badge_class).text(badge_innerText);

    var storm_name_text = parent.find('a#storm_link').clone().children() //select all the children
        .remove()   //remove all the children
        .end()  //again go back to selected element
        .text();

    unfollow_storm_template.append(storm_name_text)
        .append("<span title=\"Follow\"><i id=\"" + storm_name + "\" class=\"fa fa-plus-circle\" aria-hidden=\"true\" " +
            "onclick=\"followClick($(this))\"></i></span>")
        .append("<p class=\"follow-unfollow\">not following</p>");

    $(unfollow_storm_template).removeClass('hidden');
    $("#activeStormGroup").append(unfollow_storm_template);
    console.log("Successfully unfollowed ", storm_name_text);

    //TODO: Remove Layers from the map when unfollowing a storm?
}

/*
Function called when plus button is clicked on an active unfollowed storm
 */
function followClick(storm) {
    var storm_class_name = storm.attr('id');
    $('#activeStorm.' + storm_class_name).removeClass('hidden');
    $('#unfollowActiveStorm.' + storm_class_name).addClass('hidden');
    console.log("Successfully followed ", storm_class_name);
}

/*
Function called when Wind Field, Surge, or Total Runup checkbox is checked for an active followed storm
 */
function storm_vis_check(layer_checkbox, storm_name) {
    // update the layers displayed on the map based on checkboxes
    updateMapClick(storm_name);

    // enable/disable sliders and config options based on heatmaps that are selected
    check_scenario_map_layers(storm_name);
}

/*
Function called after Wind Field, Surge, or Total Runup checkbox is checked for an active followed storm to
determine which Explore Scenario controls should be enabled.
 */
function check_scenario_map_layers(storm_name) {
    var layers_checked = [];
    console.log("CHECKING SCENARIO LAYERS...");
    $("." + storm_name).find(".scenario_box").each(function () {
        if (this.checked) {
            layers_checked.push(this.className);
        }
    });

    var scenario_controls = $('.controls-' + storm_name);

    // determine which controls are available based on which checkboxes are checked
    if (layers_checked.length == 0) {
        scenario_controls.find(".sealevel").attr("disabled", true);
        scenario_controls.find(".coastal_protection").attr("disabled", true);
        scenario_controls.find(".tides").attr("disabled", true);
        scenario_controls.find(".analysistype").attr("disabled", true);
        $('#' + storm_name + '_update_btn').attr("disabled", true);
    } else if (layers_checked.length == 1) {
        if (layers_checked.indexOf("windfield_box scenario_box") > -1) {
            scenario_controls.find(".sealevel").attr("disabled", true);
            scenario_controls.find(".coastal_protection").attr("disabled", true);
            scenario_controls.find(".tides").attr("disabled", true);
            scenario_controls.find(".analysistype").attr("disabled", true);
            $('#' + storm_name + '_update_btn').attr("disabled", true);
        } else if (layers_checked.indexOf("surge_box scenario_box") > -1) {
            scenario_controls.find(".sealevel").attr("disabled", false);
            scenario_controls.find(".coastal_protection").attr("disabled", true);
            scenario_controls.find(".tides").attr("disabled", false);
            scenario_controls.find(".analysistype").attr("disabled", true);
            $('#' + storm_name + '_update_btn').attr("disabled", false);
        } else if (layers_checked.indexOf("runup_box scenario_box") > -1) {
            scenario_controls.find(".sealevel").attr("disabled", false);
            scenario_controls.find(".coastal_protection").attr("disabled", false);
            scenario_controls.find(".tides").attr("disabled", false);
            scenario_controls.find(".analysistype").attr("disabled", false);
            $('#' + storm_name + '_update_btn').attr("disabled", false);
        }
    } else if (layers_checked.length == 2) {
        if (layers_checked.indexOf("windfield_box scenario_box") > -1 && layers_checked.indexOf("surge_box scenario_box") > -1) {
            scenario_controls.find(".sealevel").attr("disabled", false);
            scenario_controls.find(".coastal_protection").attr("disabled", true);
            scenario_controls.find(".tides").attr("disabled", false);
            scenario_controls.find(".analysistype").attr("disabled", false);
            $('#' + storm_name + '_update_btn').attr("disabled", false);
        } else if ((layers_checked.indexOf("windfield_box scenario_box") > -1 &&
            layers_checked.indexOf("runup_box scenario_box") > -1) ||
            (layers_checked.indexOf("surge_box scenario_box") > -1 &&
                layers_checked.indexOf("runup_box scenario_box") > -1)) {
            scenario_controls.find(".sealevel").attr("disabled", false);
            scenario_controls.find(".coastal_protection").attr("disabled", false);
            scenario_controls.find(".tides").attr("disabled", false);
            scenario_controls.find(".analysistype").attr("disabled", false);
            $('#' + storm_name + '_update_btn').attr("disabled", false);
        }
    } else if (layers_checked.length == 3) {
        if (layers_checked.indexOf("windfield_box scenario_box") > -1 &&
            layers_checked.indexOf("surge_box scenario_box") > -1 &&
            layers_checked.indexOf("runup_box scenario_box") > -1) {
            scenario_controls.find(".sealevel").attr("disabled", false);
            scenario_controls.find(".coastal_protection").attr("disabled", false);
            scenario_controls.find(".tides").attr("disabled", false);
            scenario_controls.find(".analysistype").attr("disabled", false);
            $('#' + storm_name + '_update_btn').attr("disabled", false);
        }
    }
}

/*
Function called when the Update Map button is clicked in an the Explore Scenarios box of an active followed storm
 */
function updateMapClick(storm_name) {
    console.log("UPDATING " + storm_name);

    var storm_div = $("." + storm_name)

    var sea_level = $("input[id='" + storm_name + "_input_slr").val();
    var coastal_protection = $("input[name='" + storm_name + "_dunes']:checked").val();
    var tides = $("input[name='" + storm_name + "_tides']:checked").val();
    var analysis_type = $("input[name='" + storm_name + "_analysis']:checked").val();
    var s3_path = storm_div.data("s3_base_path")

    var scenario_parameters = {
        storm: storm_name,
        sea_level_rise: sea_level,
        coastal_protection: coastal_protection,
        tides: tides,
        analysis_type: analysis_type
    };

    console.log(scenario_parameters);

    //TODO: Wind Field and Total Run up sections, also this should probably be a function with a layer type parameter
    //      instead of making three repeated sections

    //Surge
    var surge_checkbox = $('#' + storm_name + '_surge_box')
    if (surge_checkbox.is(":checked")) {

        //load heatmap data
        var heatmap_url = s3_path + "surge/heatmap__slr_" + parseInt(sea_level * 10) + "__tide_" + tides + "__analysis_" + analysis_type + ".json"
        var addressPoints = (function () {
            var json = null;
            $.ajax({
                'async': false,
                'global': false,
                //'url': "{% static 'NJ-coast-heatmap/heatmap.json' %}",
                'url': heatmap_url,
                'dataType': "json",
                'success': function (data) {
                    json = data;
                }
            });
            return json;
        })();


        if (surge_checkbox.attr('id') in storm_layer_dict) {
            // remove the old layer and load a new one if surge was already being displayed
            mymap.removeLayer(storm_layer_dict[surge_checkbox.attr('id')]);
        }
        if (addressPoints) {
            storm_layer_dict[surge_checkbox.attr('id')] = create_surge_heatmap(addressPoints.runup).addTo(mymap);
        }


    } else {
        // Remove the layer toggled from this checkbox
        mymap.removeLayer(storm_layer_dict[surge_checkbox.attr('id')]);
    }

}