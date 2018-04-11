/**
 * @author Chris Sweet <csweet1@nd.edu>
 *
 * @description Runs simulations on James' backend with expert choice of input parameters.
 *
 */

//unique id for this simulation, and storage for data
var sim_id = 'aimo2wqdb';
var data = null;

//counter for sim seconds
var seconds_running = 0;

//heatmap data
var addressPoints = null;

//heatmap layer
var heatmap = null;

//persistant store for cst
var sat_marker = null;
var marker, polyline;

//saved flag
var sim_saved = false;

//function to start simulation, POSTs input data to the server
function start_expert_simulation(){

    //load Latitude/Longitude
    var latitude = parseFloat(document.getElementById("latitude").value);
    var longitude = parseFloat(document.getElementById("longitude").value);

    //test
    if (isNaN(latitude) || isNaN(longitude)) {
        alert("Please enter correct value for Latitude/Longitude.");
        return;
    }

    //load Angle
    var angle = parseFloat(document.getElementById("angle").value);

    //load time to landfall
    var input_ttl = parseFloat(document.getElementById("input_ttl").value);

    //load pressure
    var input_cp = parseFloat(document.getElementById("input_cp").value);

    //load speed
    var input_vf = parseFloat(document.getElementById("input_vf").value);

    //load radius
    var input_rm = parseFloat(document.getElementById("input_rm").value);

    //load SLR
    var input_slr = parseFloat(document.getElementById("input_slr").value);

    console.log("start sim with lat " + latitude.toString() + "long " + longitude.toString());

    //disable button
    document.getElementById("calculate").classList.add("disabled");
    document.getElementById("spinner").style.display = "block";

    //create unique id to tag socket comms
    sim_id = Math.random().toString(36).substr(2, 9);

    //get tide
    var tide = document.querySelector('input[name="tide"]:checked').value;

    //get protection
    var protection = document.querySelector('input[name="protection"]:checked').value;

    //get analysis
    var analysis = document.querySelector('input[name="analysis"]:checked').value;

    //get storm type
    var storm_type = "Nor'easter";
    if(document.getElementById('stormbadge').innerHTML.indexOf("Hurricane") >= 0){
        storm_type = "Hurricane";
    }

    console.log("tide "+tide+", protection "+protection+", analysis "+analysis+", storm "+storm_type);

    data = {
      "index_SLT": [1,1],
      "index_W": 0,
      "index_prob": 1,
      "indicator": 1,
      "param": [latitude, longitude, angle, input_cp, input_vf, input_rm],
      "timeMC": input_ttl,
      "lat_track": 41.000493,
      "long_track": -72.610756,
      "SLR": input_slr,
      "tide": 0,
      "tide_td": tide,
      "protection": protection,
      "analysis": analysis,
      "storm_type": storm_type,
      "runup_file": "heatmap.json",
      "workspace_file": ""
    };

    console.log(JSON.stringify(data));

    //do Ajax
    send_expert_data_to_server(data);
}

//function to start simulation, POSTs input data to the server. Actual AJAX call
function send_expert_data_to_server(data) {
    $.ajax({
        type: "POST",
        //url: "http://dev.njcoast.us:9090/single?name=" + owner.toString() + "&id=" + sim_id,
        url: "https://staging.njcoast.us/queue/single?name=" + owner.toString() + "&id=" + sim_id,
        data: JSON.stringify(data),
        //dataType: "json",
        contentType: 'application/json',
        success: function (result) {
            console.log("EXPERT SIMULATION -- SUCCESS!", result);
            $.notify( "Calculation running", "success");

            //start checking
            setTimeout(get_expert_data_to_server, 5000);
            seconds_running = 0;

            //disable save button? #TODO And Add to map?
            document.getElementById("save_button").classList.add("disabled");
            document.getElementById("dropdownMenuAddToMap").classList.add("disabled");

            //flag that not saved
            sim_saved = false;

        },
        error: function (result) {
            console.log("EXPERT SIMULATION -- ERROR:", result)
            $.notify("Error running calculation!", "error");

            //re-enable if error
            document.getElementById("calculate").classList.remove("disabled");
            document.getElementById("spinner").style.display = "none";
        }
    });
}

//function to check status of simulation, GETs status (AJAX)
function get_expert_data_to_server() {
    $.ajax({
        type: "GET",
        //url: "http://dev.njcoast.us:9090/status?name=" + owner.toString() + "&id=" + sim_id,
        url: "https://staging.njcoast.us/queue/status?name=" + owner.toString() + "&id=" + sim_id,
        //data: data,
        dataType: "json",
        //contentType: 'application/json',
        success: function (result) {
            console.log("EXPERT SIMULATION -- SUCCESS.", result);
            //$.notify( result.annotations + " annotations saved", "success");
            //data = JSON.parse(result);
            if(result.complete == false){
                //update time
                seconds_running += 1;
                console.log("Complete FALSE, time "+seconds_running * 5+" seconds.");

                //timeout? Set to 3 minutes
                if(seconds_running > 180){
                    $.notify("Calculation timed out.", "error");

                    //re-enable button and remove spinner
                    document.getElementById("calculate").classList.remove("disabled");
                    document.getElementById("spinner").style.display = "none";
                }else{
                    //re-run if still waiting
                    setTimeout(get_expert_data_to_server, 5000);
                }

            }else if(result.complete == true){
                console.log("Complete TRUE, time "+seconds_running+" seconds.");

                //re-enable if complete
                document.getElementById("calculate").classList.remove("disabled");
                document.getElementById("spinner").style.display = "none";
                $.notify( "Calculation complete!", "success");

                //load data via Ajax
                load_expert_data_to_server();
            }
        },
        error: function (result) {
            console.log("EXPERT SIMULATION -- ERROR:", result)
            $.notify("Error running calculation.", "error");

            //re-enable if error
            document.getElementById("calculate").classList.remove("disabled");
            document.getElementById("spinner").style.display = "none";
        }
    });
}

//AJAX function to get heatmap from S3 bucket, example:
//https://s3.amazonaws.com/simulation.njcoast.us/simulation/chris/123/heatmap.json
function load_expert_data_to_server() {
    $.ajax({
        type: "GET",
        url: "https://s3.amazonaws.com/simulation.njcoast.us/simulation/" + owner.toString() + "/" + sim_id + "/heatmap.json",
        //data: data,
        dataType: "json",
        //contentType: 'application/json',
        success: function (data) {
            console.log("EXPERT SIMULATION LOAD -- SUCCESS.", data);

            //save data
            addressPoints = data;

            //add to map
            heatmap = L.heatLayer(addressPoints.runup, {max: 4, radius: 25, gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}, blur: 10}).addTo(mymap);
            $.notify( "Heatmap loaded", "success");

            //enable save button? #TODO And Add to map?
            document.getElementById("save_button").classList.remove("disabled");
            document.getElementById("dropdownMenuAddToMap").classList.remove("disabled");
        },
        error: function (data) {
            console.log("EXPERT SIMULATION LOAD -- ERROR:", data)
            $.notify("Failed to load heatmap.", "error");
        }
    });
}

//auxiliary functions to link html input devices

//slider text box updates
function updateInput(e){
    var sibling = e.previousElementSibling || e.nextElementSibling;
    sibling.value = e.value;
    e.value = sibling.value;
}

//create storm track icons
function create_storm_track(onOff){

    if (onOff) {
        //get zoom
        var arrow_length = 0.01 * Math.pow(2, 13 - mymap.getZoom());

        //load Latitude/Longitude and angle
        var latitude = parseFloat(document.getElementById("latitude").value);
        var longitude = parseFloat(document.getElementById("longitude").value);
        var angle = parseFloat(document.getElementById("angle").value) / 180 * Math.PI;

        //test current inputs
        if (isNaN(latitude) || isNaN(longitude) || isNaN(angle)) {
            alert("Please enter correct value for Latitude/Longitude.");
            return;
        }

        //disable button etc. if inputs OK
        //document.getElementById("cst").classList.add("disabled");
        document.getElementById("latitude").disabled = true;
        document.getElementById("longitude").disabled = true;
        document.getElementById("angle").disabled = true;
        document.getElementById("angleslider").disabled = true;

        // Add in a crosshair for the map
        var crosshairIcon = L.icon({
            iconUrl: '/static/images/crosshair.png',
            iconSize:     [20, 20], // size of the icon
            iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
        });

        // Add in a crosshair for the map
        var arrowIcon = L.icon({
            iconUrl: '/static/images/arrow.png',
            iconSize:     [24, 24], // size of the icon
            iconAnchor:   [12, 22], // point of the icon which will correspond to marker's location
        });

        //create markers
        //set offsets to current angle
        //note 1 degree is different for Lat/Long so need to correct
        //Latitude is fixed at around 69 miles/degree
        //Longitude is cosine(Latitude) * miles/degree at equator
        //so here cosine(40') * 69.172
        //ratio is around 0.78
        //Explaination: https://gis.stackexchange.com/questions/142326/calculating-longitude-length-in-miles
        var sat_offset_y = Math.cos(angle) * arrow_length;// * 0.78; //
        var sat_offset_x = Math.sin(angle) * arrow_length;

        // create a polyline between markers
        var latlngs = [
            [latitude, longitude],
            [latitude + sat_offset_y, longitude + sat_offset_x]
        ];
        polyline = L.polyline(latlngs, {color: 'black', weight: 2, opacity: 0.5 }).addTo(mymap);

        //create landfall marker
        marker = new L.marker([latitude,longitude], {draggable:'true', icon: crosshairIcon});
        marker.on('drag', function(event){
            //get pos
            var marker = event.target;
            var position = marker.getLatLng();

            //fix sat/line pos
            sat_marker.setLatLng(new L.LatLng(position.lat + sat_offset_y, position.lng+sat_offset_x),{draggable:'true'});
            polyline.setLatLngs([[position.lat, position.lng],[position.lat + sat_offset_y, position.lng+sat_offset_x]]);

            //update text boxes
            document.getElementById("latitude").value = position.lat.toFixed(7).toString();
            document.getElementById("longitude").value = position.lng.toFixed(7).toString();
        });
        mymap.addLayer(marker);

        //create direction marker
        sat_marker = new L.marker([latitude + sat_offset_y, longitude + sat_offset_x], {draggable:'true', rotationAngle: angle * 180 / Math.PI, icon: arrowIcon});
        sat_marker.on('drag', function(event){
            //get zoom
            var arrow_length = 0.01 * Math.pow(2, 13 - mymap.getZoom());

            //get pos
            var position = marker.getLatLng();
            var sat_pos = sat_marker.getLatLng();

            //find angle
            var angle = Math.atan2(sat_pos.lng - position.lng, sat_pos.lat - position.lat);
            sat_offset_y = Math.cos(angle) * arrow_length;// * 0.78;
            sat_offset_x = Math.sin(angle) * arrow_length;

            //constrain to circle
            sat_marker.setLatLng(new L.LatLng(position.lat + sat_offset_y, position.lng+sat_offset_x),{draggable:'true'});

            //rotate icon
            sat_marker.setRotationAngle(angle * 180/Math.PI);

            //and line
            polyline.setLatLngs([[position.lat, position.lng],[position.lat + sat_offset_y, position.lng+sat_offset_x]]);

            //update angle box
            document.getElementById("angle").value = Math.round(angle * 180/Math.PI);
            document.getElementById("angleslider").value = Math.round(angle * 180/Math.PI);

        });
        mymap.addLayer(sat_marker);
    }else{
        //if unchecked then remove and re-enable
        document.getElementById("latitude").disabled = false;
        document.getElementById("longitude").disabled = false;
        document.getElementById("angle").disabled = false;
        document.getElementById("angleslider").disabled = false;

        //remove storm tract
        mymap.removeLayer(sat_marker);
        mymap.removeLayer(marker);
        mymap.removeLayer(polyline);
        sat_marker = null;
    }
}

//update marker if valid
mymap.on('zoomend', function(event) {
    //console.log("Zoomstart "+mymap.getZoom());
    //console.log(event.target._animateToCenter.lat);

    //test if marker valid
    if(sat_marker == null){
        return;
    }

    //get zoom
    var arrow_length = 0.01 * Math.pow(2, 13 - mymap.getZoom());

    //get pos
    var position = marker.getLatLng();
    var sat_pos = sat_marker.getLatLng();

    //find angle
    var angle = Math.atan2(sat_pos.lng - position.lng, sat_pos.lat - position.lat);
    sat_offset_y = Math.cos(angle) * arrow_length;// * 0.78;
    sat_offset_x = Math.sin(angle) * arrow_length;

    //constrain to circle
    sat_marker.setLatLng(new L.LatLng(position.lat + sat_offset_y, position.lng+sat_offset_x),{draggable:'true'});

    //rotate icon
    sat_marker.setRotationAngle(angle * 180/Math.PI);

    //and line
    polyline.setLatLngs([[position.lat, position.lng],[position.lat + sat_offset_y, position.lng+sat_offset_x]]);
//}
});

//save expert simulation data
function save_simulation(){
    //normal code, has simulation run?
    if(data == null || heatmap == null){
        alert("Plase run a sumulation before saving!");
        return;
    }

    //check if sim saved
    if(sim_saved){
        alert("This simulation has been saved!");
        return;
    }

    var sim_desc = prompt("Please enter a simulation description", "Simulation " + sim_id);

    if (sim_desc == null || sim_desc == "") {
        console.log("User cancelled the prompt.");
        return;
    }

    /*//test
    //create unique id to tag socket comms
    sim_id = Math.random().toString(36).substr(2, 9);

    //preset data
    data = {
      "index_SLT": [1,1],
      "index_W": 0,
      "index_prob": 1,
      "indicator": 1,
      "param": [40.4417743, -74.1298643, 3, 75, 22, 5],
      "timeMC": 23,
      "lat_track": 41.000493,
      "long_track": -72.610756,
      "SLR": 1.0,
      "tide": 0,
      "runup_file": "heatmap.json",
      "workspace_file": ""
    };*/

    //store data
    $.ajax({
        type: "POST",
        url: "/store/",
        data: {
            'data': JSON.stringify(data),
            'user_id': owner.toString(),
            'sim_id': sim_id,
            'description': sim_desc
        },
        //dataType: "json",
        success: function(result) {
            console.log("SIMULATION STORE -- SUCCESS!");
            $.notify("Simulation data saved", "success");

            //flag saved
            sim_saved = true
        },
        error: function(result) {
            console.log("SIMULATION STORE ERROR:", result)
            $.notify("Simulation data was not saved", "error");
        }
    });

}
