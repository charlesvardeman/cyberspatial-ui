//create a new map and launch it
function create_map(){
    console.log("saving");
    $.ajax({
        type: "POST",
        url: "/maps/new/",
        data: {
            'name': document.getElementById("map_name").value,
            'description': document.getElementById("map_description").value
        },
        dataType: "json",
        success: function(result) {
            console.log("CREATE MAP -- SUCCESS!" + result.created);
            if(result.created){
                //go to new map
                window.location.href = "/map/" + result.id + "/";
            }else{
                $("#createMap-1").modal("hide");
                $.notify("Map creation error!", "error");
            }
        },
        error: function(result) {
            console.log("CREATE MAP ERROR:", result)
            //fade out modal
            $("#createMap-1").modal("hide");
            $.notify("Map could not be created!", "error");
        }
    });

}

//load ordered data from simulation db
function load_map_data(order_by) {
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
        success: function (result) {

            console.log("GETTING SIMULATION -- SUCCESS! " + result.status);

            //get heatmap from S3
            if (result.status) {
                //clear current list
                document.getElementById('dashboard-list').innerHTML = "";

                //get JSON data
                for (var i = 0; i < result.data.length; i++) {
                    //console.log(result.data[i].sim_id);

                    //setup for hidden list elements
                    var hide = "";
                    if (i > 3) {
                        hide = "hidden";
                    }

                    //counter from 1
                    var count = i + 1;

                    //get name of sim if available
                    var sim_title = result.data[i].data.storm_type + " Run";
                    if(result.data[i].sim_name){
                        sim_title = result.data[i].sim_name;
                    }

                    //html to crete li
                    var html = `<li class="${hide}">
                                <article>
                                    <div class="row items-list">
                                        <div class="col-xs-12 item-info shp-info">
                                            <h4><div id="badge-${(count)}" class="h-badge what-if">H</div><span id="storm-${(count)}">${ sim_title }</span></h4>
                                            <p>${result.data[i].description} <span class="owner">by <a href="">${result.data[i].user_name}</a></span></p>
                                            <p class="shp-scenario"><span>Sea Level Rise:</span> ${result.data[i].data.SLR}, <span>Coastal Protection:</span> ${result.data[i].data.protection}, <span>Tides:</span> ${result.data[i].data.tide_td}, <span>Analysis type:</span> ${result.data[i].data.analysis}, <span>Simulation id:</span> ${result.data[i].sim_id}</p>
                                            <br/>
                                            <p class="actions">
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td style="font-size: 14px;">
                                                            <i class="fa fa-calendar-o"></i> ${result.data[i].modified}
                                                        </td>
                                                        <td>
                                                            <div class="dropup show pull-right">
                                                                <button class="dropdown-toggle" style="margin-top: 5px;font-size: 14px;" id="dropdownMenuAddToMap_${count}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                                    Add Results to Map ... <i href="#"  class="fa fa-caret-up" style="margin-left: 10px" aria-hidden="true"></i>
                                                                </button>
                                                                <div id="add_${result.data[i].sim_id}" style="height: 250px;overflow: auto;" class="dropdown-menu" aria-labelledby="dropdownMenuAddToMap_${count}">
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            </li>`;

                    //add it
                    document.getElementById('dashboard-list').innerHTML += html;
                    AddUserMaps(result.data[i].sim_id);
                }

                //loop until end of data list
                counter = 1;
                page = 1;
                var hurricanes = 0;
                var noreasters = 0;


                do {
                    var more_elmts = document.getElementById('badge-' + counter);

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

                } while (more_elmts)

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
        error: function (result) {
            console.log("ERROR:", result)
            //$.notify("Error loading simulation", "error");
        }
    });

}
