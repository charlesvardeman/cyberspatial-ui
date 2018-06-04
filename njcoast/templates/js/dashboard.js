/**
 * @author Chris Sweet <csweet1@nd.edu>
 *
 * @description User dashboard code for dashboard.html
 *
 */

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
