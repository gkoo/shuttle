$(function() {
  var container         = $('#container'),
      distanceListElem  = $('#distanceData'),
      li_latlng         = '37.423327,-122.071152',
      map = new GMap2(document.getElementById("map_canvas")),
      stops = [
        {
          name: "Lombard & Fillmore",
          description: "SW corner in front of KFC/Taco Bell",
          pickupTime: {
            hours: 7,
            minutes: 10
          },
          location: {
            latitude: 37.799985,
            longitude: -122.436018
          }
        },
        {
          name: "Union & Van Ness",
          description: "NW corner in front of Silver Platter Deli",
          pickupTime: {
            hours: 7,
            minutes: 15
          },
          location: {
            latitude: 37.798679,
            longitude: -122.424109
          }
        },
        {
          name: "Sacramento & Van Ness",
          description: "NW corner in front of Toyota/Scion Dealership",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.791388,
            longitude: -122.422425
          }
        },
        {
          name: "Divisadero & Grove",
          description: "NW corner by BBQ parking lot",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.775956,
            longitude: -122.437928
          }
        },
        {
          name: "Castro & Market",
          description: "SW corner in front of the Diesel store",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.762768,
            longitude: -122.435181
          }
        },
        {
          name: "24th St. & Noe",
          description: "SW corner in front of Rabat",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.751512,
            longitude: -122.431866
          }
        },
        {
          name: "24th St. & Mission",
          description: "SW corner in front of BART/Muni station (in front of public bathroom)",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.752284,
            longitude: -122.418433
          }
        },
        {
          name: "Cesar Chavez & Folsom",
          description: "SW corner near the church",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.748271,
            longitude: -122.413659
          }
        },
        {
          name: "Millbrae Caltrain Station",
          description: "",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.601193,
            longitude: -122.384852
          }
        },
        {
          name: "LinkedIn Campus",
          description: "In front of 2027 Stierlin",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.423301,
            longitude: -122.071956
          }
        },
        {
          name: "LinkedIn Sales Development",
          description: "Front of 2037 Landings",
          pickupTime: {
            hours: 7,
            minutes: 20
          },
          location: {
            latitude: 37.419782,
            longitude: -122.088554
          }
        }
      ];

  // Display the distance data from Google Distance Matrix API.
  handleDistanceData = function(data) {
    var distanceData;
    if (data && data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
      distanceData = data.rows[0].elements[0];

      if (distanceData.distance && distanceData.distance.text) {
        distanceListElem.append($('<li>').text('Distance from LinkedIn: ' + distanceData.distance.text));
      }
      if (distanceData.duration && distanceData.duration.text) {
        distanceListElem.append($('<li>').text('Time to reach LinkedIn: ' + distanceData.duration.text));
      }
    }
  },

  handleTrackingData = function(attr) {
    // create map
    var latitude          = attr.Latitude,
        longitude         = attr.Longitude,
        latlng            = latitude+','+longitude,
        // Have to proxy Google Distance Matrix API since it doesn't support JSONP
        distanceProxyUrl  = 'http://koo.no.de/distanceproxy/' + encodeURIComponent(latlng) + '/' + encodeURIComponent(li_latlng),
        newDataList       = $('<ul>'),
        relevantFields    = ['MaxSpeed',
                             'AvgSpeed',
                             'InstSpeed',
                             'StreetName',
                             'City',
                             'Zip'],
        i, len, fieldName, fieldValue, newDataItem;

    $.ajax(distanceProxyUrl, {
      crossDomain: true,
      dataType: 'jsonp',
      success: handleDistanceData
    });
    
    map.setCenter(new GLatLng(latitude, longitude), 13);
    map.addOverlay(new GMarker(new GLatLng(latitude, longitude)));
    map.setUIToDefault();

    for (i=0,len=relevantFields.length; i<len; ++i) {
      fieldName = relevantFields[i];
      if (fieldName) {
        fieldValue = attr[fieldName];
        newDataItem = $('<li>').text(fieldName + ': ' + fieldValue);
        newDataList.append(newDataItem);
      }
    }
    
    addStops();
    container.append(newDataList);

    $("#touch-init").remove();
    $("html").removeClass("initial-bootstrapping");
  };
  
  addStops = function() {
    var i,len,currStop;
    for (i=0,len=stops.length;i<len;++i) {
      currStop=stops[i];
      if (currStop) {
        map.addOverlay(new GMarker(new GLatLng(currStop.location.latitude, currStop.location.longitude)));
      }
    }
  };

  $.ajax('http://64.87.15.235/networkfleetcar/getfleetgpsinfoextended?u=linked-in&p=linkedin', {
    crossDomain: true,
    dataType: 'jsonp',
    success: function(data, textStatus) {
      var obj, attr, latitude, longitude, i, len, field, url;
      if (!data || !data.features || !data.features.length) {
        return;
      }
      attr = data.features[0].attributes;
      if (!attr) return;
      handleTrackingData(attr);
    }
  });
});
