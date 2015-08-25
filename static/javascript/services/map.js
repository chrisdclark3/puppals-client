app.factory('MapsFactory', function ($http, $rootScope, $log, $q) {

  var factory = {};
  factory.distances = [];

  factory.get_route = function (org, user, callback) {
    var dir_service = new google.maps.DirectionsService();
    route_query = {
      origin: org.address,
      destination: user.address,
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.IMPERIAL
    };
    dir_service.route(route_query, function (res, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        callback(res);
      };
    });
  };

  factory.get_locations = function (users) {
    var arr = [];
    for (var i = 0; i < users.length; i++) {
      arr.push(new google.maps.LatLng(users[i].latitude, users[i].longitude));
    }
    return arr;
  };

  return factory;
});



app.service('GoogleDistanceMatrixService', function(){
    var api = {};
    api.calculate_distances = function(origin, users, callback) {
      var destinations = [];
      var two_words = new RegExp(/\S+\s\S+/i);
      for (var i = 0; i < users.length; i++) {
        destinations.push(users[i].address);
      }
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
        origins: [origin],
        destinations: destinations,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      }, extract_result);

      function extract_result(res, status) {
        console.log(res, status);
        for (var i = 0; i < res.rows[0].elements.length; i++) {
          for (var j = 0; j < users.length; j++) {
            var user_add = users[j].address.match(two_words);
            var dest_add = res.destinationAddresses[i].match(two_words);
            user_add = user_add[0];
            dest_add = dest_add[0];
            if (user_add == dest_add) {
              users[j].distance_data = res.rows[0].elements[i];
            }
          }
        }

        callback(users);
      }
    };

  return api;
});
