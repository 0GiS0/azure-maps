$.ajax({
    url: 'https://azuremaps-functions.azurewebsites.net/api/GetIP',
    type: 'GET'
}).done(function (result) {
    $("#YourIP").text("This is your IP: " + result);

    $.ajax({
        url: 'https://atlas.microsoft.com/geolocation/ip/json',
        type: 'GET',
        data: {
            'subscription-key': '<your azure maps key>',
            'api-version': '1.0',
            'ip': result
        }
    }).done(function (result) {
        $("#jsonResult").text(JSON.stringify(result, null, 2));
    });

}).fail(function (err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
});