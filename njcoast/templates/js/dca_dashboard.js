/**
 * @author Chris Sweet <csweet1@nd.edu>
 *
 * @description DCA administrator code
 *
 */

//~~~~run once ready~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
$(document).ready(function () {
    //reload approvals list
    update_approval_list();

    //load main list
    update_user_list();

    //load munis
    update_muni_admins("");
});

//do ajax load of munis in selected county
function load_munis_in_county(object){
    var county = object.options[object.selectedIndex].value;

    //do Ajax call to get munis in county
    $.ajax({
        type: "GET",
        url: "/user/settings/",
        data: {
            'county': county,
            'action': 'load_munis_in_county'
        },
        dataType: "json",
        success: function(result) {
            console.log("USER APPROVAL -- SUCCESS!" + result.updated);

            if(result.updated){
                //flag success
                var select = document.getElementById('select_municipality');
                select.innerHTML = `<option>All</option>`;

                for(var i = 0; i<result.data.length; i++){
                    var opt = document.createElement('option');
                    opt.value = result.data[i].name;
                    opt.innerHTML = result.data[i].name;
                    select.appendChild(opt);
                }

                //load main list
                update_user_list();
            }else{
                //or failure
            }

        },
        error: function(result) {
            console.log("ERROR:", result)
        }
    });

}

//filter for users
function user_filter(object){
    //figure out button clicked and find its panel
    var panel_name = object.id + '_panel';
    var panel = document.getElementById(panel_name);

    //get name of section
    var inner_str = object.innerHTML;
    var n = inner_str.indexOf("<span");
    var object_name = inner_str.substring(0, n);

    //test if hidden
    if(panel.classList.contains('hidden')){
        panel.classList.remove("hidden");
        object.innerHTML = object_name + " <span class='fa fa-chevron-down pull-right'>";
    }else{
        panel.classList.add("hidden");
        object.innerHTML = object_name + " <span class='fa fa-chevron-right pull-right'>";
    }
}

//filter muni admins by county
function filter_muni_admin_by_county(county){
    //set screen <li>Berkeley Twp <span class="fa fa-times"></span></li>
    document.getElementById("county_filter_button").innerHTML = county + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

    //reload munis
    update_muni_admins(county);

}

//flip main screen from tabs (muni admin. user, approvals) to DCA admin screen
function flip_main_dcaapprovals(flip_direction, do_flip){
    //flip pages
    if(flip_direction){
        //do Ajax call for dca admins
        $.ajax({
            type: "GET",
            url: "/user/settings/",
            data: {
                'action': 'get_dca_admins'
            },
            dataType: "json",
            success: function(result) {
                console.log("USER APPROVAL -- SUCCESS!" + result.updated);

                //success?
                if(result.updated){
                    //update table
                    var table_body = document.getElementById("dca_approvers_list");
                    table_body.innerHTML = `<tr>
                                                <th>Name</th>
                                                <th>Position</th>
                                                <th>Email</th>
                                                <th</th>
                                            </tr>`;

                    //loop over users
                    for(var i=0; i<result.data.length; i++){
                        var dca_admin = result.data[i];
                        //console.log(muni_admin.name);

                        //----All muni admins---------------------------------------
                        //basic dca admin data
                        table_body.innerHTML += `<tr>
                                                    <td>${ dca_admin.name }</td>
                                                    <td>${ dca_admin.position }</td>
                                                    <td><a>${ dca_admin.email }</a></td>
                                                    <td><a onclick="view_user_info('${ dca_admin.username }', 5, 'Return to DCA Approvers list', 'justification,role,municipality,code,zip', '');" href="#"><span class="fa fa-info-circle"></span></a></td>
                                                </tr>`;
                    }

                    if(do_flip){
                        //new Title
                        document.getElementById("main_heading").innerHTML = "Edit DCA Approvers";
                        document.getElementById("main_heading_button").classList.add("hidden");

                        //turn off current pages visible
                        document.getElementById("tabs").classList.add("hidden");
                        document.getElementById("data_5_notab").classList.remove("hidden");

                        //clear Active and set new
                        for(var i=1; i<=3; i++){
                            //remove pages
                            try{
                                if(document.getElementById("tab_"+i).classList.contains("active")){
                                    document.getElementById("data_"+i).classList.add("hidden");
                                }
                            }catch(err){}
                        }

                        //new page
                        show_user_edit(false);
                        document.getElementById("data_4").classList.add("hidden");
                        document.getElementById("data_5").classList.remove("hidden");
                    }

                }else{
                    //or failure
                }
            },
            error: function(result) {
                console.log("ERROR:", result)
            }
        });

    }else{
        if(do_flip){
            //old Title
            document.getElementById("main_heading").innerHTML = "DCA Administrator Controls";
            document.getElementById("main_heading_button").classList.remove("hidden");

            //current pages
            document.getElementById("tabs").classList.remove("hidden");
            document.getElementById("data_5_notab").classList.add("hidden");

            //clear Active and set new
            for(var i=1; i<=3; i++){
                //remove pages
                try{
                    if(document.getElementById("tab_"+i).classList.contains("active")){
                        document.getElementById("data_"+i).classList.remove("hidden");
                    }
                }catch(err){}
            }

            //new page
            document.getElementById("data_5").classList.add("hidden");
        }
    }
}

// Update muni approved list
// AJAX call to get up to date information on muni approvers.
// Will be extended when UI design for pages is available.
function update_muni_admins(county){
    //do Ajax call
    $.ajax({
        type: "GET",
        url: "/user/settings/",
        data: {
            'action': 'get_muni_admins',
            'county': county
        },
        dataType: "json",
        success: function(result) {
            console.log("USER APPROVAL -- SUCCESS!" + result.updated);

            //success?
            if(result.updated){
                //update table
                var table_body = document.getElementById("muni_admin_list");
                table_body.innerHTML = `<tr>
                                            <th>Code <span class="fa fa-sort"></span></th>
                                            <th>Municipality <span class="fa fa-sort"></span></th>
                                            <th>Name <span class="fa fa-sort"></span></th>
                                            <th>Position <span class="fa fa-sort"></span></th>
                                            <th>Email</th>
                                            <th>Notes</th>
                                            <th</th>
                                        </tr>`;

                //loop over users
                for(var i=0; i<result.data.length; i++){
                    var muni_admin = result.data[i];
                    //console.log(muni_admin.name);

                    //----All muni admins---------------------------------------
                    if(muni_admin.notes == null){
                        muni_admin.notes = "";
                    }
                    //basic muni admin data
                    table_body.innerHTML +=   `<tr>
                                        <td>${ muni_admin.code }</td>
                                        <td>${ muni_admin.municipality }</td>
                                        <td>${ muni_admin.name }</td>
                                        <td class="position">${ muni_admin.position }</td>
                                        <td><a>${ muni_admin.email }</a></td>
                                        <td class="notes">${ muni_admin.notes }</td>
                                        <td><a onclick="view_user_info('${ muni_admin.username  }', 1, 'Return to Municipal Approvers list', 'justification,role', 'municipality');" href="#"><span class="fa fa-info-circle"></span></a></td>
                                    </tr>`;
                }

                //loop over remaining munis
                for(var i=0; i<result.munis.length; i++){
                    var muni_without_admin = result.munis[i];
                    //console.log(muni_without_admin.name);

                    //----All muni admins---------------------------------------
                    //basic muni admin data
                    table_body.innerHTML +=   `<tr>
                                                    <td>${ muni_without_admin.code }</td>
                                                    <td>${ muni_without_admin.name }</td>
                                                    <td class="null">n/a</td>
                                                    <td class="position null">n/a</td>
                                                    <td class="null">n/a</td>
                                                    <td class="notes"></td>
                                                    <td><a onclick="create_new_muni_admin('${ muni_without_admin.name }', '${ muni_without_admin.code }', 1, 'Return to Municipal Approvers list');" href="#"><span class="fa fa-info-circle"></span></a></td>
                                                </tr>`;
                }
            }else{
                //or failure
            }
        },
        error: function(result) {
            console.log("ERROR:", result)
        }
    });
}

// Update approval pending list
// AJAX call to get up to date information on users.
function update_approval_list(){
    //do Ajax call
    $.ajax({
        type: "GET",
        url: "/user/settings/",
        data: {
            'action': 'get_approvers'
        },
        dataType: "json",
        success: function(result) {
            console.log("GET USER APPROVALS -- SUCCESS!" + result.updated);

            //success?
            if(result.updated){
                //counter for approvals
                var approval_count = 0;

                //get approver container
                var approver_container = document.getElementById("account_list");

                //clear out old list
                approver_container.innerHTML = "";

                //loop over users
                for(var i=0; i<result.data.length; i++){
                    var user = result.data[i];
                    //console.log(user.name);

                    //basic user data
                    if(user.notes == null){
                        user.notes = "";
                    }

                    //----Approval list?----------------------------------------
                    approval_count++;

                    approver_container.innerHTML +=
                            `<a class="anchor" id="${ user.username }"></a>
                             <div class="row review-request">
                                <div class="col-md-5 col-lg-4">
                                    <div class="well">
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    <th style="border-top: 0">Name</th>
                                                    <td style="border-top: 0">${ user.name }</td>
                                                </tr>
                                                <tr>
                                                    <th>Title</th>
                                                    <td>${ user.position }</td>
                                                </tr>
                                                <tr>
                                                    <th>Municipality</th>
                                                    <td>${ user.municipality }</td>
                                                </tr>
                                                <tr>
                                                    <th>Role</th>
                                                    <td id="role_${i}" >${ user.role }</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <p><b>Justification:</b>${ user.justification }</p>
                                    </div>
                                </div>
                                <div class="col-md-7 col-lg-8">
                                    <p class="qualifier" style="margin-top: 10px;">Received: ${ user.date_joined }; Muni Approval: ${ user.muni_approval_date }</p>
                                    <textarea id="text_${i}" class="form-control" placeholder="" rows="7">${ user.notes }</textarea>
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-default dropdown-toggle"
                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                Change Role <span class="caret"></span>
                                                    </button>
                                        <ul id="account_list_roles_${i}" class="dropdown-menu">
                                        </ul>
                                    </div>
                                    <button onclick="user_update('${ user.username }', '${ i }', 'approve', '');" class="btn btn-primary" data-toggle="modal" data-target="">Approve</button>
                                    <button onclick="user_update('${ user.username }', '${ i }', 'decline', '');" class="btn btn-default" data-toggle="modal" data-target="">Decline*</button>
                                    <p class="qualifier" style="margin-top: 10px;">*Any notes entered for a Declined applicant will be shared with the applicant to justify the decision.</p>
                                </div>
                            </div>
                            <hr/>`;

                    //create roles list
                    var list_roles = document.getElementById("account_list_roles_"+i);
                    list_roles.innerHTML = "";

                    //get edit selector for role
                    var selctr = document.getElementById("edit_role_selector");
                    for(var j=0; j<selctr.options.length; j++){
                        var role_name = selctr.options[j].text;
                        list_roles.innerHTML += `<li><a onclick="user_update('${ user.username }', '${ i }', 'update_role', '${ role_name }');" href="#">${ role_name }</a></li>`;
                    }
                }

                //set approvals to be done
                document.getElementById("number_to_be_approved").innerHTML = `<span class="fa fa-exclamation-circle"></span> ${ approval_count } pending requests`;

            }else{
                //or failure
            }
        },
        error: function(result) {
            console.log("ERROR:", result)
        }
    });

}

// Update user info list
// AJAX call to get up to date information on users.
// Will be extended when UI design for pages is available.
function update_user_list(){
    //console.log("County "+document.getElementById("select_county").options[document.getElementById("select_county").selectedIndex].value);
    //collect filter data
    try{
        var county = document.getElementById("select_county").options[document.getElementById("select_county").selectedIndex].value;
        var municipality = document.getElementById("select_municipality").options[document.getElementById("select_municipality").selectedIndex].value;
    }catch(err){}

    //do Ajax call
    $.ajax({
        type: "GET",
        url: "/user/settings/",
        data: {
            'action': 'get_users',
            'filter_county': county,
            'filter_municipality': municipality
        },
        dataType: "json",
        success: function(result) {
            console.log("USER APPROVAL -- SUCCESS!" + result.updated);

            //success?
            if(result.updated){
                //update table
                var table_body = document.getElementById("user_list");
                if(result.is_dca){
                    table_body.innerHTML =  `   <tr>
                                <th>Name <span class="fa fa-sort"></span></th>
                                <th>Email</th>
                                <th>Role <span class="fa fa-sort"></span></th>
                                <th>Municipality <span class="fa fa-sort"></span></th>

                                <th>Status</th>
                                <th>Notes</th>
                                <th></th>
                            </tr>`;
                }else{
                    table_body.innerHTML =  `   <tr>
                                <th>Name <span class="fa fa-sort"></span></th>
                                <th>Email</th>
                                <th>Role <span class="fa fa-sort"></span></th>

                                <th>Status</th>
                                <th>Notes</th>
                                <th></th>
                            </tr>`;
                }

                //loop over users
                for(var i=0; i<result.data.length; i++){
                    var user = result.data[i];

                    //test for status filters
                    //active
                    if(user.active && !document.getElementById("status_button_active").checked){
                        continue;
                    }

                    //inactive
                    if(!user.active && user.is_dca_approved && !document.getElementById("status_button_inactive").checked){
                        continue;
                    }

                    //pending
                    if(!user.active && !user.is_dca_approved && !document.getElementById("status_button_pending").checked){
                        continue;
                    }

                    //----All NJC users-----------------------------------------
                    //basic user data
                    if(user.notes == null){
                        user.notes = "";
                    }

                    var html_string;
                    if(result.is_dca){
                        html_string = `<tr>
                                            <td>${ user.name }</td>
                                            <td><a>${ user.email }</a></td>
                                            <td>${ user.rolesf }</td>
                                            <td><a onclick="view_user_info('${ user.muni_approver }', 2, 'Return to All NJcoast Users list', '', '');" href="#">${ user.municipality }</a></td>`;
                    }else{
                        html_string = `<tr>
                                            <td>${ user.name }</td>
                                            <td><a>${ user.email }</a></td>
                                            <td>${ user.rolesf }</td>`;
                    }
                    //variable data
                    if(user.active){
                        if(result.is_dca){
                            html_string +=  `<td class="status act">active</td>
                                            <td class="notes">${ user.notes }</td>
                                            <td><a onclick="view_user_info('${ user.username }', 2, 'Return to All NJcoast Users list', '', '');" href="#"><span class="fa fa-info-circle"></span></a></td>`;
                        }else{
                            html_string +=  `<td class="status act">active</td>
                                            <td class="notes">${ user.notes }</td>
                                            <td><a onclick="view_user_info('${ user.username }', 2, 'Return to All Municipal Approvers list', '', 'municipality');" href="#"><span class="fa fa-info-circle"></span></a></td>`;
                        }
                    }else{
                        if(user.is_dca_approved){
                            html_string +=  `<td class="status inact">inactive</td>
                                            <td class="notes">${ user.notes }</td>
                                            <td><a onclick="view_user_info('${ user.username }', 2, 'Return to All NJcoast Users list', '', '');" href="#"><span class="fa fa-info-circle"></span></a></td>`;
                        }else{
                            if( (user.is_muni_approved && result.is_dca) || (!user.is_muni_approved && result.is_muni) ){
                                html_string +=  `<td class="status pnd">pending</td>
                                                <td><a onclick="flip_tabs('tab_3');" href="#${ user.username }" class="btn btn-warning btn-sm btn-block">View Request</a></td>`;
                            }else{
                                html_string +=  `<td class="status pnd">pending</td>
                                                <td class="notes">${ user.notes }</td>
                                                <td><a onclick="view_user_info('${ user.username }', 2, 'Return to All NJcoast Users list', '', '');" href="#"><span class="fa fa-info-circle"></span></a></td>`;
                            }
                        }
                    }

                    //end row
                    html_string +=  `   <td></td>
                                    </tr>`;
                    //combine string into html
                    table_body.innerHTML += html_string;
                }
            }else{
                //or failure
            }
        },
        error: function(result) {
            console.log("ERROR:", result)
        }
    });

}

//set muni code after selecting
function set_municipality_code(code){
    //console.log(code);
    document.getElementById("edit_code").innerHTML = code;
}

//delete user data
function delete_user(username){
    //console.log(username);

    //do Ajax call
    $.ajax({
        type: "POST",
        url: "/user/settings/",
        data: {
            'user': username,
            'action': 'delete'
        },
        dataType: "json",
        success: function(result) {
            console.log("USER APPROVAL -- SUCCESS!" + result.updated);

            if(result.updated){
                //flag success
                $.notify("User updated", "success");
            }else{
                //or failure
                $.notify("Error updating user", "error");
            }

            //fade out modal
            $("#myModal").modal("hide");

            //reload approvals list
            update_approval_list();

            //reload main list
            update_user_list();

            //reload munis
            update_muni_admins("");

            //update the dca admins?
            flip_main_dcaapprovals(true, false);

        },
        error: function(result) {
            console.log("ERROR:", result)
            $.notify("Error updating user", "error");

            //fade out modal
            $("#myModal").modal("hide");
        }
    });

}

//check email input OK
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

//save user data
function save_changes(username, action_if_no_user, exclude_string, disable_edit_string){
    //set default action
    var action = 'update_all';

    //est if create user
    if(username == ""){
        username = document.getElementById("edit_name").value.replace(/\s/g,'').toLowerCase();
        action = action_if_no_user;
        console.log("Create "+username);
    }else{
        console.log("Update "+username);
    }

    //check data integrity. Name, email
    //first email
    var email = document.getElementById("edit_email").value;
    if(!validateEmail(email)){

        //alert("Invalid email, please correct before saving.");
        //fade out modal
        $("#saveChanges-1").modal("hide");

        //open new modal to flag error
        document.getElementById("info_ok_modal").innerHTML = "Invalid email, please correct before saving.";
        $('#fixInput-1').modal()

        return;
    }

    //now name
    if(username==""){
        //alert("Invalid name, please correct before saving.");
        //fade out modal
        $("#saveChanges-1").modal("hide");

        //open new modal to flag error
        document.getElementById("info_ok_modal").innerHTML = "Invalid name, please correct before saving.";
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
            'role': document.getElementById("edit_role_selector").
                        options[document.getElementById("edit_role_selector").selectedIndex].text,
            'municipality': document.getElementById("edit_municipality_selector").
                        options[document.getElementById("edit_municipality_selector").selectedIndex].text,
            'address_line_1': document.getElementById("edit_address_line_1").value,
            'address_line_2': document.getElementById("edit_address_line_2").value,
            'city': document.getElementById("edit_city").value,
            'zip': document.getElementById("edit_zip").value,
            'user': username,
            'action': action
        },
        dataType: "json",
        success: function(result) {
            console.log("USER APPROVAL -- SUCCESS!" + result.updated);

            if(result.updated){
                //flip back to view
                document.getElementById("info_user").classList.remove("hidden");
                document.getElementById("editable_user").classList.add("hidden");

                //reload view, get current setting
                view_user_info(username, "", "", exclude_string, disable_edit_string);

                //reload approvals list
                update_approval_list();

                //reload main list
                update_user_list();

                //reload munis
                update_muni_admins("");

                //update the dca admins?
                flip_main_dcaapprovals(true, false);

                //flag success
                $.notify("User updated", "success");
            }else{
                //check for flagged errors
                try{
                    //check for user exists error
                    if(result.error == 'user exists'){
                        $("#saveChanges-1").modal("hide");

                        //open new modal to flag error
                        document.getElementById("info_ok_modal").innerHTML = "Duplicate name, please correct before saving.";
                        $('#fixInput-1').modal()
                    }

                    //check for email exists
                    if(result.error == 'email exists'){
                        $("#saveChanges-1").modal("hide");

                        //open new modal to flag error
                        document.getElementById("info_ok_modal").innerHTML = "Duplicate email, please correct before saving.";
                        $('#fixInput-1').modal()
                    }
                }catch(err){}
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

//user editing
function show_user_edit(do_edit){
    //flip pages
    if(do_edit){
        document.getElementById("info_user").classList.add("hidden");
        document.getElementById("editable_user").classList.remove("hidden");
    }else{
        document.getElementById("info_user").classList.remove("hidden");
        document.getElementById("editable_user").classList.add("hidden");
    }
}

//user approvals
function user_update(username, user_number, action, role){
    console.log("Numb "+user_number);

    //update role if required
    if(action == 'update_role'){
        document.getElementById("role_"+user_number).innerHTML = role;
    }

    //do Ajax call
    $.ajax({
        type: "POST",
        url: "/user/settings/",
        data: {
            'role': role,
            'notes': document.getElementById("text_"+user_number).value,
            'user': username,
            'action': action
        },
        dataType: "json",
        success: function(result) {
            console.log("USER APPROVAL -- SUCCESS!" + result.updated);

            if(result.updated){
                //flag success
                $.notify("User updated", "success");

                //reload approvals list
                update_approval_list();

                //reload main list
                update_user_list();

                //reload munis
                update_muni_admins("");

                //update the dca admins?
                flip_main_dcaapprovals(true, false);

            }else{
                //or failure
                $.notify("Error updating user", "error");
            }
        },
        error: function(result) {
            console.log("ERROR:", result)
            $.notify("Error updating user", "error");
        }
    });

}

//create new user
function create_new_dca_approver(tab_to_return_to, return_text){
    //clear edit form
    document.getElementById("edit_name").value = "";
    document.getElementById("edit_position").value = "";
    document.getElementById("edit_address_line_1").value = "";
    document.getElementById("edit_address_line_2").value = "";
    document.getElementById("edit_city").value = "";
    document.getElementById("edit_zip").value = "";
    document.getElementById("edit_email").value = "";
    document.getElementById("edit_voice").value = "";
    document.getElementById("edit_justification").innerHTML = "";
    document.getElementById("edit_username").innerHTML = "";

    //set code
    document.getElementById("edit_code").innerHTML = "";

    //set type of creation
    //document.getElementById("save_changes_button").name = "create_dca_admin";
    //re-enable as info not called first
    var re_enable_string = ['name','position','code','email','voice','justification','role','municipality','code','zip'];
    for(var i=0; i<re_enable_string.length; i++){
        try{
            document.getElementById("info_"+re_enable_string[i]+"_row").classList.remove("hidden");
            document.getElementById("edit_"+re_enable_string[i]+"_row").classList.remove("hidden");
        }catch(err){}
    }
    document.getElementById("save_changes_button").setAttribute( "onClick", "save_changes(document.getElementById('edit_username').innerHTML, 'create_dca_admin', 'justification,role,municipality,code,zip', '');" );

    //flip to edit
    document.getElementById("info_user").classList.add("hidden");
    document.getElementById("editable_user").classList.remove("hidden");

    //setup interface
    document.getElementById("data_4_decorator").innerHTML = `<span class="fa fa-users fa-5x "></span><p>DCA Approver Profile</p>`;
    document.getElementById("editable_user_decorator").innerHTML = `<span class="fa fa-users fa-5x "></span><p>DCA Approver Profile</p>`;
    document.getElementById("editable_user_modal").innerHTML = "You have made changes to this DCA Approver user profile. Would you like to save these changes?";

    //remove non essential elements of role and justification. Both edit and info
    document.getElementById("edit_justification_row").classList.add("hidden");
    document.getElementById("edit_role_row").classList.add("hidden");
    document.getElementById("edit_zip_row").classList.add("hidden");
    document.getElementById("edit_municipality_row").classList.add("hidden");
    document.getElementById("edit_code_row").classList.add("hidden");

    //flip pages to see edit
    document.getElementById("info_user_modal").innerHTML = "Are you sure you would like to delete this DCA Approver user profile?";
    document.getElementById("data_4").classList.remove("hidden");

    document.getElementById("data_"+tab_to_return_to).classList.add("hidden");
    try{
        document.getElementById("data_"+tab_to_return_to+"_notab").classList.add("hidden");

    }catch(err){}

    //set return link
    document.getElementById("navigation_4").innerHTML = "<a onclick=\"view_user_info('', "+tab_to_return_to+", '', '', '');\" href=\"#\"><span class=\"fa fa-chevron-left\"></span> "+return_text;
}

//create new user
function create_new_muni_admin(muni, code, tab_to_return_to, return_text){
    //clear edit form
    document.getElementById("edit_name").value = "";
    document.getElementById("edit_position").value = "";
    document.getElementById("edit_address_line_1").value = "";
    document.getElementById("edit_address_line_2").value = "";
    document.getElementById("edit_city").value = "";
    document.getElementById("edit_zip").value = "";
    document.getElementById("edit_email").value = "";
    document.getElementById("edit_voice").value = "";
    document.getElementById("edit_justification").innerHTML = "";
    document.getElementById("edit_username").innerHTML = "";

    //set edit selector for municipality
    var selctr = document.getElementById("edit_municipality_selector");
    for(var i=0; i<selctr.options.length; i++){
        if(muni == selctr.options[i].text){
            selctr.value = code;
        }
    }

    //for new muni lock this
    $('#edit_municipality_selector').prop('disabled', true);

    //set code
    document.getElementById("edit_code").innerHTML = code;

    //set type of creation
    //document.getElementById("save_changes_button").name = "create_muni_admin";
    //re-enable as info not called first
    var re_enable_string = ['name','position','code','email','voice','justification','role','municipality','code','zip'];
    for(var i=0; i<re_enable_string.length; i++){
        try{
            document.getElementById("info_"+re_enable_string[i]+"_row").classList.remove("hidden");
            document.getElementById("edit_"+re_enable_string[i]+"_row").classList.remove("hidden");
        }catch(err){}
    }
    document.getElementById("save_changes_button").setAttribute( "onClick", "save_changes(document.getElementById('edit_username').innerHTML, 'create_muni_admin', 'justification,role', 'municipality');" );

    //flip to edit
    document.getElementById("info_user").classList.add("hidden");
    document.getElementById("editable_user").classList.remove("hidden");

    //setup interface
    document.getElementById("data_4_decorator").innerHTML = `<span class="fa fa-user-circle fa-5x "></span><p>Municipal Approver Profile</p>`;
    document.getElementById("editable_user_decorator").innerHTML = `<span class="fa fa-user-circle fa-5x "></span><p>Municipal Approver Profile</p>`;
    document.getElementById("editable_user_modal").innerHTML = "You have made changes to this Municipal Approver user profile. Would you like to save these changes?";
    document.getElementById("info_user_modal").innerHTML = "Are you sure you would like to delete this Municipal Approver user profile?";

    //remove non essential elements of role and justification. Both edit and info
    document.getElementById("edit_justification_row").classList.add("hidden");
    document.getElementById("edit_role_row").classList.add("hidden");

    //flip pages to see edit
    document.getElementById("data_4").classList.remove("hidden");
    document.getElementById("data_"+tab_to_return_to).classList.add("hidden");

    //set return link
    document.getElementById("navigation_4").innerHTML = "<a onclick=\"view_user_info('', "+tab_to_return_to+", '', '', '');\" href=\"#\"><span class=\"fa fa-chevron-left\"></span> "+return_text;
}

//view user info
function view_user_info(username, tab_to_return_to, return_text, exclude_string, disable_edit_string){
    //get excludes
    var excludes = exclude_string.split(",");

    //get disables
    //console.log("Dis "+disable_edit_string);
    var disable_edit = [];
    try{
        disable_edit = disable_edit_string.split(",");
    }catch(err){}

    //console.log("data "+username);
    if(username != ""){
        //do Ajax call
        $.ajax({
            type: "GET",
            url: "/user/settings/",
            data: {
                'user': username,
                'action': 'get_user'
            },
            dataType: "json",
            success: function(result) {
                console.log("USER APPROVAL -- SUCCESS!" + result.updated);

                if(result.updated){
                    //console.log(result.data+","+result.data.name);
                    //put data into html
                    for(var user_var in result.data){
                        //info form
                        try {
                            var elmt = document.getElementById("info_"+user_var);
                            elmt.innerHTML = result.data[user_var];
                            document.getElementById("info_"+user_var+"_row").classList.remove("hidden");
                        }
                        catch(err) {
                        }

                        //edit form
                        try {
                            var elmt = document.getElementById("edit_"+user_var);
                            if(elmt.nodeName == "INPUT"){
                                elmt.value = result.data[user_var];
                            }else{
                                elmt.innerHTML = result.data[user_var];
                            }
                            document.getElementById("edit_"+user_var+"_row").classList.remove("hidden");
                        }
                        catch(err) {
                        }

                        //set edit selector for role
                        var selctr = document.getElementById("edit_role_selector");
                        for(var i=0; i<selctr.options.length; i++){
                            if(result.data.role == selctr.options[i].text){
                                selctr.value = result.data.role;
                            }
                        }
                        document.getElementById("edit_role_row").classList.remove("hidden");


                        //set edit selector for municipality
                        selctr = document.getElementById("edit_municipality_selector");
                        for(var i=0; i<selctr.options.length; i++){
                            if(result.data.municipality == selctr.options[i].text){
                                selctr.value = result.data.code;
                            }
                        }
                        document.getElementById("edit_municipality_row").classList.remove("hidden");
                        if(disable_edit.indexOf("municipality") > -1){
                            $('#edit_municipality_selector').prop('disabled', true);
                        }else{
                            $('#edit_municipality_selector').prop('disabled', false);
                        }

                        //flip pages
                        if(tab_to_return_to != ""){
                            //figure out return tab do fix decorator
                            if(tab_to_return_to == "2"){    //NJcoast users if returning to 2
                                if(result.is_muni){    //muni admin?
                                    var decorata_string = `<span class="fa fa-user-circle fa-5x "></span><p>${ result.current_muni } User Profile</p>`;
                                    document.getElementById("data_4_decorator").innerHTML = decorata_string;
                                    document.getElementById("editable_user_decorator").innerHTML = decorata_string;
                                    document.getElementById("editable_user_modal").innerHTML = "You have made changes to this Municipal Approver user profile. Would you like to save these changes?";
                                    document.getElementById("info_user_modal").innerHTML = "Are you sure you would like to delete this Municipal Approver user profile?";
                                }else{  //or dca?
                                    document.getElementById("data_4_decorator").innerHTML = `<span class="fa fa-users fa-5x "></span><p>NJcoast User Profile</p>`;
                                    document.getElementById("editable_user_decorator").innerHTML = `<span class="fa fa-users fa-5x "></span><p>NJcoast User Profile</p>`;
                                    document.getElementById("editable_user_modal").innerHTML = "You have made changes to this NJcoast user profile. Would you like to save these changes?";
                                    document.getElementById("info_user_modal").innerHTML = "Are you sure you would like to delete this NJcoast user profile?";
                                }
                            }else if(tab_to_return_to == "1"){  //If returning to 1 then Muni approvers
                                document.getElementById("data_4_decorator").innerHTML = `<span class="fa fa-user-circle fa-5x "></span><p>Municipal Approver Profile</p>`;
                                document.getElementById("editable_user_decorator").innerHTML = `<span class="fa fa-user-circle fa-5x "></span><p>Municipal Approver Profile</p>`;
                                document.getElementById("editable_user_modal").innerHTML = "You have made changes to this Municipal Approver user profile. Would you like to save these changes?";
                                document.getElementById("info_user_modal").innerHTML = "Are you sure you would like to delete this Municipal Approver user profile?";
                            }else{ //If returning to 5 then DCA approvers
                                document.getElementById("data_4_decorator").innerHTML = `<span class="fa fa-user-circle fa-5x "></span><p>DCA Approver Profile</p>`;
                                document.getElementById("editable_user_decorator").innerHTML = `<span class="fa fa-user-circle fa-5x "></span><p>DCA Approver Profile</p>`;
                                document.getElementById("editable_user_modal").innerHTML = "You have made changes to this DCA Approver user profile. Would you like to save these changes?";
                                document.getElementById("info_user_modal").innerHTML = "Are you sure you would like to delete this DCA Approver user profile?";
                            }
                            document.getElementById("data_"+tab_to_return_to).classList.add("hidden");
                            try{
                                document.getElementById("data_"+tab_to_return_to+"_notab").classList.add("hidden");
                            }catch(err){}
                        }
                        document.getElementById("data_4").classList.remove("hidden");

                        //set return link
                        if(return_text != ""){
                            document.getElementById("navigation_4").innerHTML = "<a onclick=\"view_user_info('', "+tab_to_return_to+", '', '', '');\" href=\"#\"><span class=\"fa fa-chevron-left\"></span> "+return_text;
                        }
                        //console.log("variable "+user_var+","+result.data[user_var]);

                        //set excludes
                        for(var i=0; i<excludes.length; i++){
                            try{
                                //console.log("Exc "+excludes[i]);
                                document.getElementById("edit_"+excludes[i]+"_row").classList.add("hidden");
                                document.getElementById("info_"+excludes[i]+"_row").classList.add("hidden");
                            }catch(err){}
                        }
                    }
                }else{
                    //or failure
                    console.log("Error retrieving user");
                }
            },
            error: function(result) {
                console.log("Error retrieving user!");
            }
        });
    }else{
        //flip pages back
        if(tab_to_return_to != ""){
            document.getElementById("data_"+tab_to_return_to).classList.remove("hidden");
            try{
                document.getElementById("data_"+tab_to_return_to+"_notab").classList.remove("hidden");
            }catch(err){}
        }
        document.getElementById("data_4").classList.add("hidden");

        //flip out of edit if editing
        show_user_edit(false);
    }
}

//flip the tabs and their data
function flip_tabs(id){
    //hide user info if open
    show_user_edit(false);
    document.getElementById("data_4").classList.add("hidden");

    /*if(id == "tab_1"){
        //reload munis
        update_muni_admins("");
    }else if(id == "tab_2" || id == "tab_3"){
        //reload main list (and approval list)
        update_user_list();
        //reload approvals list
        update_approval_list();
    }*/

    //update the dca admins?
    //flip_main_dcaapprovals(true, false);

    //clear Active and set new
    for(var i=1; i<=3; i++){
        //remove active
        if("tab_"+i != id){
            try{
                document.getElementById("tab_"+i).classList.remove("active");
                document.getElementById("data_"+i).classList.add("hidden");
            }catch(err){}
        }else{ //add active
            try{
                document.getElementById(id).classList.add("active");
                document.getElementById("data_"+i).classList.remove("hidden");
            }catch(err){}
        }
    }

}
