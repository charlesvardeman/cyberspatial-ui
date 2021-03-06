/*
 * Purpose:            js file for explore_layers.html.
 * @author             Chris Sweet
 * Org:                CRC at Notre Dame
 * Date:               04/01/2018
 *
 * Associated files:   explore_layers.html    Explore layers page,
 *
 * @description        Provides functionality to view, filter and order layers that have been uploaded to GeoNode.
                       Uses GeoNode /api/layers API.
 *
 * Functions:
 *  $("#pageBackwards").on("click"  Paging for list.
 *  $("#pageForward").on("click"    Paging for list.
 *  $(document).ready               Setup date picker and load a page of layers with search catagories and keywords.
 *  load_layers                     Load layers from GeoNode /api/layers API.
 *  $(function()                    Handle LHS panel for open close search criterion.
 *  setContentWidth                 Fix max width for LHS search panel.
 *  reload_layer_data               Reload ordered data from layer db.
 *  clear_search                    Clear text search.
 *  do_text_search                  Search based on text.
 *  do_date_search                  Search based on date.
 *  add_layer_to_map                Add a layer to a map.
 */

//variables
var orderby = '-date';
var catagory = "";
var keyword = "";
var text_search = "";
var start_date = "";
var end_date = "";

//~~~~run once ready~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$(document).ready(function () {

    //$("#datepicker1").datepicker();
    //$("#datepicker2").datepicker();

    //get catagories
    $.ajax({
        type: "GET",
        url: "/api/categories/",
        data: {
        },
        dataType: "json",
        success: function (result) {
            console.log("GETTING catagories -- SUCCESS! ");
            //clear current list
            document.getElementById('categories').innerHTML = "";

            //get total number
            var count = result.meta.total_count;

            //loop over objects
            for(var i=0; i<count; i++){

                //get catagory
                var object = result.objects[i];

                //skip if none available
                if(object.count == 0) continue;

                //console.log("Title "+object.gn_description);
                //truncations
                if (object.gn_description.length > 25) {
                    object.gn_description = object.gn_description.substring(0, 22) + "...";
                }

                //html to crete li
                var html;

                html = `<li>
                            <a id="cat_${object.id}" class="catagorytoclick" )">
                                ${object.gn_description}
                                <span class="badge pull-right">${object.count}</span>
                            </a>
                        </li>`;

                //add it
                document.getElementById('categories').innerHTML += html;

            }

            //add click function
            $(".catagorytoclick").click(function(e) {
                //console.log("Click "+$(this).attr('id').substring(4));

                //toggle active
                $(this).toggleClass("active");

                //are we active?
                if($(this).hasClass("active")){

                    //remove other actives
                    $(this).addClass("active");
                    $(this).parent('li').siblings().find('a.catagorytoclick').removeClass('active');

                    //set catagories
                    catagory = $(this).attr('id').substring(4);

                    //load layers
                    load_layers(false, orderby, false);
                }else{
                    catagory = "";

                    //load layers
                    load_layers(false, orderby, false);
                }

            });

        },
        error: function (result) {
            console.log("GETTING catagories -- ERROR:", result)
        }
    });

    //get keywords
    $.ajax({
        type: "GET",
        url: "/api/keywords/",
        data: {
        },
        dataType: "json",
        success: function (result) {
            console.log("GETTING keywords -- SUCCESS! ");
            //clear current list
            document.getElementById('keywords').innerHTML = "";

            //get total number
            var count = result.meta.total_count;

            //loop over objects
            for(var i=0; i<count; i++){

                //get catagory
                var object = result.objects[i];

                //skip if none available
                if(object.count == 0) continue;

                //console.log("Name "+object.name);
                //truncations
                if (object.name.length > 25) {
                    object.name = object.name.substring(0, 22) + "...";
                }

                //html to crete li
                var html;

                html = `<li>
                            <a id="key_${object.id}" class="keywordtoclick" )">
                                ${object.name}
                                <span class="badge pull-right">${object.count}</span>
                            </a>
                        </li>`;

                //add it
                document.getElementById('keywords').innerHTML += html;

            }

            //add click function
            $(".keywordtoclick").click(function(e) {
                //console.log("Click "+$(this).attr('id').substring(4));

                //toggle active
                $(this).toggleClass("active");

                //are we active?
                if($(this).hasClass("active")){

                    //remove other actives
                    $(this).addClass("active");
                    $(this).parent('li').siblings().find('a.keywordtoclick').removeClass('active');

                    //set keywords
                    keyword = $(this).attr('id').substring(4);

                    //load layers
                    load_layers(false, orderby, false);
                }else{
                    keyword = "";

                    //load layers
                    load_layers(false, orderby, false);
                }

            });

        },
        error: function (result) {
            console.log("GETTING keywords -- ERROR:", result)
        }
    });

    //load layers, start with order by most recent
    load_layers(false, orderby, false);

});

//load the layer svia AJAX
function load_layers(append, orderby, pageing){

    //sort out query
    var qdata = {
                'order_by': orderby,
                'limit': 4,
            };

    //are we paging through data, or loading new set?
    if(pageing){
        qdata['offset'] = (page - 1) * 4;
    }else{ //if new data then reset to page 1
        page = 1;

        //update page
        document.getElementById('page').innerHTML = page;
    }

    //add catagory if relevant
    if(catagory != ""){
        qdata['category'] = catagory;
    }

    //add keyword if relevant
    if(keyword != ""){
        qdata['keywords'] = keyword;
    }

    //text search
    if(text_search != ""){
        qdata['title__contains'] = text_search;
    }

    //date gte
    if(start_date != ""){
        qdata['date__gte'] = start_date;
    }

    //date gte
    if(end_date != ""){
        qdata['date__lte'] = end_date;
    }

    //get actual layers, order by date, -date, title, -title
    $.ajax({
        type: "GET",
        url: "/api/layers/",
        data: qdata,
        dataType: "json",
        success: function (result) {
            console.log("GETTING LAYERS -- SUCCESS! " + result.meta.total_count);

            //clear current list
            if(!append){
                document.getElementById('dashboard-list').innerHTML = "";
            }

            //get total number
            var count = result.meta.total_count;

            //set label
            document.getElementById("total_counts").innerHTML = count;

            //set page stuff
            counter = parseInt(count);
            document.getElementById("pagetotal").innerHTML = Math.ceil(count / 4);

            //loop over objects
            for(var i=0; i<count; i++){
                //get object
                var object = result.objects[i];

                //test OK
                if(!object) continue;
                //console.log("Title "+object.title);

                //truncations
                if (object.supplemental_information.length >= 200) {
                    object.supplemental_information = object.supplemental_information.substring(0, 197) + "...";
                }

                //truncations
                if (object.abstract.length >= 200) {
                    object.abstract = object.abstract.substring(0, 197) + "...";
                }

                //fix date?
                object.date = object.date.replace("T"," ");
                var indx = object.date.indexOf(".");
                if(indx > -1){
                    object.date = object.date.substring(0,indx);
                }

                //html to crete li
                var html;

                html = `<article>
                            <div class="row items-list">
                                <div class="col-xs-4 thumb">
                                    <a href="${object.detail_url}"><img src="${object.thumbnail_url}" /></a>
                                </div>
                                <div class="col-xs-8 item-info">
                                    <a href="${object.detail_url}"><h4>${object.title}</h4></a>
                                    <p>${object.supplemental_information} <span class="owner">by ${object.owner__username}</span></p>
                                    <p class="abstract">${object.abstract}</p>
                                    <div class="actions">
                                        <i class="fa fa-calendar-o"></i>${object.date} |
                                        <i class="fa fa-eye"></i>${object.popular_count} |
                                        <i class="fa fa-share"></i>${object.share_count} |
                                        <i class="fa fa-star"></i>${object.rating}
                                        <div class="dropup show pull-right actions">
                                            <a class="dropdown-toggle pull-right" id="dropdownMenuAddToMap_${count}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <i class="fa fa-map-marker"></i>View on Map</a>
                                            </a>
                                            <div id="add_${object.id}" style="height: 250px;overflow: auto;padding: 2px;" class="dropdown-menu" aria-labelledby="dropdownMenuAddToMap_${count}">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>`;

                //add it
                document.getElementById('dashboard-list').innerHTML += html;

                //and then add map list
                AddUserMaps(object.id);
            }

        },
        error: function (result) {
            console.log("GETTING MAPS -- ERROR:", result)
        }
    });

}

//Handle LHS panel for open close search criterion
$(function() {

    $(".datepicker").datepicker();
    //$(".datepicker").datetimepicker();

    $("#slide-pane a.toggle-pane").click(function(e) {
        e.preventDefault();
        var span$ = $("#slide-pane").parents(".col-md-3");
        if(!span$.is('.hidden')) {
            span$.addClass("hidden").animate({
                marginLeft: "-310px"
            }, 500, function() {
                setContentWidth();
            });
            $(this).find("i").attr("class", "fa fa-chevron-right");
        } else {
            span$.removeClass("hidden").animate({
                marginLeft: "0px"
            }, 500, function() {
                setContentWidth();
            });
            $(this).find("i").attr("class", "fa fa-chevron-left");
        }
    });
    $("nav a.toggle-nav").click(function(e) {
        e.preventDefault();
        if ($(this).parents("h4").siblings(".nav").is(":visible")) {
            $(this).parents("h4").siblings(".nav").slideUp();
            $(this).find("i").attr("class", "fa fa-chevron-right");
        } else {
            $(this).parents("h4").siblings(".nav").slideDown();
            $(this).find("i").attr("class", "fa fa-chevron-down");
        }
    });
});

function setContentWidth() {
    var lm = parseInt($("#slide-pane").parents(".col-md-3").css("marginLeft").replace("px", "")) + 51;
    var w = $("#contain-slider").width() - ($("#slide-pane").outerWidth() + lm);
    $(".tab-content").css('width', w + "px");
}

//reload ordered data from layer db
function reload_layer_data(object) {
    //set selected
    $(object).parent().siblings().find('.' + "selected").removeClass("selected");
    object.classList.add("selected");

    //set ordering
    orderby = object.name;

    //load data
    load_layers(false, orderby, false);
}

//clear text search
function clear_search() {
    //clear
    document.getElementById('text_search_input').value = "";
    document.getElementById('date__gte').value = "mm/dd/yyyy";
    document.getElementById('date__lte').value = "mm/dd/yyyy";
    start_date = "";
    end_date = "";
    text_search = "";

    //clear actives
    $("#categories").find('li').siblings().find('a.catagorytoclick').removeClass('active');
    $("#keywords").find('li').siblings().find('a.keywordtoclick').removeClass('active');

    //clear data
    catagory = "";
    keyword = "";

    //load data
    load_layers(false, orderby, false);

}

//reload with text search
function do_text_search() {

    //get text
    text_search = document.getElementById('text_search_input').value;

    //load data
    load_layers(false, orderby, false);
}

//date Update
function do_date_search(object){

    //get date in correct format
    var dateObject = $("#"+object.id).datepicker("getDate");
    var dateString = $.datepicker.formatDate("yy-mm-dd", dateObject);

    //setup dates
    if(object.id == 'date__gte'){
        start_date = dateString;
    }else{
        end_date = dateString;
    }

    //load data
    load_layers(false, orderby, false);

}

//page variables
var counter = 1;
var page = 1;
var layer_per_page = 4;

$("#pageBackwards").on("click", function (e) {
    e.preventDefault();

    //can we move backwards?
    if(page > 1){
        //decrement
        page--;

        //load data
        load_layers(false, orderby, true);

        //update page
        document.getElementById('page').innerHTML = page;
    }
});

$("#pageForward").on("click", function (e) {
    e.preventDefault();

    //can we move forward?
    if((page * layer_per_page) < counter){

        //increment
        page++;

        //load data
        load_layers(false, orderby, true);

        //update page
        document.getElementById('page').innerHTML = page;
    }
});

//add layer to map and go
function add_layer_to_map(object, id){
    //console.log("Add layer. map id: "+object.name+", layer id: "+id);

    //Do ajax
    $.ajax({
        type: "POST",
        url: "/map/" + object.name + "/settings/",
        data: {
            'layer_id': id,
            'action': 'add_layer',
        },
        dataType: "json",
        success: function (result) {
            console.log("SAVING TO MAP -- SUCCESS!" + result.saved);
            //flag saved
            $.notify("Layer saved to map " + object.innerHTML, "success");

            //jump to page
            window.location.href = "/map/" + object.name + "/";
        },
        error: function (result) {
            console.log("ERROR:", result)
            $.notify("Error saving simulation to map", "error");
        }
    });

}
