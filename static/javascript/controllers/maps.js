app.controller('Maps', function($modal, Filter, $window, $scope, $rootScope, $location, User, Map, GoogleDistanceMatrixService, localStorageService, socket, $q) {
    var address_data, locations, center, map, infowindow, marker, panning;
    $scope.currentUser = localStorageService.get('currentUser');
    var currentUser = localStorageService.get('currentUser');
    var users = localStorageService.get('users');
    var otherUsers = localStorageService.get('otherUsers');

    if ($rootScope.otherUsers === undefined || $rootScope.otherUsers === null) {
        $rootScope.otherUsers = localStorageService.get('otherUsers');
    }

    if ($scope.filteredUsers === undefined || $scope.filteredUsers === null) {
        $scope.filteredUsers = localStorageService.get('otherUsers');
    }

    if ($scope.currentPage === undefined) {
        $scope.currentPage = 1;
    }

    $scope.distanceDataReceived = false;

    var calculateDistances = function() {
        var deferred = $q.defer();
        if ($scope.distanceDataReceived === false) {
            GoogleDistanceMatrixService.calculateDistances($scope.currentUser.address, $rootScope.otherUsers, function(us) {
                $scope.distanceDataReceived = true;
                $rootScope.otherUsers = us;
                localStorageService.set('otherUsers', us);
                deferred.resolve(us);
            });
        }
        return deferred.promise;
    };

    var initMap = function() {
        var deferred = $q.defer();

        locations = Map.getLocations(users);
        center = new google.maps.LatLng(currentUser.latitude, currentUser.longitude);

        map = new google.maps.Map(document.getElementById('google-map'), {
            zoom: 16,
            scrollwheel: false,
            mapTypeControl: false,
            disableDoubleClickZoom: true,
            draggable: true,
            zoomControl: true,
            panControl: true,
            scaleControl: true,
            streetViewControl: true,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var placeMark = function(mark_i, l) {
            return function() {

                var iconUrl = users[mark_i].id == currentUser.id ? 'images/home.png' : 'images/dog.png';

                var new_marker = new google.maps.Marker({
                    position: l,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    icon: {
                        size: new google.maps.Size(32, 32),
                        scaledSize: new google.maps.Size(32, 32),
                        url: iconUrl
                    }
                });

                var info_bubble = new InfoBubble({
                    borderwidth: 0,
                    shadowStyle: 0,
                    padding: 0,
                    borderRadius: 5,
                    backgroundColor: '#364347',
                    arrowStyle: 2,
                });

                new_marker.info = "<div class='infowindow_wrapper'" +
                    "<div class='panel panel-default infowindow' id='modal'>" +
                    "<div class='panel-header'>" +
                    "<h3 class='panel-title'> " + users[mark_i].first_name + " & " + users[mark_i].dogs[0].name + "</h3>" +
                    "</div>" +
                    "<div class='panel-body'>" +
                    "<div class='row'>" +
                    "<div class='col-xs-6 image_wrapper'>" +
                    "<img preload-image src='" + users[mark_i].avatar_url + "' class='img-responsive'>" +
                    "<p>" + users[mark_i].email + "</p>" +
                    "<p>" + users[mark_i].address + "</p>" +
                    "</div>" +
                    "<div class='col-xs-6 image_wrapper'>" +
                    "<img preload-image src='" + users[mark_i].dogs[0].avatar_url + "' class='img-responsive'>" +
                    "<p> Breed: " + users[mark_i].dogs[0].breed + "</p>" +
                    "<p> Age: " + users[mark_i].dogs[0].age + "</p>" +
                    "<p> Gender: " + users[mark_i].dogs[0].gender + "</p>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>";

                google.maps.event.addListener(new_marker, 'click', function() {
                    console.log("NEW MARKER", new_marker);
                    info_bubble.setContent(this.info);
                    info_bubble.open(this.getMap(), this);
                });

                google.maps.event.addListener(map, "click", function() {
                    this.info.close(map, new_marker);
                });
                return new_marker;
            }();
        };

        var placeMarkers = function(locs) {
            for (var i = 0; i < locs.length; i++) {
                var a_marker = function(j, l) {
                    placeMark(j, l);
                }(i, locs[i]);
            }
            deferred.resolve();
        };

        placeMarkers(locations);

        var directionsDisplay = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            suppressPolylines: false
        });

        $scope.getRoute = function(x) {
            $scope.showRoute.userId = x;

            if ($scope.showRoute.status == true && $scope.showRoute.userId == x) {
                $scope.showRoute.status = false;
                directionsDisplay.setMap(null);
                map.panTo(center);
            } else {
                $scope.showRoute.status = true;
                directionsDisplay.setMap(map);
            }
            var user;
            for (var i = 0; i < $scope.pagedUsers.length; i++) {
                if ($scope.pagedUsers[i].id == x) {
                    user = $scope.pagedUsers[i];
                    break;
                }
            }
            Map.getRoute($scope.currentUser, user, function(res) {
                directionsDisplay.setDirections(res);
                directionsDisplay.setPanel(document.getElementById('directions_panel'));
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(res.routes[0].overview_path[0]);
                var k = res.routes[0].overview_path.length;
                bounds.extend(res.routes[0].overview_path[k - 1]);
                map.panTo(bounds.getCenter());
                res.routes[0].warnings = "";
            });
        };

        return deferred.promise;
    }; // function intialize()

    $scope.showRoute = {
        userId: null,
        status: false
    };

    $scope.initialize = function() {
        var promises = [initMap(), calculateDistances()];
        $q.all(promises).then(function() {
            Filter.filterUsers($rootScope.otherUsers);
        });
    };

    $scope.initialize();

    $scope.includeAge = function(age) {
        Filter.includeAge(age);
    };

    $scope.includeSize = function(size) {
        Filter.includeSize(size);
    };

    $scope.underDistance = function(distance) {
        Filter.underDistance(distance);
    };

    $scope.distanceFilter = function() {
        Filter.distanceFilter();
    };

    $scope.filterUsers = function (users) {
        console.log("filterUsers currentPage", $rootScope.currentPage);
        Filter.filterUsers(users, $scope.breed);
    };

    $scope.$on('filteredUsers', function(event, users) {
        console.log("scope.currentPage", $rootScope.currentPage);
        $scope.filteredUsers = users;
        localStorageService.set('filteredUsers', users);
        $rootScope.setPage($rootScope.currentPage);
    });

    $scope.open = function(size, user) {
        $scope.modalUser = user;
        $scope.modalInstance = $modal.open({
            templateUrl: 'views/mini_profile.html',
            controller: 'Conversations',
            scope: $scope,
            size: size,
        });
    };

    $scope.close = function() {
        $scope.modalInstance.close();
        $location.path('/profile');
    };

    $scope.dismiss = function() {
        $scope.modalInstance.dismiss();
    };
});