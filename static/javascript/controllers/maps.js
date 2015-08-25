app.controller('MapsController', function($modal, FilterFactory, $window, PaginationFactory, $modal, $scope, $rootScope, $location, UsersFactory, MapsFactory, GoogleDistanceMatrixService, localStorageService, socket, $filter, $q) {
    var address_data, locations, center, map, infowindow, marker, panning;
    $scope.current_user = localStorageService.get('current_user');
    var current_user = localStorageService.get('current_user');
    var users = localStorageService.get('users');

    if ($scope.current_page === undefined || $scope.current_page === null) {
        $scope.current_page = 1;
    }

    if ($scope.other_users === undefined || $scope.other_users === null) {
        $scope.other_users = localStorageService.get('other_users');
    }

    if ($scope.filtered_users === undefined || $scope.filtered_users === null) {
        $scope.filtered_users = localStorageService.get('other_users');
    }

    var calculate_distances = function() {
        var deferred = $q.defer();
        GoogleDistanceMatrixService.calculate_distances($scope.current_user.address, $scope.other_users, function(us) {
            $scope.distance_data_received = true;
            $scope.other_users = us;
            localStorageService.set('other_users', us);
            deferred.resolve(us);
        });
        return deferred.promise;
    };

    var initialize_map = function() {
        var deferred = $q.defer();
        console.log("initializing map");
        var other_users = localStorageService.get('users');
        for (var i = 0; i < other_users.length; i++) {
            if (other_users[i].id == $scope.current_user.id) {
                other_users.splice(i, 1);
            }
        }
        $scope.other_users = other_users;

        locations = MapsFactory.get_locations(users);
        center = new google.maps.LatLng(current_user.latitude, current_user.longitude);

        map = new google.maps.Map(document.getElementById('google_map'), {
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

        var place_mark = function(mark_i, l) {
            return function() {

                var iconUrl = users[mark_i].id == current_user.id ? 'images/home.png' : 'images/dog.png';

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

        var place_markers = function(locs) {
            for (var i = 0; i < locs.length; i++) {
                var a_marker = function(j, l) {
                    place_mark(j, l);
                }(i, locs[i]);
            }
            deferred.resolve();
        };

        place_markers(locations);

        var dir_display = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            suppressPolylines: false
        });

        $scope.get_route = function(x) {
            $scope.show_route.user_id = x;

            if ($scope.show_route.status == true && $scope.show_route.user_id == x) {
                $scope.show_route.status = false;
                dir_display.setMap(null);
                map.panTo(center);
            } else {
                $scope.show_route.status = true;
                dir_display.setMap(map);
            }
            var user;
            for (var i = 0; i < $scope.paged_users.length; i++) {
                if ($scope.paged_users[i].id == x) {
                    user = $scope.paged_users[i];
                    break;
                }
            }
            MapsFactory.get_route($scope.current_user, user, function(res) {
                dir_display.setDirections(res);
                dir_display.setPanel(document.getElementById('directions_panel'));
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

    $scope.show_route = {
        user_id: null,
        status: false
    };

    $scope.initialize = function() {
        var promises = [initialize_map(), calculate_distances()];
        $q.all(promises).then(function() {
            FilterFactory.filter_users($scope.other_users);
        });
    };

    $scope.initialize();

    $scope.include_age = function(age) {
        FilterFactory.include_age(age);
    };

    $scope.include_size = function(size) {
        FilterFactory.include_size(size);
    };

    $scope.under_distance = function(distance) {
        FilterFactory.under_distance(distance);
    };

    $scope.distance_filter = function() {
        FilterFactory.distance_filter();
    };

    $scope.filter_users = function(users) {
        FilterFactory.filter_users(users, $scope.breed);
    };

    $scope.$on('filtered_users', function(event, users) {
        $scope.filtered_users = users;
        $scope.total_items = users.length;
        $scope.set_page();
    });

    $scope.items_per_page = 6;

    $scope.set_total_pages = function() {
        $scope.total_pages = $scope.total_items / $scope.items_per_page;
    };

    $scope.set_page = function() {
        $scope.items_per_page = 6;
        $scope.set_total_pages();
        $scope.paged_users = PaginationFactory.set_page($scope.filtered_users, $scope.current_page, $scope.items_per_page);
    };

    $scope.open = function(size, user) {
        $scope.modal_user = user;
        $scope.modalInstance = $modal.open({
            templateUrl: 'views/mini_profile.html',
            controller: 'ConversationsController',
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