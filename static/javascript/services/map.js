app.factory('Map', function($timeout, $rootScope, $window, $q, localStorageService) {

    var factory = {};

    if ($rootScope.currentUser == undefined) {
        $rootScope.currentUser = localStorageService.get('currentUser');
    }
    if ($rootScope.users == undefined) {
        $rootScope.users = localStorageService.get('users');
    }
    if ($rootScope.otherUsers == undefined) {
        $rootScope.otherUsers = localStorageService.get('otherUsers');
    }

    factory.drawMap = function() {

        factory.mapCenter = new google.maps.LatLng($rootScope.currentUser.latitude, $rootScope.currentUser.longitude);

        factory.map = new google.maps.Map(document.getElementById('google-map'), {
            zoom: 16,
            scrollwheel: false,
            mapTypeControl: false,
            disableDoubleClickZoom: true,
            draggable: true,
            zoomControl: true,
            panControl: true,
            scaleControl: false,
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

        console.log("Drawing map...");
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


    factory.getLocations = function(users) {

        var arr = [];
        for (var i = 0; i < users.length; i++) {
            if (users[i].distanceData == undefined) {
                arr.push(new google.maps.LatLng(users[i].latitude, users[i].longitude));
            }
        }
        return arr;
    };

    factory.getDistances = function(origin) {
        console.log("ORIGIN", origin);
        var def = $q.defer();
        var others = localStorageService.get('otherUsers');
        console.log("otherUsers", others);
        var distanceMatrix = new google.maps.DistanceMatrixService();
        var destinations = factory.getLocations(others);
        var twoWords = new RegExp(/\S+\s\S+/i);

        distanceMatrix.getDistanceMatrix({
            origins: [origin],
            destinations: destinations,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
        }, function(res, status) {
        	console.log("res", res);
            for (var i = 0; i < res.rows[0].elements.length; i++) {
                others[i].distanceData = res.rows[0].elements[i];
            }
            def.resolve(others);
        });
        return def.promise;
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

    return factory;
});