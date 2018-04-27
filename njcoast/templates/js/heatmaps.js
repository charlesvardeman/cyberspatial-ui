function create_surge_heatmap(data){
    var heatData = {
        max: 1000.00,
        data: []
    };

    var data_array = data;
    for( var i = 0; i < data.length; i++ ){
        heatData.data.push({
            lat: data[i][0], 
            lng: data[i][1], 
            value: Math.max(data[i][2], 0.0),
        });
    }

    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": 0.04,
        "opacity": 0.65,
        "maxOpacity": 0.75, 
        // scales the radius based on map zoom
        "scaleRadius": true, 
        "gradient": {
            // enter n keys between 0 and 1 here
            // for gradient color customization
            '.1': 'blue',
            '.3': 'yellow',
            '.6': 'orange',
            '.9': 'red',
        },
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries 
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": false,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'value'
    };

    var hLayer = new HeatmapOverlay(cfg);
    hLayer.setData(heatData);
    
    return hLayer;
}

function create_wind_heatmap(data){
    var heatData = {
        max: 200.00,
        data: []
    };

    var data_array = data;
    for( var i = 0; i < data.length; i++ ){
        heatData.data.push({
            lat: data[i][0], 
            lng: data[i][1], 
            value: Math.max(data[i][2], 0.0),
        });
    }

    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": 0.0075,
        "opacity": 0.65,
        "maxOpacity": 0.75, 
        // scales the radius based on map zoom
        "scaleRadius": true,  
        "gradient": {
            '0.37': '#ffffcc',
            '0.475': '#ffe775',
            '0.555': '#ffc140',
            '0.65': '#ff8f20',
            '0.785': '#ff6060',
        },
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries 
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": false,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'value'
    };

    var hLayer = new HeatmapOverlay(cfg);
    hLayer.setData(heatData);
    
    return hLayer;
}