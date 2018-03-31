function start_expert_simulation(){
    console.log("start sim");

    data = {
      "index_SLT": [1,1],
      "index_W": 0,
      "index_prob": 1,
      "indicator": 1,
      "param": [40.317410, -73.987433, -27.361499, 50.000000, 45.000000, 70.000000],
      "timeMC": 19.949732,
      "lat_track": 41.000493,
      "long_track": -72.610756,
      "SLR": 0.1,
      "tide": 0,
      "runup_file": "heatmap.json",
      "workspace_file": ""
  };

  console.log(JSON.stringify(data));

  //do Ajax
  send_expert_data_to_server(data);

}

//AJAX stuff to send JSON to server (as the name implies)
function send_expert_data_to_server(data) {
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:9090/single?name=chris&id=123",
        data: JSON.stringify(data),
        //dataType: "json",
        contentType: 'application/json',
        success: function (result) {
            console.log("EXPERT SIMULATION -- SUCCESS!", result);
            //$.notify( result.annotations + " annotations saved", "success");
        },
        error: function (result) {
            console.log("EXPERT SIMULATION -- ERROR:", result)
            //$.notify("Error saving map annotations", "error");
        }
    });
}

//AJAX stuff to send JSON to server (as the name implies)
//https://s3.amazonaws.com/simulation.njcoast.us/simulation/chris/123/heatmap.json
function get_expert_data_to_server() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:9090/status?name=chris&id=123",
        //data: data,
        dataType: "json",
        //contentType: 'application/json',
        success: function (result) {
            console.log("EXPERT SIMULATION -- SUCCESS!", result);
            //$.notify( result.annotations + " annotations saved", "success");
        },
        error: function (result) {
            console.log("EXPERT SIMULATION -- ERROR:", result)
            //$.notify("Error saving map annotations", "error");
        }
    });
}
