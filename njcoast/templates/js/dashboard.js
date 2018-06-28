/**
 * @author Chris Sweet <csweet1@nd.edu>
 *
 * @description User dashboard code for dashboard.html
 *
 */

$(document).ready(function() {

     //setup for select input
      $('.js-example-basic-multiple').select2({ allowClear: true }); //, minimumInputLength: 1

      //do Ajax call to get munis in county
      $.ajax({
          type: "GET",
          url: "/municipalities_in_county/",
          data: {
              'county': 'All'
          },
          dataType: "json",
          success: function(result) {
              console.log("MUNIS FILTERED BY COUNTY -- SUCCESS! " + result.status);

              //if we got munis back
              if(result.status){
                  /* Remove all options from the select list */
                  //$('#muniList').empty();
                  var x = document.getElementById("muniList");
                  for(var i=0; i<result.data.length; i++){
                      //if(result.data[i] == {{ user.njcusermeta.municipality.name }}) continue;
                      var option = document.createElement("option");
                      option.text = result.data[i];
                      option.value = result.ids[i];
                      x.add(option);
                  }

              }else{
                  //or failure
                  console.log("MUNIS FILTERED BY COUNTY ERROR:", result)
              }
          },
          error: function(result) {
              console.log("MUNIS FILTERED BY COUNTY ERROR:", result)
          }
      });

});


//function to open group membership
function open_membership(object_name){
    var member_list = document.getElementById(object_name);
    var caret = document.getElementById(object_name+'_caret');

    //test if hidden
    if(member_list.classList.contains('hidden')){
        member_list.classList.remove("hidden");
        caret.classList.remove("fa-caret-down");
        caret.classList.add("fa-caret-right");
    }else{
        member_list.classList.add("hidden");
        caret.classList.remove("fa-caret-right");
        caret.classList.add("fa-caret-down");
    }

    return false;
}

//function to flip between main and edit
function flip_edit_main(edit){
    if(edit){
        document.getElementById("main_section").classList.add("hidden");
        document.getElementById("edit_section").classList.remove("hidden");
    }else{
        document.getElementById("main_section").classList.remove("hidden");
        document.getElementById("edit_section").classList.add("hidden");
    }
}

//check email input OK
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

//save user data
function save_changes(username){
    //check data integrity. Email
    //first email
    var email = document.getElementById("edit_email").value;
    if(!validateEmail(email)){

        //fade out modal
        $("#saveChanges-1").modal("hide");

        //open new modal to flag error
        document.getElementById("info_ok_modal").innerHTML = "Invalid email, please correct before saving.";
        $('#fixInput-1').modal()

        return;
    }

    //do Ajax call
    $.ajax({
        type: "POST",
        url: "/user/settings/",
        data: {
            'position': document.getElementById("edit_position").value,
            'name': document.getElementById("edit_name").value,
            'email': document.getElementById("edit_email").value,
            'voice': document.getElementById("edit_voice").value,
            'address_line_1': document.getElementById("edit_address_line_1").value,
            'address_line_2': document.getElementById("edit_address_line_2").value,
            'city': document.getElementById("edit_city").value,
            'zip': document.getElementById("edit_zip").value,
            'user': username,
            'action': 'update_profile'
        },
        dataType: "json",
        success: function(result) {
            console.log("USER APPROVAL -- SUCCESS!" + result.updated);

            if(result.updated){
                //copy over data if success
                document.getElementById("info_position").innerHTML = document.getElementById("edit_position").value;
                document.getElementById("info_name").innerHTML = document.getElementById("edit_name").value;
                document.getElementById("info_email").innerHTML = document.getElementById("edit_email").value;
                document.getElementById("info_voice").innerHTML = document.getElementById("edit_voice").value;
                document.getElementById("info_address_line_1").innerHTML = document.getElementById("edit_address_line_1").value;
                document.getElementById("info_address_line_2").innerHTML = document.getElementById("edit_address_line_2").value;
                document.getElementById("info_city").innerHTML = document.getElementById("edit_city").value;
                document.getElementById("info_zip").innerHTML = document.getElementById("edit_zip").value;

                //flip back to view
                flip_edit_main(false);

                //flag success
                $.notify("User updated", "success");
            }else{
                //or failure
                $.notify("Error updating user", "error");
            }

            //fade out modal
            $("#saveChanges-1").modal("hide");

        },
        error: function(result) {
            console.log("ERROR:", result)
            $.notify("Error updating user", "error");

            //fade out modal
            $("#saveChanges-1").modal("hide");
        }
    });

}

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

//delete map in dashboard
function delete_map(id){
    //console.log("Delete map "+id);
    document.getElementById("delete_map_button").setAttribute('name', id);
    document.getElementById("editable_delete_modal").innerHTML = "Do you want to delete map \""+document.getElementById("list_name_"+id).innerHTML+"\"?";
    $("#deleteMap-1").modal("show");
}

//actual delete map in dashboard
function delete_map_ajax(id){
    console.log("Actually delete "+id);
    $.ajax({
        type: "GET",
        url: "/maps/new/",
        data: {
            'id': id,
            'action': 'delete'
        },
        dataType: "json",
        success: function(result) {
            console.log("DELETE MAP -- SUCCESS! " + result.deleted);

            //deleted?
            if(result.deleted){
                //remove list item
                document.getElementById("list_"+id).classList.add("hidden");
                $.notify("Map deleted!", "success");
            }

            //fade out modal
            $("#deleteMap-1").modal("hide");
        },
        error: function(result) {
            console.log("DELETE MAP ERROR:", result)

            //fade out modal
            $("#deleteMap-1").modal("hide");
            $.notify("Map could not be deleted!", "error");
        }
    });

}
