/**
 * @author Chris Sweet/Caleb Reinking <csweet1@nd.edu>
 *
 * @description Utilizes Leatlet Edit tools and DJango Chennels to implement map annotations and sharing.
 *
 */

//create socket variable for comms
var socket;

//create unique id to tag socket comms
var myid = Math.random().toString(36).substr(2, 9);

//~~~~create layer group to add marker~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var annotationLayer = new L.LayerGroup();
mymap.editTools.featuresLayer = annotationLayer;

//~~~~annotate controls~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
L.EditControl = L.Control.extend({

    options: {
        position: 'topleft',
        callback: null,
        kind: '',
        html: ''
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);

        link.href = '#';
        link.title = 'Create a new ' + this.options.kind;
        link.innerHTML = this.options.html;
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function() {
                window.LAYER = this.options.callback.call(map.editTools);
            }, this);

        return container;
    }

});

L.NewLineControl = L.EditControl.extend({

    options: {
        position: 'topleft',
        callback: mymap.editTools.startPolyline,
        kind: 'line',
        html: '<span class="fas fa-share-alt"></span>'
    }

});

L.NewPolygonControl = L.EditControl.extend({

    options: {
        position: 'topleft',
        callback: mymap.editTools.startPolygon,
        kind: 'polygon',
        html: '<span class="far fa-object-ungroup"></span>'
    }

});

L.NewMarkerControl = L.EditControl.extend({

    options: {
        position: 'topleft',
        callback: mymap.editTools.startMarker,
        kind: 'marker',
        html: '<span class="fas fa-map-marker-alt"></span>'
    }

});

L.NewRectangleControl = L.EditControl.extend({

    options: {
        position: 'topleft',
        callback: mymap.editTools.startRectangle,
        kind: 'rectangle',
        html: '<span class="far fa-square"></span>'
    }

});

L.NewCircleControl = L.EditControl.extend({

    options: {
        position: 'topleft',
        callback: mymap.editTools.startCircle,
        kind: 'circle',
        html: '<span class="far fa-circle"></span>'
    }

});

var marker_control = new L.NewMarkerControl();
var line_control = new L.NewLineControl();
var polygon_control = new L.NewPolygonControl();
var rectangle_control = new L.NewRectangleControl();
var circle_control = new L.NewCircleControl();

//~~~~popup editor scheme~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//html for popup
function load_popup_html(text, length){
    return `<span style="display:block;" id="txt">${text}</span>
    <input onchange="finishedEdit()" id="txtB" type="text" value="${text}" style="display:none;" size="${length}"/>
    <button type="button" class="btn btn-default btn-xs" onclick="startEdit()"><span class="fas fa-pencil-alt fa-fw"></span></button>
    <button type="button" class="btn btn-default btn-xs" onclick="deleteObject()"><span class="fas fa-trash-alt"></span></button>`;
}

//current marker
var current_popup_marker = null;
var current_popup = null;

//get the current popup for update
mymap.on('popupopen', function(e) {
    console.log("popup open");
    current_popup = e.popup;
    current_popup_marker = e.popup._source;
});

//functions called from popup html

//remove object
function deleteObject() {
    //local
    annotationLayer.removeLayer(current_popup_marker);

    //remote
    if(annotate_map_id) {
        socket_frame = {
            type: 'delete',
            data: {
                id: current_popup_marker.myCustomID
            }
        }
        socket.send(JSON.stringify(socket_frame));

        //#TODO need to delete this object from the database!
        var all_json = "{\n\t\"objects\": [";
        all_json += JSON.stringify(socket_frame);
        all_json += "\n\t]\n}";

        console.log("Send for delete"+all_json);

        //send to the server to delete
        send_annotation_to_server(all_json, 'delete');

    }

    console.log("Delete " + current_popup_marker.myCustomID);
}

function startEdit() {
    document.getElementById("txtB").style.display = "block";
    document.getElementById("txt").style.display = "none";
    current_popup._updateLayout();
}

function finishedEdit() {
    document.getElementById("txtB").style.display = "none";
    document.getElementById("txt").style.display = "block";
    document.getElementById("txt").innerHTML = document.getElementById("txtB").value;

    //force new content
    current_popup_marker.setPopupContent(load_popup_html(document.getElementById("txtB").value, document.getElementById("txtB").value.length));

    if(annotate_map_id) {
        socket_frame = {
            owner: owner,
            myid: myid,
            type: 'popup',
            data: {
                id: current_popup_marker.myCustomID,
                text: document.getElementById("txtB").value
            }
        }
        socket.send(JSON.stringify(socket_frame));

        //save updated text
        save_annotation_element(current_popup_marker);
    }
}

//~~~~hooks into the editable module~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//called on object create
mymap.on('editable:created', function(e) {
    //set new objects id
    e.layer.myCustomID = Math.random().toString(36).substr(2, 9);
    e.layer.owned = true;

    //add popup
    e.layer.bindPopup(load_popup_html("Input text ...", "8"));
    e.layer.on('click', function(e) {
        this.openPopup();
    });

    //test if marker
    if (e.layer instanceof L.Marker) {
        console.log("Its a Marker, " + e.layer.myCustomID);
    }
    console.log("created");
});

//called after object dragged
mymap.on('editable:dragend', function(e) {
    //auto save?
    if(annotate_map_id) {
        save_annotation_element(e.layer);
    }
    console.log("dragged");
});

// called while object is being edited
mymap.on('editable:editing', function(e) {
    if(annotate_map_id) {
        //test if annotation object and send
        annotation_jason = annotation_update(e.layer);
        if (annotation_jason != null) {
            socket.send(annotation_jason);

            //auto save
            save_annotation_element(e.layer);
        }
    }

    console.log("editing");
});

//called at the end of editing
mymap.on('editable:drawing:end', function(e) {
    if(annotate_map_id) {

        //test if annotation object and send
        annotation_jason = annotation_update(e.layer);
        if (annotation_jason != null) {
            socket.send(annotation_jason);

            //auto save
            save_annotation_element(e.layer);
        }
    }
    console.log("editable:drawing:end, edited");
});

//called while object being dragged
mymap.on('editable:drag', function(e) {
    if(annotate_map_id) {

        //test if annotation object and send
        annotation_jason = annotation_update(e.layer);
        if (annotation_jason != null) {
            socket.send(annotation_jason);
        }

    }
    console.log("editable:drag");
});

//called when object disabled
mymap.on('editable:disable', function(e) {
    console.log("editable:disable");
});

//update annotation objects
function annotation_update(e_layer) {
    var type = null;
    var data;

    //polygon or rectangle
    if (e_layer instanceof L.Polygon) {
        type = 'polygon';

        LatLngs = e_layer.getLatLngs();
        console.log("Polygon," + e_layer.myCustomID + "," + LatLngs[0]);

        //convert LatLng data so can use stringify
        var lldata = [];
        for (i = 0; i < LatLngs[0].length; i++) {
            localdata = new Array(LatLngs[0][i].lat, LatLngs[0][i].lng);
            lldata.push(localdata);
        }

        //set data
        data = {
            id: e_layer.myCustomID,
            points: JSON.stringify(lldata)
        }

        console.log("JSON " + JSON.stringify(lldata));
    }

    //polyline
    if (!(e_layer instanceof L.Polygon) && !(e_layer instanceof L.Rectangle) &&
        e_layer instanceof L.Polyline) {
        //type
        type = 'polyline';

        LatLngs = e_layer.getLatLngs();
        console.log("Polyline," + e_layer.myCustomID + "," + LatLngs[0]);

        //convert LatLng data so can use stringify
        var lldata = [];
        for (i = 0; i < LatLngs.length; i++) {
            localdata = new Array(LatLngs[i].lat, LatLngs[i].lng);
            lldata.push(localdata);
        }

        //set data
        data = {
            id: e_layer.myCustomID,
            points: JSON.stringify(lldata)
        }

        console.log("JSON " + JSON.stringify(lldata));
    }

    //marker
    if (e_layer instanceof L.Marker) {
        //type
        type = 'marker';

        //set data
        data = {
            id: e_layer.myCustomID,
            latitude: e_layer.getLatLng().lat,
            longitude: e_layer.getLatLng().lng
        }
    }

    //circle
    if (e_layer instanceof L.Circle) {
        //type
        type = 'circle';

        //set data
        data = {
            id: e_layer.myCustomID,
            latitude: e_layer.getLatLng().lat,
            longitude: e_layer.getLatLng().lng,
            radius: e_layer.getRadius()
        }
    }

    if (type == null) {
        return null;
    }

    //get popup text
    popuptext = e_layer.getPopup().getContent();
    pos1 = popuptext.indexOf("id=\"txt\">") + 9;
    pos2 = popuptext.indexOf("</span>");

    //craeat JSON package and send
    socket_frame = {
        owner: owner,
        myid: myid,
        type: type,
        text: popuptext.substring(pos1, pos2),
        data: data
    }
    return JSON.stringify(socket_frame);
}

//~~~~run once ready, but after the one called in map.html~~~~~~~~~~~~~~~~~~~~~~
    $(document).ready(function() {
            //add annotation layer
            annotationLayer.addTo(mymap);

            //load current annotations
            if(annotate_map_id){
                get_annotations_from_server();
            }

            // Note that the path doesn't matter right now; any WebSocket
            // connection gets bumped over to WebSocket consumers
            if(annotate_map_id) {
                websocket_protocol = window.location.protocol.includes("https") ? "wss://" : "ws://";
                socket = new WebSocket(websocket_protocol + window.location.host + "/map-socket/" + annotate_map_id + "/");
                socket.onmessage = function(e) {
                    //onMapClick(e.data);
                    // alert('received socket');
                    console.log(e.data)
                    socket_object = JSON.parse(e.data)
                    console.log(socket_object)

                    //update if we are not the annotator #TODO how to enforce? Or many to many?
                    //now just ignore comms from myself
                    if (socket_object.myid != myid) {
                        //find if adding or modifying objects
                        var object = null;
                        annotationLayer.eachLayer(function(layer) {
                            // layer.feature is probably defined, to create marker, do something like this
                            if (layer.myCustomID == socket_object.data.id) {
                                console.log("Found " + layer.myCustomID);
                                object = layer;
                            }
                        });
                        if (object == null) {
                            //set coloring according to owner
                            var color_param = {};
                            var icon_param = {};
                            if (socket_object.owner != owner) {
                                color_param = {
                                    color: '#C92D40'
                                };
                                icon_param = {
                                    icon: redIcon
                                };
                            }
                            //need to create object here
                            var newobject = null;
                            console.log("Objects " + socket_object.type);
                            //create
                            if (socket_object.type == 'marker') {
                                newobject = L.marker([socket_object.data.latitude, socket_object.data.longitude], icon_param);
                            } else if (socket_object.type == 'polygon' || socket_object.type == 'polyline') {
                                console.log("Points " + socket_object.data.points);
                                var points = JSON.parse(socket_object.data.points);
                                //console.log("Points " + points.length + "," + points[0][0]);
                                if (socket_object.type == 'polyline') {
                                    newobject = L.polyline(points, color_param);
                                } else {
                                    newobject = L.polygon(points, color_param);
                                }
                            } else if (socket_object.type == 'circle') {
                                newobject = L.circle([socket_object.data.latitude, socket_object.data.longitude], socket_object.data.radius, {
                                    color: '#C92D40'
                                });
                            }

                            //set id and add to layer
                            if (newobject != null) {
                                newobject.myCustomID = socket_object.data.id;
                                newobject.owned = false;

                                //add to layer
                                annotationLayer.addLayer(newobject);

                                var popup_text = socket_object.data.text;

                                //do I own it? if so editable
                                if (socket_object.owner == owner) {
                                    //setup popup for editing
                                    if (popup_text == null) {
                                        popup_text = "Input text ...";
                                    }

                                    var popup_text = load_popup_html(popup_text, popup_text.length);

                                    newobject.enableEdit(); //editing
                                    newobject.owned = true;
                                }

                                if (popup_text == null) {
                                    popup_text = "Undefined";
                                }

                                //setup popup
                                newobject.bindPopup(popup_text);
                                newobject.on('click', function(e) {
                                    this.openPopup();
                                });
                            }
                        } else {
                            //modify or delete
                            if (socket_object.type == 'delete') {
                                annotationLayer.removeLayer(object);
                            } else if (socket_object.type == 'marker') {
                                object.setLatLng([socket_object.data.latitude, socket_object.data.longitude]);
                            } else if (socket_object.type == 'polygon' || socket_object.type == 'polyline') {
                                var points = JSON.parse(socket_object.data.points);
                                object.setLatLngs(points);
                            } else if (socket_object.type == 'circle') {
                                object.setLatLng([socket_object.data.latitude, socket_object.data.longitude]);
                                object.setRadius(socket_object.data.radius);
                            } else if (socket_object.type == 'popup') {
                                //add editing if I own it!
                                if (socket_object.owner != owner) {
                                    object.setPopupContent(socket_object.data.text);
                                } else {
                                    object.setPopupContent(load_popup_html(socket_object.data.text, socket_object.data.text.length));
                                }
                            }
                        }

                    }
                }
                socket.onopen = function() {
                    //socket.send("joining map annotation for map " + annotate_map_id);
                }
                // Call onopen directly if socket is already open
                if (socket.readyState == WebSocket.OPEN) socket.onopen();
            }
        });

        //~~~~map annotation section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //toggle layer
        function toggle_annotation_layer(onOff) {

            if (onOff) {
                annotationLayer.addTo(mymap);
            } else {
                //lose annotation tools if we turn off the layer
                if(document.getElementById("show_annotate").innerHTML == "Hide Annotation Tools"){
                    toggle_annotate();
                }
                mymap.removeLayer(annotationLayer);
            }
            console.log(onOff);
        }

        //toggle annotate controls
        function toggle_annotate() {

            if (document.getElementById("show_annotate").innerHTML == "Show Annotation Tools") {
                mymap.addControl(marker_control);
                mymap.addControl(line_control);
                mymap.addControl(polygon_control);
                mymap.addControl(rectangle_control);
                mymap.addControl(circle_control);

                //enable map save
                //$("#save_map").removeClass("disabled");
                //$("#load_map").removeClass("disabled");

                //toggle button message
                document.getElementById("show_annotate").innerHTML = "Hide Annotation Tools";
            } else {
                mymap.removeControl(marker_control);
                mymap.removeControl(line_control);
                mymap.removeControl(polygon_control);
                mymap.removeControl(rectangle_control);
                mymap.removeControl(circle_control);

                //disable map save
                //$("#save_map").addClass("disabled");
                //$("#load_map").addClass("disabled");

                //toggle button message
                document.getElementById("show_annotate").innerHTML = "Show Annotation Tools";
            }
            //console.log(onOff);

            //stop button href
            return false;
        }

        //save single annotation object
        function save_annotation_element(layer) {
            console.log("save single");

            var all_json = "{\n\t\"objects\": [";
            var add_comma = false;

            //annotation elements add
            //container for JSON
            var json_string = "";

            //look for objects
            annotation_jason = annotation_update(layer);
            if (annotation_jason != null) {
                json_string += annotation_jason;
            }

            console.log(json_string);
            if (json_string.length > 1) {
                all_json += json_string;
                add_comma = true;
            }

            all_json += "\n\t]\n}";
            console.log(all_json);

            //send to the server
            send_annotation_to_server(all_json, 'save');
        }

        //save annotation
        function save_annotation_elements() {
            console.log("save");

            var all_json = "{\n\t\"objects\": [";
            var add_comma = false;

            //loop over the annotation elements
            annotationLayer.eachLayer(function(layer) {
                console.log("Found " + layer.myCustomID + ", " + layer.owned);

                if (add_comma) {
                    all_json += ",\n\t\t";
                }

                //container for JSON
                var json_string = "";

                //look for objects
                annotation_jason = annotation_update(layer);
                if (annotation_jason != null) {
                    json_string += annotation_jason;
                }

                console.log(json_string);
                if (json_string.length > 1) {
                    all_json += json_string;
                    add_comma = true;
                }
            });

            all_json += "\n\t]\n}";
            console.log(all_json);

            //send to the server
            send_annotation_to_server(all_json, 'save');
        }

        //AJAX stuff to send JSON to server (as the name implies)
        function send_annotation_to_server(data, action) {
            $.ajax({
                type: "POST",
                url: "/map/" + annotate_map_id + "/annotations/",
                data: {
                    'data': data,
                    'action': action
                },
                dataType: "json",
                success: function(result) {
                    console.log("ANNOTATION STORE -- SUCCESS!");
                    //now auto save so dont flag
                    //$.notify(result.annotations + " annotations saved", "success");
                },
                error: function(result) {
                    console.log("ERROR:", result)
                    $.notify("Error saving map annotations", "error");
                }
            });
        }

        //load JSON version of annotation data into layers
        function load_annotation_elements(json_from_server) {
            var json = "{\"objects\": [{\"type\":\"marker\",\"text\":\"Nikolai's lair\",\"data\":{\"id\":\"u2lj6ycim\",\"latitude\":39.894089941326044,\"longitude\":-74.12595748901369}},{\"type\":\"polygon\",\"text\":\"Polygon of fear\",\"data\":{\"id\":\"t8vo6pn5u\",\"points\":\"[[39.91726592255928,-74.12509918212892],[39.904230397797335,-74.12458419799806],[39.91199934253401,-74.13368225097658]]\"}}]}";
            var parsed = json_from_server;

            console.log(parsed.objects.length);

            //loop over objects
            for (i = 0; i < parsed.objects.length; i++) {
                //get object
                socket_object = parsed.objects[i];
                console.log("IDs "+socket_object.owner+","+owner);

                //set coloring according to owner
                var color_param = {};
                var icon_param = {};
                if (socket_object.owner != owner) {
                    color_param = {
                        color: '#C92D40'
                    };
                    icon_param = {
                        icon: redIcon
                    };
                }

                //create
                if (socket_object.type == 'marker') {
                    newobject = L.marker([socket_object.data.latitude, socket_object.data.longitude], icon_param);
                } else if (socket_object.type == 'polygon' || socket_object.type == 'polyline') {
                    console.log("Points " + socket_object.data.points);
                    var points = JSON.parse(socket_object.data.points);
                    //console.log("Points " + points.length + "," + points[0][0]);
                    if (socket_object.type == 'polyline') {
                        newobject = L.polyline(points, color_param);
                    } else {
                        newobject = L.polygon(points, color_param);
                    }
                } else if (socket_object.type == 'circle') {
                    newobject = L.circle([socket_object.data.latitude, socket_object.data.longitude], socket_object.data.radius, color_param);
                }

                //set id and add to layer
                if (newobject != null) {
                    newobject.myCustomID = socket_object.data.id;
                    annotationLayer.addLayer(newobject);

                    var popup_text = socket_object.text;

                    //do I own it? if so editable
                    if (socket_object.owner == owner) {
                        //setup popup for editing
                        if (popup_text == null) {
                            popup_text = "Input text ...";
                        }

                        var popup_text = load_popup_html(popup_text, popup_text.length);

                        newobject.enableEdit(); //editing
                        newobject.owned = true;
                    }

                    if (popup_text == null) {
                        popup_text = "Undefined";
                    }

                    //newobject.enableEdit(); //editing

                    //setup popup
                    newobject.bindPopup(popup_text);
                    newobject.on('click', function(e) {
                        this.openPopup();
                    });
                }

            }

            //notify?
            if(parsed.objects.length > 0){
                $.notify(parsed.objects.length + " annotations loaded", "success");
            }
        }

        //AJAX to get annotation layers
        function get_annotations_from_server() {
            $.ajax({
                type: "GET",
                url: "/map/" + annotate_map_id + "/annotations/",
                data: {},
                dataType: "json",
                success: function(result) {
                    console.log("ANNOTATION LAYERS -- SUCCESS!");
                    console.log(result);
                    load_annotation_elements(result);
                },
                error: function(result) {
                    console.log("ERROR:", result)
                    $.notify("Error loading map annotations", "error");
                }
            });
        }

        //additional leaflet marker icon
        var redIcon = new L.Icon({
            iconUrl: marker_icon_image,
            shadowUrl: marker_icon_shadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
