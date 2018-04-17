"use strict";

//date range for Search
var start_date = ""; //"04/11/2018 18:30";
var end_date = ""; //"04/15/2018 9:30";
var text_search = ""; //"sim stuff";

//total sims
var counter = 1;
var page = 1;

var shownItems = 0;

$("#pageBackwards").on("click", function () {
    var items = $("#dashboard-list li");
    //var shownItems = items.filter(":visible").length;
    console.log("Clicked " + items.length + "," + shownItems);

    //remove old ones
    items.slice(shownItems, shownItems + 4).addClass("hidden");

    //add new ones
    shownItems -= 4;
    if (shownItems < 0) {
        shownItems = 0;
    } else {
        page--;
    }
    items.slice(shownItems, shownItems + 4).removeClass("hidden");

    //update page
    document.getElementById('page').innerHTML = page;
});

$("#pageForward").on("click", function () {
    var items = $("#dashboard-list li");
    //var shownItems = items.filter(":visible").length;
    console.log("Clicked " + items.length + "," + shownItems);

    //remove old ones
    items.slice(shownItems, shownItems + 4).addClass("hidden");

    //add new ones
    oldshownItems = shownItems;

    if (shownItems + 8 > counter) {
        shownItems = counter - counter % 4;
    } else {
        shownItems += 4;
    }

    if (oldshownItems != shownItems) {
        page++;
    }
    items.slice(shownItems, shownItems + 4).removeClass("hidden");

    //update page
    document.getElementById('page').innerHTML = page;
});

//~~~~run once ready~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$(document).ready(function () {

    //load actual data
    load_simulation_data('-modified');

    $("#datepicker1").datepicker();
    $("#datepicker2").datepicker();
});

//add the current simulation to a map
function add_expert_to_map(object, sim_id) {
    //save map and sim data
    map_data = {
        'sim_id': sim_id
    };

    console.log("Map clicked " + JSON.stringify(map_data) + "," + object.innerHTML);

    //Do ajax
    $.ajax({
        type: "POST",
        url: "/map/" + object.name + "/settings/",
        data: {
            'sim_id': sim_id,
            'action': 'add_simulation',
            'add_layer': sim_id + "_surge"
        },
        dataType: "json",
        success: function success(result) {
            console.log("SAVING TO MAP -- SUCCESS!" + result.saved);
            //flag saved
            $.notify("Simulation saved to map " + object.innerHTML, "success");

            //jump to page
            //window.location.href = "/map/" + object.name + "/";
        },
        error: function error(result) {
            console.log("ERROR:", result);
            $.notify("Error saving simulation to map", "error");
        }
    });
}

//reload ordered data from simulation db
function reload_simulation_data(object) {
    //set selected
    $(object).parent().siblings().find('.' + "selected").removeClass("selected");
    object.classList.add("selected");

    //load data
    load_simulation_data(object.name);
}

//clear text search
function clear_text_search() {
    //clear
    document.getElementById('text_search_input').value = "";
    document.getElementById('datepicker1').value = "mm/dd/yyyy";
    document.getElementById('datepicker2').value = "mm/dd/yyyy";
    start_date = "";
    end_date = "";
    text_search = "";

    //load data
    load_simulation_data('-modified');
}

//reload with text search
function call_text_search() {

    var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;

    //test start
    if (start_date != "" && !date_regex.test(start_date)) {
        alert("Error in start date " + start_date);
    }

    //test start
    if (end_date != "" && !date_regex.test(end_date)) {
        alert("Error in end date " + end_date);
    }

    //both dates?
    if (end_date == "" && start_date != "" || end_date != "" && start_date == "") {
        alert("Please enter a start AND end date!");
    }

    //get text
    text_search = document.getElementById('text_search_input').value;

    //load data
    load_simulation_data('-modified');
}

//get date input
function get_dates(object) {
    if (object.name == "start_date") {
        start_date = object.value;
        console.log("Start " + start_date);
    } else {
        end_date = object.value;
        console.log("End " + end_date);
    }
}

//load ordered data from simulation db
function load_simulation_data(order_by) {
    $.ajax({
        type: "GET",
        url: "/store/",
        data: {
            action: "get_my_data",
            order_by: order_by,
            start_date: start_date,
            end_date: end_date,
            text_search: text_search
        },
        dataType: "json",
        success: function success(result) {

            console.log("GETTING SIMULATION -- SUCCESS! " + result.status);

            //get heatmap from S3
            if (result.status) {
                //clear current list
                document.getElementById('dashboard-list').innerHTML = "";

                //get JSON data
                //console.log(result.data[0].sim_id);
                for (i = 0; i < result.data.length; i++) {
                    //console.log(result.data[i].sim_id);

                    //setup for hidden list elements
                    var hide = "";
                    if (i > 3) {
                        hide = "hidden";
                    }

                    //counter from 1
                    count = i + 1;

                    //html to crete li
                    html = "<li class=\"" + hide + "\">\n                                <article>\n                                    <div class=\"row items-list\">\n                                        <div class=\"col-xs-12 item-info shp-info\">\n                                            <h4><div id=\"badge-" + count + "\" class=\"h-badge what-if\">H</div><span id=\"storm-" + count + "\">" + result.data[i].data.storm_type + " Run</span></h4>\n                                            <p>" + result.data[i].description + " <span class=\"owner\">by <a href=\"\">" + result.data[i].user_name + "</a></span></p>\n                                            <p class=\"shp-scenario\"><span>Sea Level Rise:</span> " + result.data[i].data.SLR + ", <span>Coastal Protection:</span> " + result.data[i].data.protection + ", <span>Tides:</span> " + result.data[i].data.tide_td + ", <span>Analysis type:</span> " + result.data[i].data.analysis + ", <span>Simulation id:</span> " + result.data[i].sim_id + "</p>\n                                            <br/>\n                                            <p class=\"actions\">\n                                                <table style=\"width: 100%;\">\n                                                    <tr>\n                                                        <td style=\"font-size: 14px;\">\n                                                            <i class=\"fa fa-calendar-o\"></i> " + result.data[i].modified + "\n                                                        </td>\n                                                        <td>\n                                                            <div class=\"dropup show pull-right\">\n                                                                <button class=\"dropdown-toggle\" style=\"margin-top: 5px;font-size: 14px;\" id=\"dropdownMenuAddToMap_" + count + "\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                                                                    Add Results to Map ... <i href=\"#\"  class=\"fa fa-caret-up\" style=\"margin-left: 10px\" aria-hidden=\"true\"></i>\n                                                                </button>\n                                                                <div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuAddToMap_" + count + "\">\n                                                                    {% for map in maps_for_user %}\n                                                                    <a style=\"padding: 2px;\" class=\"dropdown-item\" name=\"{{ map.id }}\" onclick='add_expert_to_map(this, \"" + result.data[i].sim_id + "\");'>{{ map.name }}</a>\n                                                                    <div class=\"dropdown-divider\"></div>\n                                                                    {% endfor %}\n                                                                </div>\n                                                            </div>\n                                                        </td>\n                                                    </tr>\n                                                </table>\n                                            </p>\n                                        </div>\n                                    </div>\n                                </article>\n                            </li>";

                    //add it
                    document.getElementById('dashboard-list').innerHTML += html;
                }

                //loop until end of data list
                counter = 1;
                page = 1;
                hurricanes = 0;
                noreasters = 0;

                do {
                    more_elmts = document.getElementById('badge-' + counter);

                    //if exists and checked then save
                    if (more_elmts) {
                        //change badge if Nor'easter
                        if (document.getElementById('storm-' + counter).innerHTML.indexOf("Nor'easter") >= 0) {
                            more_elmts.innerHTML = "N";
                            more_elmts.classList.remove("h-badge");
                            more_elmts.classList.add("n-badge");
                            noreasters++;
                        } else {
                            hurricanes++;
                        }

                        //increment
                        counter++;
                    }
                } while (more_elmts);

                //fix last increment
                counter--;

                //update total
                document.getElementById('total').innerHTML = counter;

                //update hurricanes
                document.getElementById('hurricanes').innerHTML = hurricanes;

                //update total
                document.getElementById('noreasters').innerHTML = noreasters;

                //update total
                document.getElementById('pagetotal').innerHTML = Math.ceil(counter / 4);
            }
        },
        error: function error(result) {
            console.log("ERROR:", result);
            //$.notify("Error loading simulation", "error");
        }
    });
}