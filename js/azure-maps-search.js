 //Render map
 var AzureMapsKey = "<your-azure-maps-key>";
 var map = new atlas.Map("map", {
     "subscription-key": AzureMapsKey
 });

 //Search
 var searchLayer = "search";
 map.addPins([], {
     name: searchLayer,
     cluster: false,
     icon: "pin-red"
 });

 //HTML 5 geolocation and Azure Maps Search
 function success(pos) {
     var url = "https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&query=bank&subscription-key=" + AzureMapsKey + "&lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude + "&radius=100000";
     debugger;
     $.ajax({
         url: url,
         type: "GET"

     }).done(function (data) {
         var searchPins = data.results.map((poi) => {
             var poiPosition = [poi.position.lon, poi.position.lat];
             return new atlas.data.Feature(new atlas.data.Point(poiPosition), {
                 name: poi.poi.name,
                 address: poi.address.streetName + ", " + poi.address.streetNumber,
                 position: poi.position.lat + ", " + poi.position.lon,
                 phone: poi.poi.phone,
                 categories: poi.poi.categories.toString()
             });
         });

         map.addPins(searchPins, {
             name: searchLayer
         });


         //Get all longitudes
         var lons = searchPins.map((pin) => { return pin.geometry.coordinates[0] });
         //Get all latitudes
         var lats = searchPins.map((pin) => { return pin.geometry.coordinates[1] });

         //the min longitude and latitude
         var swLon = Math.min.apply(null, lons);
         var swLat = Math.min.apply(null, lats);
         //the max longitude and latitude
         var neLon = Math.max.apply(null, lons);
         var neLat = Math.max.apply(null, lats);

         //Set the bounds of the map
         map.setCameraBounds({
             bounds: [swLon, swLat, neLon, neLat],
             padding: 50
         });

     });

     // Add a popup to the map which will display some basic information about a search result on hover over a pin
     var popup = new atlas.Popup();
     map.addEventListener("mouseover", searchLayer, (e) => {
         var popupContentElement = document.createElement("div");
         // popupContentElement.style.padding = "5px";
         popupContentElement.className = "poi-content-box";

         var popupNameElement = document.createElement("div");
         popupNameElement.innerText = e.features[0].properties.name;
         popupNameElement.className = "poi-title-box";
         popupContentElement.appendChild(popupNameElement);

         var popupInfoBoxElement = document.createElement("div");
         popupInfoBoxElement.className = "poi-info-box font-segoeui";
         popupContentElement.appendChild(popupInfoBoxElement);


         var popupAddressElement = document.createElement("div");
         popupAddressElement.innerText = e.features[0].properties.address;
         popupAddressElement.className = "info location";
         popupInfoBoxElement.appendChild(popupAddressElement);

         var popupPositionElement = document.createElement("div");
         popupPositionElement.innerText = e.features[0].properties.phone;
         popupPositionElement.className = "info phone";
         popupInfoBoxElement.appendChild(popupPositionElement);

         var popupCategoriesElement = document.createElement("div");
         popupCategoriesElement.innerText = e.features[0].properties.categories;
         popupCategoriesElement.className = "info category";
         popupInfoBoxElement.appendChild(popupCategoriesElement);

         popup.setPopupOptions({
             position: e.features[0].geometry.coordinates,
             content: popupContentElement
         });

         popup.open(map);
     });

 }

 function error(err) {
     console.warn('ERROR(' + err.code + '): ' + err.message);
 }

 //Get your coordinates
 navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });