app.factory('Map', function($rootScope, $log, $q, localStorageService, GoogleDistanceMatrixService) {

    var factory = {};

    if ($rootScope.otherUsers == undefined) {
        $rootScope.otherUsers = localStorageService.get('otherUsers');
    }

    if ($rootScope.currentUser == undefined) {
        $rootScope.currentUser = localStorageService.get('currentUser');
    }

    if ($rootScope.users == undefined) {
        $rootScope.users = localStorageService.get('users');
    }

    factory.drawMap = function () {

      factory.mapCenter = new google.maps.LatLng($rootScope.currentUser.latitude, $rootScope.currentUser.longitude);

      factory.map = new google.maps.Map(document.getElementById('google-map'), {
          zoom: 16,
          scrollwheel: false,
          mapTypeControl: false,
          disableDoubleClickZoom: true,
          draggable: true,
          zoomControl: true,
          panControl: true,
          scaleControl: true,
          streetViewControl: true,
          center: factory.mapCenter,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      factory.directionsDisplay = new google.maps.DirectionsRenderer({
          map: factory.map,
          suppressMarkers: true,
          suppressPolylines: false
      });

      factory.distances = [];

    };



    var placeMark = function(mark_i, l) {

        return function() {

            var iconUrl = $rootScope.users[mark_i].id == $rootScope.currentUser.id ? 'images/home.png' : 'images/dog.png';

            var new_marker = new google.maps.Marker({
                position: l,
                map: factory.map,
                animation: google.maps.Animation.DROP,
                icon: {
                    size: new google.maps.Size(32, 32),
                    scaledSize: new google.maps.Size(32, 32),
                    url: iconUrl
                },
                info: "<div class='infowindow-wrapper'" + "<div class='panel panel-default infowindow' id='modal'>" + "<div class='panel-header'>" + "<h3 class='panel-title'> " + $rootScope.users[mark_i].first_name + " & " + $rootScope.users[mark_i].dogs[0].name + "</h3>" + "</div>" + "<div class='panel-body'>" + "<div class='row'>" + "<div class='col-xs-6 image-wrapper'>" + "<img preload-image src='" + $rootScope.users[mark_i].avatar_url + "' class='img-responsive'>" + "<p>" + $rootScope.users[mark_i].email + "</p>" + "<p>" + $rootScope.users[mark_i].address + "</p>" + "</div>" + "<div class='col-xs-6 image-wrapper'>" + "<img preload-image src='" + $rootScope.users[mark_i].dogs[0].avatar_url + "' class='img-responsive'>" + "<p> Breed: " + $rootScope.users[mark_i].dogs[0].breed + "</p>" + "<p> Age: " + $rootScope.users[mark_i].dogs[0].age + "</p>" + "<p> Gender: " + $rootScope.users[mark_i].dogs[0].gender + "</p>" + "</div>" + "</div>" + "</div>" + "</div>" + "</div>"
            });

            var info_bubble = new InfoBubble({
                borderwidth: 0,
                shadowStyle: 0,
                padding: 0,
                borderRadius: 5,
                backgroundColor: '#364347',
                arrowStyle: 2,
            });

            google.maps.event.addListener(new_marker, 'click', function() {
                info_bubble.setContent(this.info);
                info_bubble.open(this.getMap(), this);
            });

            google.maps.event.addListener(factory.map, "click", function() {
                this.info.close(factory.map, new_marker);
            });

            return new_marker;
        }();

    };

    factory.placeMarkers = function(locs) {
        for (var i = 0; i < locs.length; i++) {
            var a_marker = function(j, l) {
                placeMark(j, l);
            }(i, locs[i]);
        }
        console.log("Marks placed");
    };


    factory.getDistances = function() {
        var d = $q.defer();
        GoogleDistanceMatrixService.calculateDistances($rootScope.currentUser.address, $rootScope.otherUsers, function(us) {
            $rootScope.otherUsers = us;
            localStorageService.set('otherUsers', us);
            console.log("distances retrieved");
            d.resolve(us);
        });
        return d.promise;
    };

    factory.getRoute = function(org, user, callback) {
        var dir_service = new google.maps.DirectionsService();
        route_query = {
            origin: org.address,
            destination: user.address,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        };
        dir_service.route(route_query, function(res, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                callback(res);
            };
        });
    };

    factory.initializeMap = function() {
      factory.drawMap();
      var promise = factory.getDistances();
      promise.then(function(){
        factory.placeMarkers(factory.getLocations($rootScope.users));
      });
    };

    factory.getLocations = function(users) {
        var arr = [];
        for (var i = 0; i < users.length; i++) {
            arr.push(new google.maps.LatLng(users[i].latitude, users[i].longitude));
        }
        return arr;
    };

    return factory;
});



app.service('GoogleDistanceMatrixService', function() {

    var factory = new google.maps.DistanceMatrixService();

    factory.calculateDistances = function(origin, users, callback) {
        var extractResult = function(res, status) {
            var twoWords = new RegExp(/\S+\s\S+/i);
            for (var i = 0; i < res.rows[0].elements.length; i++) {
                for (var j = 0; j < users.length; j++) {
                    var userAddress = users[j].address.match(twoWords);
                    var destinationAddress = res.destinationAddresses[i].match(twoWords);
                    if (userAddress[0] == destinationAddress[0]) {
                        users[j].distanceData = res.rows[0].elements[i];
                    }
                }
            }
            callback(users);
        };

        var destinations = [];
        for (var i = 0; i < users.length; i++) {
            destinations.push(users[i].address);
        }
        factory.getDistanceMatrix({
            origins: [origin],
            destinations: destinations,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
        }, extractResult);
    };

    return factory;
});