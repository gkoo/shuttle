$(function() {
  var container         = $('#container'),
      distanceListElem  = $('#distanceData'),
      distanceProxyUrl  = 'http://koo.no.de/distanceproxy/',
      li_latlng         = '37.423327,-122.071152',
      map,
      currLatLng,
      busmarker, youmarker,
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
        }
      ],

  extractDistanceData = function(data) {
    if (data && data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
      return data.rows[0].elements[0];
    }
    else {
      return null;
    }
  },

  // Display the distance data from Google Distance Matrix API.
  handleDistanceData = function(data) {
    var distanceData = extractDistanceData(data);
    if (!distanceData) { return; }

    distanceListElem.empty();
    if (distanceData.distance && distanceData.distance.text) {
      distanceListElem.append($('<li>').html('<strong>Distance from LinkedIn:</strong> ' + distanceData.distance.text));
    }
    if (distanceData.duration && distanceData.duration.text) {
      distanceListElem.append($('<li>').html('<strong>Time to reach LinkedIn:</strong> ' + distanceData.duration.text));
    }
  },

  drawMap = function(latitude, longitude) {
    var browserSupportFlag = false;
    
    map = new google.maps.Map(document.getElementById("map_canvas"),{
      zoom: 13,
      center: new google.maps.LatLng(latitude, longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }); 

    if (navigator.geolocation) {
      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        youmarker = new google.maps.Marker({
          position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          map: map,
          icon: new google.maps.MarkerImage("img/you.png"),
          title: "You're here!",
          animation: google.maps.Animation.BOUNCE
        });
      });
    } else {
      browserSupportFlag = false;
    }

    busmarker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map: map,
      icon: new google.maps.MarkerImage("img/bus.png"),
      title: "Shuttle Current Location",
      animation: google.maps.Animation.DROP
    });

    addStops();
  },

  handleTrackingData = function(attr) {
    // Have to proxy Google Distance Matrix API since it doesn't support JSONP
    var newDataList       = $('<ul>'),
        relevantFields    = ['MaxSpeed',
                             'AvgSpeed',
                             'InstSpeed',
                             'StreetName',
                             'City',
                             'Zip'],
        i, len, fieldName, fieldValue, newDataItem;

    currLatLng = attr.Latitude + ',' + attr.Longitude;

    drawMap(attr.Latitude, attr.Longitude);

    for (i=0,len=relevantFields.length; i<len; ++i) {
      fieldName = relevantFields[i];
      if (fieldName) {
        fieldValue = attr[fieldName];
        newDataItem = $('<li>').html('<strong>' + fieldName + ':</strong> ' + fieldValue);
        newDataList.append(newDataItem);
      }
    }

    container.append(newDataList);
  },
  
  centerMap = function(lat, long) {
    map.setCenter(new google.maps.LatLng(lat, long));
  },

  addStops = function() {
    var i,len,currStop;
    for (i=0,len=stops.length;i<len;++i) {
      currStop=stops[i];
      if (currStop) {
        new google.maps.Marker({
          position: new google.maps.LatLng(currStop.location.latitude, currStop.location.longitude),
          map: map,
          title: currStop.name
        });
      }
    }
  },

  setupStopChooser = function() {
    var stopChooser = $('#stopChooser');

    stopChooser.change(function() {
      var val     = stopChooser.val(),
          idx     = parseInt(val, 10),
          stop    = stops[idx],
          latlng  = [stop.location.latitude, stop.location.longitude].join(',');
          
      centerMap(stop.location.latitude, stop.location.longitude);
      
      $.ajax(distanceProxyUrl + encodeURIComponent(currLatLng) + '/' + encodeURIComponent(latlng), {
        dataType: 'jsonp',
        success: handleDistanceData
      });
    });
  },
  
  setupYouToggle = function() {
    var youLink = $("#youLoc");
    
    youLink.click(function() {
      centerMap(youmarker.position.lat(), youmarker.position.lng());
    });
  },
  
  setupShuttleToggle = function() {
    var shuttleLink = $("#shuttleLoc");
    
    shuttleLink.click(function() {
      centerMap(busmarker.position.lat(), busmarker.position.lng());
    });
  },
  
  setupPolling = function() {
    //Data actually does not refresh any faster than 1 minute intervals
    setTimeout(function() {
      executePoll();
    },60000);
  },
  
  executePoll = function() {
    //Update shuttle loc
    $.ajax('http://64.87.15.235/networkfleetcar/getfleetgpsinfoextended?u=linked-in&p=linkedin', {
      crossDomain: true,
      dataType: 'jsonp',
      success: function(data, textStatus) {
        var attr;
        if (!data || !data.features || !data.features.length) {
          return;
        }
        attr = data.features[0].attributes;
        busmarker.setPosition(new google.maps.LatLng(attr.Latitude, attr.Longitude));
        setupPolling();
      }
    });
  },

  init = function() {
    $.ajax('http://64.87.15.235/networkfleetcar/getfleetgpsinfoextended?u=linked-in&p=linkedin', {
      crossDomain: true,
      dataType: 'jsonp',
      success: function(data, textStatus) {
        var obj, attr, latitude, longitude, i, len, field, url;
        if (!data || !data.features || !data.features.length) {
          return;
        }
        attr = data.features[0].attributes;
        if (!attr) { return; }
        handleTrackingData(attr);
        $("#touch-init").remove();
        $("html").removeClass("initial-bootstrapping");
        setTimeout(function() {
          window.scrollTo(0,0);
        },0);
      }
    });

    setupStopChooser();
    setupYouToggle();
    setupShuttleToggle();
    setupPolling();
  };

  init();
});
