map.addEventListener("click", searchLayer, (e) => {

    var
        startPoint = new atlas.data.Point([yourLocation.coords.longitude, yourLocation.coords.latitude]),
        coords = JSON.parse("[" + e.features[0].properties.position + "]"),
        destinationPoint = new atlas.data.Point([coords[1], coords[0]]),
        startPin = new atlas.data.Feature(startPoint, {
            title: "Your location",
            icon: "pin-round-blue"
        }),
        destinationPin = new atlas.data.Feature(destinationPoint, {
            title: e.features[0].properties.name,
            icon: "pin-blue"
        });

    // Fit the map window to the bounding box defined by the start and destination points
    var swLon = Math.min(startPoint.coordinates[0], destinationPoint.coordinates[0]),
        swLat = Math.min(startPoint.coordinates[1], destinationPoint.coordinates[1]),
        neLon = Math.max(startPoint.coordinates[0], destinationPoint.coordinates[0]),
        neLat = Math.max(startPoint.coordinates[1], destinationPoint.coordinates[1]);

    map.setCameraBounds({
        bounds: [swLon, swLat, neLon, neLat],
        padding: 50
    });

    // Add pins to the map for the start and end point of the route
    map.addPins([startPin, destinationPin], {
        name: "route-pins",
        textFont: "SegoeUi-Regular",
        textOffset: [0, -20]
    });

    //Get directions
    var routeLayer = "routes";
    map.addLinestrings([], {
        name: routeLayer,
        color: "#2272B9",
        width: 5,
        cap: "round",
        join: "round",
        before: "labels"
    });

    //Get the directions calling /route/directions
    $.ajax({
        url: 'https://atlas.microsoft.com/route/directions/json',
        type: 'GET',
        data: {
            'api-version': '1.0',
            'subscription-key': AzureMapsKey,
            'query': startPoint.coordinates[1] + ',' + startPoint.coordinates[0] + ':' + destinationPoint.coordinates[1] + ',' + destinationPoint.coordinates[0]
        }
    }).done(function (result) {
        var route = result.routes[0];

        //Route info      
        $("#departureTime").text(new Date(route.summary.departureTime).toLocaleTimeString());
        $("#arrivalTime").text(new Date(route.summary.arrivalTime).toLocaleTimeString());
        $("#lengthInKm").text((Math.round((route.summary.lengthInMeters / 1000) * 100 / 100)) + ' kilometers');
        $("#trafficDelayInSeconds").text((Math.round((route.summary.trafficDelayInSeconds / 60) * 100) / 100) + ' minutes');
        $("#travelTimeInSeconds").text((Math.round((route.summary.travelTimeInSeconds / 60) * 100) / 100) + ' minutes');
        $("#routeInfo").show();

        var routeCoordinates = [];
        for (var leg of route.legs) {
            var legCoordinates = leg.points.map((point) => [point.longitude, point.latitude]);
            routeCoordinates = routeCoordinates.concat(legCoordinates);
        }

        var routeLinestring = new atlas.data.LineString(routeCoordinates);
        map.addLinestrings([new atlas.data.Feature(routeLinestring)], { name: routeLayer });

        // Add Traffic Flow to the Map
        map.setTraffic({
            flow: "relative"
        });

    }).fail(function () {
        //error
        console.warn('ERROR(' + err.code + '): ' + err.message);
    });
});