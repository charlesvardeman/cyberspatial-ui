//date range for Search
var start_date = "";//"04/11/2018 18:30";
var end_date = "";//"04/15/2018 9:30";
var text_search = ""; //"sim stuff";
var current_map_data = null;

//~~~~run once ready~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$(document).ready(function () {

    //load actual data
    load_maps_data('-modified');

    $("#datepicker1").datepicker();
    $("#datepicker2").datepicker();
});

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
function load_maps_data(order_by) {
    console.log("loading maps");

    $.ajax({
        type: "GET",
        url: "/maps/new/",
        data: {
            'action': 'load_maps',
            'order_by': order_by,
            'start_date': start_date,
            'end_date': end_date,
            'text_search': text_search
        },
        dataType: "json",
        success: function (result) {

            console.log("GETTING MAPS -- SUCCESS! " + result.loaded);

            //get maps
            if (result.loaded) {
                //save data
                current_map_data = result.data;

                //console.log("loaded "+result.data[0].thumbnail);
                //clear current list
                document.getElementById('dashboard-list').innerHTML = "";

                //loop until end of data list
                counter = 1;
                page = 1;

                //get JSON data
                for (var i = 0; i < result.data.length; i++) {

                    //setup for hidden list elements
                    var hide = "";
                    if (i > 3) {
                        hide = "hidden";
                    }

                    //counter from 1
                    var count = i + 1;

                    var url = result.data[i].thumbnail;
                    if(!url){
                        url = "/static/images/missing_map.png";
                    }

                    //sort shared by
                    var shared_with = result.data[i].shared_with;
                    var shared_with_number = shared_with.length;

                    var shares_text = "shares";

                    if(shared_with_number == 1){
                        shares_text = "share";
                    }

                    //html to crete li
                    var html;

                    if(result.data[i].owner == user_name){
                        html = `<li class="${hide}">
                                        <article>
                                            <div class="row items-list">
                                                <div class="col-xs-4 thumb">
                                                    <a href="/map/${result.data[i].id}/"><img src="${ url }" /></a>
                                                </div>
                                                <div class="col-xs-8 item-info">

                                                    <h4>${ result.data[i].name }</h4>
                                                    <p><span class="owner">by ${ result.data[i].owner }</span></p>
                                                    <p class="abstract">${ result.data[i].description }</p>
                                                    <p class="actions">
                                                        <i class="fa fa-calendar-o"></i>${result.data[i].modified} |
                                                        <a id="share_link-${result.data[i].id}" onclick="open_share_users('${result.data[i].id}');return false;" href="#"><i class="fa fa-share"></i>${shared_with_number} ${shares_text}</a> |
                                                        <a ng-if="item.detail_url.indexOf('/maps/') > -1" class="pull-right" href="/map/${result.data[i].id}/">
                                                            <i class="fa fa-map-marker"></i>View Map</a>
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    </li>`;
                    }else{
                        html = `<li class="${hide}">
                                        <article>
                                            <div class="row items-list">
                                                <div class="col-xs-4 thumb">
                                                    <a href="/map/${result.data[i].id}/"><img src="${ url }" /></a>
                                                </div>
                                                <div class="col-xs-8 item-info">

                                                    <h4>${ result.data[i].name }</h4>
                                                    <p><span class="owner">by ${ result.data[i].owner }</span></p>
                                                    <p class="abstract">${ result.data[i].description }</p>
                                                    <p class="actions">
                                                        <i class="fa fa-calendar-o"></i>${result.data[i].modified} |
                                                        ${shared_with_number} ${shares_text} |
                                                        <a ng-if="item.detail_url.indexOf('/maps/') > -1" class="pull-right" href="/map/${result.data[i].id}/">
                                                            <i class="fa fa-map-marker"></i>View Map</a>
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    </li>`;

                    }

                    //add it
                    document.getElementById('dashboard-list').innerHTML += html;

                    //increment
                    counter++;

                }

                //sort counter
                counter--;

                //update total
                document.getElementById('total').innerHTML = counter;

                //update total
                document.getElementById('pagetotal').innerHTML = Math.ceil(counter / 4);

            }else{
                current_map_data = null;
            }

        },
        error: function (result) {
            console.log("GETTING MAPS -- ERROR:", result)
            current_map_data = null;
        }
    });

}

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
    var oldshownItems = shownItems;

    if((shownItems + 4) < counter){
        shownItems += 4;
    }
    /*if ((shownItems + 8) > counter) {
        console.log("Erk "+shownItems+","+counter);
        shownItems = counter - counter % 4;
    } else {
        shownItems += 4;
    }*/

    if (oldshownItems != shownItems) {
        page++;
    }
    items.slice(shownItems, shownItems + 4).removeClass("hidden");

    //update page
    document.getElementById('page').innerHTML = page;
});

//reload ordered data from simulation db
function reload_map_data(object) {
    //set selected
    $(object).parent().siblings().find('.' + "selected").removeClass("selected");
    object.classList.add("selected");

    //load data
    load_maps_data(object.name);
}

//save map sharing users
function save_shared_with(map_number){
    //get list of users
    var more_elmts;
    var counter = 1;
    var checked_counter = 0;

    var data = [];

    //loop until end of list
    do{
        more_elmts = document.getElementById('sharemodal-'+counter++);

        //if exists and checked then save
        if(more_elmts){
            if(more_elmts.checked){
              data.push(more_elmts.name);
              checked_counter++;
            }
        }
    }while(more_elmts)

    //console.log("Data "+JSON.stringify(data));

    //send to backend
    $.ajax({
        type: "POST",
        url: "/map/" + map_number + "/settings/",
        data: {
            'shares': JSON.stringify(data),
            'action': 'share'
        },
        dataType: "json",
        success: function(result) {
            console.log("SETTING SHARES -- SUCCESS!" + result.saved);

            //update page
            var shares_text = "shares";

            if(checked_counter == 1){
                shares_text = "share";
            }

            document.getElementById("share_link-"+map_number).innerHTML = `<i class="fa fa-share"></i>${checked_counter} ${shares_text} `;

            //fade out modal
            $("#shareMap-1").modal("hide");

            //now auto save so dont flag
            $.notify("Shares saved", "success");
        },
        error: function(result) {
            //fade out modal
            $("#shareMap-1").modal("hide");

            console.log("ERROR:", result)
            $.notify("Error saving shares", "error");
        }
    });

}

//function to open map modal
function open_share_users(map_number){
    console.log("Open share "+map_number);
    if(!current_map_data) return;

    var map_data = null;

    //find map
    for(var i=0; i<current_map_data.length; i++){
        if(current_map_data[i].id == map_number){
            map_data = current_map_data[i];
            break;
        }
    }

    //go if not found
    if(!map_data){
        console.log("No such number ");
        return;
    }

    //sort shared by
    var shared_with = map_data.shared_with;
    var shared_with_number = shared_with.length;
    console.log("sw "+shared_with[0]+","+shared_with.length);

    for(var j=0; j<shared_with.length;j++){
        console.log("sw "+shared_with[j]);

        //get list of users
        var more_elmts;
        var icounter = 1;

        //loop until end of list
        do{
           more_elmts = document.getElementById('sharemodal-'+icounter++);

           //if exists and checked then save
           if(more_elmts){
              if(more_elmts.name == shared_with[j]){
                  more_elmts.checked = true;
              }else{
                  more_elmts.checked = false;
              }
           }
        }while(more_elmts)
    }

    //set map specifics
    document.getElementById('share_map_button').name = map_number;
    document.getElementById('shareMap').innerHTML = "Share Map \"" + map_data.name + "\"?";
    //fade in modal
    $("#shareMap-1").modal("show");

}

//get date input
function get_dates(object) {
    if (object.name == "start_date") {
        start_date = object.value;
        console.log("Start " + start_date)
    } else {
        end_date = object.value;
        console.log("End " + end_date)
    }
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
    load_maps_data('-modified');

    return false;
}

//reload with text search
function call_text_search() {

    var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;

    //test start
    if (start_date != "" && !(date_regex.test(start_date))) {
        alert("Error in start date " + start_date);
    }

    //test start
    if (end_date != "" && !(date_regex.test(end_date))) {
        alert("Error in end date " + end_date);
    }

    //both dates?
    if ((end_date == "" && start_date != "") || (end_date != "" && start_date == "")) {
        alert("Please enter a start AND end date!");
    }

    //get text
    text_search = document.getElementById('text_search_input').value;

    //load data
    load_maps_data('-modified');
}

//filter for users
function user_filter(object){
    //figure out button clicked and find its panel
    var panel_name = object.id + '_panel';
    var panel = document.getElementById(panel_name);

    //get name of section
    var inner_str = object.innerHTML;
    var n = inner_str.indexOf("</i>");
    var object_name = inner_str.substring(n+4);

    //test if hidden
    if(!$("#"+panel_name).is(':visible')){
        //panel.classList.remove("hidden");
        $("#"+panel_name).show(300)
        object.innerHTML = "<i class='fa fa-chevron-down'></i>" + object_name;
    }else{
        //panel.classList.add("hidden");
        $("#"+panel_name).hide(200);
        object.innerHTML = "<i class='fa fa-chevron-right'></i>" + object_name;
    }
}
