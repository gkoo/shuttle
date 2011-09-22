$(function() {
  var infoElem          = $('#info'),
      distanceProxyUrl  = 'http://koo.no.de/distanceproxy/',
      closestStopUrl    = 'http://koo.no.de/closestdistance/',
      networkFleetUrl   = 'http://64.87.15.235/networkfleetcar/getfleetgpsinfoextended?u=linked-in&p=linkedin',
      li_latlng         = '37.423327,-122.071152',
      map,
      shuttleLatLng,
      browserSupportFlag = false,
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
    var distanceData = extractDistanceData(JSON.parse(data)),
        distElem     = infoElem.find('.dist .value'),
        etaElem      = infoElem.find('.eta .value');
    if (!distanceData) { return; }
    if (!distElem.length) {
      distElem = $('<span>').addClass('value');
      infoElem.find('.dist').prepend(distElem);
    }
    if (!etaElem.length) {
      etaElem = $('<span>').addClass('value');
      infoElem.find('.eta').prepend(etaElem);
    }

    if (distanceData.distance && distanceData.distance.text) {
      distElem.text(parseFloat(distanceData.distance.text));
      infoElem.find('.dist').css('display', 'inline');
    }
    if (distanceData.duration && distanceData.duration.text) {
      etaElem.text(parseInt(distanceData.duration.text));
      infoElem.find('.eta').css('display', 'inline');
    }
    infoElem.children('.thinking').hide();
    infoElem.children('ul').show();
  },

  drawMap = function(latitude, longitude) {
    map = new google.maps.Map(document.getElementById("map_canvas"),{
      zoom: 13,
      center: new google.maps.LatLng(latitude, longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false
    });

    busmarker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map: map,
      icon: new google.maps.MarkerImage("img/busicon.png"),
      title: "Shuttle Current Location",
      animation: google.maps.Animation.DROP
    });

    addStops();
    addYou();
  },

  handleTrackingData = function(attr) {
    // Have to proxy Google Distance Matrix API since it doesn't support JSONP
    var i, len;

    shuttleLatLng = attr.Latitude + ',' + attr.Longitude;
    setupStopChooser();

    drawMap(attr.Latitude, attr.Longitude);

    infoElem.find('.speed').prepend($('<span>').text(attr.AvgSpeed)
                                               .addClass('value'))
                           .css('display', 'inline');
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
          icon: new google.maps.MarkerImage("img/otherstopicon.png"),
          map: map,
          title: currStop.name
        });
      }
    }
  },
  
  addYou = function() {
    if (navigator.geolocation) {
      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        youmarker = new google.maps.Marker({
          position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          map: map,
          icon: new google.maps.MarkerImage("img/youicon.png"),
          title: "You're here!",
          animation: google.maps.Animation.BOUNCE
        });
      });
    } else {
      browserSupportFlag = false;
    }
  },

  getClosestStopToYou = function(callback) {
    // returns closest stop (index in the stops array)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $.ajax(closestStopUrl + [position.coords.latitude, position.coords.longitude].join(','), {
          dataType: 'jsonp',
          success: function(idx) {
            callback(idx);
          }
        });
      });
    } else {
      callback(stops.length-1); // default to linkedin campus
    }
  },

  setupStopChooser = function() {
    var stopChooser = $('#stopChooser');

    stopChooser.change(function() {
      var val     = stopChooser.val(),
          idx     = parseInt(val, 10),
          stop    = stops[idx],
          latlng  = [stop.location.latitude, stop.location.longitude].join(',');

      $.ajax(distanceProxyUrl + encodeURIComponent(shuttleLatLng) + '/' + encodeURIComponent(latlng), {
        dataType: 'jsonp',
        success: handleDistanceData
      });
      infoElem.children('ul').hide();
      infoElem.children('.thinking').show();
    });

    getClosestStopToYou(function(idx) {
      stopChooser.val(idx);
      stopChooser.trigger('change');
    });
  },

  setupActions = function() {
    // Setup jump links
    $("#youLoc").click(function() {
      if (youmarker) {
        centerMap(youmarker.position.lat(), youmarker.position.lng());
      }
    });
    $("#shuttleLoc").click(function() {
      if (busmarker) {
        centerMap(busmarker.position.lat(), busmarker.position.lng());
      }
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
    $.ajax(networkFleetUrl, {
      crossDomain: true,
      dataType: 'jsonp',
      success: function(data, textStatus) {
        var attr;
        if (!data || !data.features || !data.features.length) {
          return;
        }
        attr = data.features[0].attributes;
        shuttleLatLng = attr.Latitude + ',' + attr.Longitude;
        busmarker.setPosition(new google.maps.LatLng(attr.Latitude, attr.Longitude));
        setupPolling();
      }
    });
  },

  init = function() {
    $.ajax(networkFleetUrl, {
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

    setupActions();
    setupPolling();
  };

  init();
});
