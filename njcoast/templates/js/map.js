//fix for callable js
if( annotate_map_id == null ){
    $("#save_map").addClass("disabled");
    $("#load_map").addClass("disabled");
    $("#share_map").addClass("disabled");
}

//for heatmap
var heatmap = {};

//save simulations
var simulations = [];

//disctionary of selected layers
var layers_selected = [];

//flag to stop map re-load during initialization
var initial_load = true;

/*
Base Map -- Centered on Keansburg, NJ
WMS Tile Layers
Data: Watershed Boundary Dataset - National Hydrography Overlay Map Service
      https://catalog.data.gov/dataset/usgs-national-watershed-boundary-dataset-wbd-
      downloadable-data-collection-national-geospatial-/resource/f55f881d-9de8-471f-9b6b-22cd7a98025d
XML: https://services.nationalmap.gov/arcgis/services/nhd/MapServer/WMSServer?request=GetCapabilities&service=WMS
 */
var layer_list = [];
var layer_groups = [];

L.Browser.touch = false;

// Setup Zoom Controls
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topleft',
        zoomInText: '<i class="fa fa-plus" style="line-height:1.65;"></i>',
        zoomInTitle: 'Zoom in',
        zoomOutText: '<i class="fa fa-minus" style="line-height:1.65;"></i>',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Zoom home'
    },

    onAdd: function (map) {
        var controlName = 'gin-control-zoom', container = L.DomUtil.create('div', controlName + ' leaflet-bar'), options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle, controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle, controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle, controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        this._map.setView([home_latitude, home_longitude], home_zoom);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map, className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(mymap);

// Setup Scale View
var scale_options = { metric: false, imperial: false, maxWidth: 200 };

var language = window.navigator.userLanguage || window.navigator.language;
if( language == "en-US" ){
    scale_options.imperial = true;
}else{
    scale_options.metric = true;
}

L.control.scale(scale_options).addTo(mymap);

// Setup Feature Info Click Functionality
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
      onAdd: function (map) {
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onAdd.call(this, map);
        map.on('click', this.getFeatureInfo, this);
    },

    onRemove: function (map) {
        // Triggered when the layer is removed from a map.
        //   Unregister a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onRemove.call(this, map);
        map.off('click', this.getFeatureInfo, this);
    },

    getFeatureInfo: function (evt) {
        // Make an AJAX request to the server and hope for the best
        var url = this.getFeatureInfoUrl(evt.latlng), showResults = L.Util.bind(this.showGetFeatureInfo, this);
        $.ajax({
            url: url,
            success: function (data, status, xhr) {
                var err = typeof data === 'string' ? null : data;
                //Fix for blank popup window
                var doc = (new DOMParser()).parseFromString(data, "text/html");
                if (doc.body.innerHTML.trim().length > 0)
                    showResults(err, evt.latlng, data);
            },
            error: function (xhr, status, error) {
                showResults(error);
            }
        });
    },

    getFeatureInfoUrl: function (latlng) {
        // Construct a GetFeatureInfo request URL given a point
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),

        params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            srs: 'EPSG:4326',
            styles: this.wmsParams.styles,
            transparent: this.wmsParams.transparent,
            version: this.wmsParams.version,
            format: this.wmsParams.format,
            bbox: this._map.getBounds().toBBoxString(),
            height: size.y,
            width: size.x,
            layers: this.wmsParams.layers,
            query_layers: this.wmsParams.layers,
            info_format: 'text/html'
        };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        return this._url + L.Util.getParamString(params, this._url, true);
    },

    showGetFeatureInfo: function (err, latlng, content) {
        if (err) { console.log(err); return; } // do nothing if there's an error

        // Otherwise show the content in a popup, or something.
        L.popup({ maxWidth: 800})
        .setLatLng(latlng)
        .setContent(content)
        .openOn(this._map);
    }
});

L.tileLayer.betterWms = function (url, options) {
    return new L.TileLayer.BetterWMS(url, options);
};

//~~~~run once ready~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$(document).ready(function () {

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);

    //get layers
    get_layers_from_server();

});

/*
Ajax call to the server. Returns JSON with layers in it.
TODO: Will need to update url to GeoServer eventually
 */
function get_layers_from_server() {
    $.ajax({
        type: "GET",
        url: "/api/my_layers/",
        data: {},
        dataType: "json",
        success: function (result) {
            console.log("GIS LAYERS -- SUCCESS!");
            console.log(result.layers);
            process_layers(result.layers);

            //load map settings after layers loaded #TODO maybe this should be elsewhere?
            if( annotate_map_id != null ){
                load_map();
            }
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
       layers.forEach(function (layer){
          if(layer.group == group) {
              var ul_object = '#' + camelize(layer.group.toLowerCase());
              add_layer_to_menu(layer, ul_object)
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
    $(group_template).find('a').attr('href', '#' +
        camelize(layerGroup.toLowerCase())).attr('aria-controls', camelize(layerGroup.toLowerCase()));
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
    layer.maplayer = L.tileLayer.wms(layer.layer_link, {layers: layer.layer, transparent: true, format: 'image/png'});
    layer_list.push(layer);

    $('#' + $.trim(layer.id)).click(function () {
        if ($(this).is(':checked')) {
            for(var i=0; i<layer_list.length; i++) {
                if (layer_list[i].id == this.id){
                    console.log("found matching layer: " + this.id);
                    layers_selected.push(this.id);
                    layer_list[i].maplayer.addTo(mymap);
                    if(!initial_load) map_changed();
                }
            }
        } else {
            for(var i=0; i<layer_list.length; i++) {
                if (layer_list[i].id == this.id){
                    console.log("found matching layer: " + this.id);
                    var index = layers_selected.indexOf(this.id);
                    if (index !== -1) layers_selected.splice(index, 1);
                    mymap.removeLayer(layer_list[i].maplayer);
                    if(!initial_load) map_changed();
                }
            }
        }
    });
}

$(function () {
$('.beta-feature-not-available').tooltip(
  {
    title: "Feature not available at this time",
    placement: "top",
    width: '300px'
  });
});

//load map
function load_map(){

  $.ajax({
      type: "GET",
      url: "/map/" + annotate_map_id + "/settings/",
      data: {},
      dataType: "json",
      success: function(result) {
          console.log("LOADING SETTINGS -- SUCCESS!");

          //apply settings
          apply_settings(result);
      },
      error: function(result) {
          console.log("ERROR:", result)
          $.notify("Error loading map settings", "error");
      }
  });
}

//apply stored settings to current map
function apply_settings(data){

  //test if I own the map
  if(data.owner == 'other'){
      console.log("not mine");
      //diasble save map and share
      document.getElementById("save_map").classList.add("disabled");
      document.getElementById("share_map").classList.add("disabled");
  }

  //if layers the set them
  if("layers_selected" in data){
      console.log("Layers selected length " + data.layers_selected.length);

      //setup selected layers
      for(var i=0; i<data.layers_selected.length; i++){
          //find by id, click if not checked
          if(document.getElementById(data.layers_selected[i])){
              if(!document.getElementById(data.layers_selected[i]).checked){
                document.getElementById(data.layers_selected[i]).click();//checked = true;
              }
          }else{
              //push it anyway
              layers_selected.push(data.layers_selected[i]);
          }
      }
  }

  //#load simulations
  //<li>
  //<p><input id="simulation-1" name="abcdef" type="checkbox" value="on" data-toggle="popover" data-placement="right"> abcdef</p>
  //</li>
  if("simulations" in data){
      //save sims
      simulations = data.simulations;

      //clear current data
      document.getElementById('simulation_container').innerHTML = "";

      //load sims
      for(var i=0; i<data.simulations.length; i++){
          console.log("sim "+data.simulations[i]);

          //load simulation
          load_simulation_data(data.simulations[i]);

      }
  }

  //if map view then apply
  if("latitude" in data && "longitude" in data && "zoom" in data){
      //set map parameters
      mymap.setView([data.latitude, data.longitude], data.zoom);
  }

  //load map descriptions
  if("name" in data && "description" in data){
      document.getElementById("map_name").innerHTML = data.name;
      document.getElementById("map_description").innerHTML = data.description;
  }

   //load users shared with
  if("shared_with" in data){

      //console.log("Shares "+data.shared_with[0]);
      for(var i=0; i<data.shared_with.length;i++){
          //get list of users
          var more_elmts;
          var counter = 1;

          //loop until end of list
          do{
             more_elmts = document.getElementById('sharemodal-'+counter++);

             //if exists and checked then save
             if(more_elmts){
                if(more_elmts.name == data.shared_with[i]){
                    more_elmts.checked = true;
                }
             }
          }while(more_elmts)
      }
  }

  //flag end of initial load
  initial_load = false;

}

//load simulation heatmap if clicked
function load_simulation(user_id, object){

  //if clicked, load
  if(object.checked && !(object.id in heatmap)){
      load_heatmap_from_s3(user_id, object.name, object.value, object.id)

      //add to layers if not there
      var index = layers_selected.indexOf(object.id);
      if (index == -1){
          layers_selected.push(object.id);
          if(!initial_load) map_changed();
      }
  }

  if(!object.checked && object.id in heatmap){
      mymap.removeLayer(heatmap[object.id]);
      delete heatmap[object.id];

      //remove from layers
      var index = layers_selected.indexOf(object.id);
      if (index !== -1){
          layers_selected.splice(index, 1);
          if(!initial_load) map_changed();
          console.log("Removed "+object.name+","+object.id);
      }
  }
}

//get heatmap from S3
function load_heatmap_from_s3(owner, simulation, filename, sim_type){
  $.ajax({
    type: "GET",
    url: userSimulationPath + "/" + owner + "/" + simulation + "/" + filename,
    dataType: "json",
    success: function (data) {
        console.log("EXPERT SIMULATION LOAD -- SUCCESS.");

        //save data
        var addressPoints = data;

        //get correct
        if(sim_type.includes("surge")){
            heatmap[sim_type] = create_surge_heatmap(addressPoints.surge).addTo(mymap);
        }else if(sim_type.includes("wind")){
            heatmap[sim_type] = create_wind_heatmap(addressPoints.wind).addTo(mymap);
        }else{
            //not supported
        }

        //remove heatmap loaded for production
        //$.notify( "Heatmap loaded", "success");
    },
    error: function (xhr, status, error) {
        console.log("EXPERT SIMULATION LOAD -- ERROR:", status + " " + error + " " + xhr.status + " " + xhr.statusText)
        $.notify("Failed to load heatmap.", "error");
    }
});
}

//save current map
function save_map(notify){
  //save map state
  var map_data = {
      'latitude': mymap.getCenter().lat,
      'longitude': mymap.getCenter().lng,
      'zoom': mymap.getZoom(),
      'layers_selected': layers_selected,
      'simulations': simulations
  };

  if( annotate_map_id != null ){
      map_data.map_id = annotate_map_id;
  }

  console.log("Layers "+JSON.stringify(map_data));

  $.ajax({
      type: "POST",
      url: "/map/" + annotate_map_id + "/settings/",
      data: {
          'settings': JSON.stringify(map_data),
          'action': 'save'
      },
      dataType: "json",
      success: function(result) {
          console.log("SETTING STORE -- SUCCESS!" + result.saved);
          //now auto save so dont flag
          if(notify){
            $.notify("Settings saved", "success");
          }
      },
      error: function(result) {
          console.log("ERROR:", result)
          if(notify){
              $.notify("Error saving map settings", "error");
          }
      }
  });

}

//save map sharing users
function save_shared_with(){
  //get list of users
  var more_elmts;
  var counter = 1;

  var data = [];

  //loop until end of list
  do{
      more_elmts = document.getElementById('sharemodal-'+counter++);

      //if exists and checked then save
      if(more_elmts){
          if(more_elmts.checked){
              data.push(more_elmts.name);
          }
      }
  }while(more_elmts)

  console.log("Data "+JSON.stringify(data));

  //send to backend
  $.ajax({
      type: "POST",
      url: "/map/" + annotate_map_id + "/settings/",
      data: {
          'shares': JSON.stringify(data),
          'action': 'share'
      },
      dataType: "json",
      success: function(result) {
          console.log("SETTING SHARES -- SUCCESS!" + result.saved);

          //fade out modal
          $("#shareMap-1").modal("hide");

          //now auto save so dont flag
          $.notify("Shares saved", "success");
      },
      error: function(result) {
          console.log("ERROR:", result)
          $.notify("Error saving shares", "error");
      }
  });

}

//load simulation data into storm-vis page
function load_simulation_data(sim_id){

  $.ajax({
      type: "GET",
      url: "/store/",
      data: {
          data: sim_id,
          action: "get_sim_id_data"
      },
      dataType: "json",
      success: function(result) {

          console.log("GETTING SIMULATION -- SUCCESS! ");

          //get heatmap from S3
          if(result.status){
              //get JSON data
              var data = JSON.parse(result.data.data);

              //storm heading, use newer name if exists
              var sim_heading = data.storm_type + " Run #" + result.data.id;
              if(result.data.sim_name){
                  sim_heading = result.data.sim_name;
              }

              var badge = 'n-badge';
              if(data.storm_type.toLowerCase() == "hurricane"){
                  badge = 'h-badge';
              }

              //files available to enable checkboxes
              var surge = "disabled";
              var surge_file = "";
              if(data.surge_file){
                  surge = "";
                  surge_file = data.surge_file;
              }

              var wind = "disabled";
              var wind_file = "";
              if(data.wind_file){
                  wind = "";
                  wind_file = data.wind_file;
              }
              var runup = "disabled";
              var runup_file = "";
              if(data.runup_file){
                  runup = "";
                  runup_file = data.runup_file;
              }

              var modified = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(Date.parse(result.data.modified));

              //generate html
              var html =  `<div id='${sim_id}'>
                      <div class="map-layer-group-heading what-if">
                        <a data-toggle="collapse" href="#storm-${sim_id}" aria-expanded="false" aria-controls="storm-${sim_id}">
                          <i class="fa fa-chevron-right" aria-hidden="true"></i> <div class="${badge}">${sim_heading.charAt(0)}</div>${sim_heading}<span><i class="fa fa-close" aria-hidden="true" onclick="remove_simulation('${sim_id}');"></i></span>
                        </a>
                      </div>
                      <p class="follow-unfollow">by ${result.data.user_name} • ${modified}</p>
                      <ul class="collapse map-layers" id="storm-${sim_id}">
                          <li><input id="${sim_id}_wind" name="${sim_id}" type="checkbox" value="${wind_file}" onchange="load_simulation(${result.user_id}, this);" ${wind}> Wind Field</li>
                          <li><input id="${sim_id}_surge" name="${sim_id}" type="checkbox" value="${surge_file}" onchange="load_simulation(${result.user_id}, this);" ${surge}> Surge</li>
                          <li><input id="${sim_id}_runup" name="${sim_id}" type="checkbox" value="${runup_file}" onchange="load_simulation(${result.user_id}, this);" ${runup}> Total Run Up</li>
                          <li class="shp-scenario"><span>Sea Level Rise:</span> ${data.SLR * 3.28084} ft<br/><span>Coastal Protection:</span> ${data.protection}<br/><span>Tides:</span> ${data.tide_td}<br/><span>Analysis type:</span> ${data.analysis}<br/><span>Description:</span> ${result.data.description}</li>
                      </ul>
                  </div>`;

              //add to page
              //create div
              var new_div = document.createElement('div');
              new_div.id = sim_id+'_div';
              new_div.innerHTML = html;

              //and add it to current container
              document.getElementById('simulation_container').appendChild(new_div);

              //enable buttons? surge
              var index = layers_selected.indexOf(sim_id+"_surge");
              if (index !== -1){
                  console.log("found "+sim_id);
                  //document.getElementById(sim_id+"_surge").checked = true;
                  document.getElementById(sim_id+"_surge").click();
              }else{
                  console.log("not found "+sim_id+","+layers_selected.length);
              }

              //enable buttons? wind
              index = layers_selected.indexOf(sim_id+"_wind");
              if (index !== -1){
                  console.log("found "+sim_id);
                  document.getElementById(sim_id+"_wind").click();
              }else{
                  console.log("not found "+sim_id+","+layers_selected.length);
              }

              //#TODO runup?
          }
      },
      error: function(result) {
          console.log("ERROR:", result)
          $.notify("Error loading simulation", "error");
      }
  });


}

//remove simulation from storm vis
function remove_simulation(name){
  //get element containing sim data
  var element = document.getElementById(name);

  //remove it
  element.outerHTML = "";

  //remove from list
  var index = simulations.indexOf(name);
  if (index > -1) {
      simulations.splice(index, 1);
  }

  //now remove from database
  //Do ajax
  $.ajax({
      type: "POST",
      url: "/map/" + annotate_map_id + "/settings/",
      data: {
          'sim_id': name,
          'action': 'remove_simulation'
      },
      dataType: "json",
      success: function(result) {
          console.log("REMOVING FROM MAP -- SUCCESS!" + result.saved);

          if(!initial_load) map_changed();

          //now auto save so dont flag
          $.notify("Simulation removed from map " + name, "success");
      },
      error: function(result) {
          console.log("ERROR:", result)
          $.notify("Error removing simulation from map", "error");
      }
  });
}

//function to track map changes and save
function map_changed(){
    save_map(false);
    //console.log("Map has changed");
}

//update map changed with zoom
mymap.on('zoomend', function (event) {
    if(!initial_load) map_changed();
    //console.log("Map has zoomed");
});

mymap.on('dragend', function() {
    //console.log("Map has panned");
    if(!initial_load) map_changed();
});
