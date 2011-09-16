$(function() {
  var container         = $('#container'),
      distanceListElem  = $('#distanceData'),
      li_latlng         = '37.423327,-122.071152',

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
        i, len, fieldName, fieldValue, newDataItem,
        map = new GMap2(document.getElementById("map_canvas"));

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

    container.append(newDataList);

    $("#touch-init").remove();
    $("html").removeClass("initial-bootstrapping");
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
