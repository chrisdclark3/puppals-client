app.controller('MapsController', function($modal, FilterFactory, $window, PaginationFactory, $modal, $scope, $rootScope, $location, UsersFactory, MapsFactory, GoogleDistanceMatrixService, localStorageService, socket, $filter, $q) {
    var address_data, locations, center, map, infowindow, marker, panning;
    $scope.current_user = localStorageService.get('current_user');
    var current_user = localStorageService.get('current_user');
    $scope.users = localStorageService.get('users');
    var users = localStorageService.get('users');

    if ($scope.current_page == undefined || $scope.current_page == null) {
        $scope.current_page = 1;
    }

    if ($scope.other_users == undefined || $scope.other_users == null) {
        $scope.other_users = localStorageService.get('other_users');
    }

    if ($scope.filtered_users == undefined || $scope.filtered_users == null) {
        $scope.filtered_users = localStorageService.get('other_users');
    }

    $scope.initialize = function() {
        var other_users = users;
        for (var i=0; i < other_users.length; i++) {
            if (other_users[i].id == $scope.current_user.id) {
                other_users.splice(i, 1);
            }
        }
        $scope.other_users = other_users;

        if ($scope.distance_data_received != true) {
            GoogleDistanceMatrixService.calculate_distances($scope.current_user.address, $scope.other_users, function(users) {
                $scope.$apply(function() {
                    $scope.distance_data_received = true;
                    $scope.other_users = users;
                    localStorageService.set('other_users', users);
                });
            });
        }

        locations = MapsFactory.get_locations(localStorageService.get('other_users'));
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
        infowindow = new InfoBubble();
        pin_shadow = new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_shadow");
        var marker;
        panning = false;

        function set_info_window(i) {
            return function() {
                var a_user;
                if (i === undefined) {
                    a_user = $scope.current_user;
                } else {
                    a_user = $scope.other_users[i];
                }
                var html_string =
                    "<div class='infowindow_wrapper'" +
                    "<div class='panel panel-default infowindow' id='modal'>" +
                    "<div class='panel-header'>" +
                    "<h3 class='panel-title'> " + a_user.first_name + " & " + a_user.dogs[0].name + "</h3>" +
                    "</div>" +
                    "<div class='panel-body'>" +
                    "<div class='row'>" +
                    "<div class='col-xs-6 image_wrapper'>" +
                    "<img preload-image src='" + a_user.avatar_url + "' class='img-responsive'>" +
                    "<p>" + a_user.email + "</p>" +
                    "<p>" + a_user.address + "</p>" +
                    "</div>" +
                    "<div class='col-xs-6 image_wrapper'>" +
                    "<img preload-image src='" + a_user.dogs[0].avatar_url + "' class='img-responsive'>" +
                    "<p> Breed: " + a_user.dogs[0].breed + "</p>" +
                    "<p> Age: " + a_user.dogs[0].age + "</p>" +
                    "<p> Gender: " + a_user.dogs[0].gender + "</p>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
                return html_string;
            }();
        }

        function place_mark(mark_i, l) {
            return function() {

                var new_marker = new google.maps.Marker({
                    position: l,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    icon: {
                        size: new google.maps.Size(32, 32),
                        scaledSize: new google.maps.Size(32, 32),
                        url: 'images/dog.png'
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
                    "<h3 class='panel-title'> " + $scope.other_users[mark_i].first_name + " & " + $scope.other_users[mark_i].dogs[0].name + "</h3>" +
                    "</div>" +
                    "<div class='panel-body'>" +
                    "<div class='row'>" +
                    "<div class='col-xs-6 image_wrapper'>" +
                    "<img preload-image src='" + $scope.other_users[mark_i].avatar_url + "' class='img-responsive'>" +
                    "<p>" + $scope.other_users[mark_i].email + "</p>" +
                    "<p>" + $scope.other_users[mark_i].address + "</p>" +
                    "</div>" +
                    "<div class='col-xs-6 image_wrapper'>" +
                    "<img preload-image src='" + $scope.other_users[mark_i].dogs[0].avatar_url + "' class='img-responsive'>" +
                    "<p> Breed: " + $scope.other_users[mark_i].dogs[0].breed + "</p>" +
                    "<p> Age: " + $scope.other_users[mark_i].dogs[0].age + "</p>" +
                    "<p> Gender: " + $scope.other_users[mark_i].dogs[0].gender + "</p>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>";


                google.maps.event.addListener(new_marker, 'click', function() {
                    info_bubble.setContent(this.info);
                    info_bubble.open(this.getMap(), this);
                });

                google.maps.event.addListener(map, "click", function() {
                    this.info.close(map, new_marker);
                });
                return new_marker;
            }();
            FilterFactory.filtered_users($scope.other_users, $scope.breed);
        }

        function place_markers(locs) {
            center_marker = new google.maps.Marker({
                position: center,
                map: map,
                animation: google.maps.Animation.DROP,
                icon: {
                    size: new google.maps.Size(32, 32),
                    scaledSize: new google.maps.Size(32, 32),
                    url: 'images/home.png'
                }
            });

            var center_info_window = new InfoBubble({
                content: set_info_window(),
                borderwidth: 0,
                shadowStyle: 0,
                padding: 0,
                borderRadius: 5,
                backgroundColor: '#364347',
                arrowStyle: 2
            });

            google.maps.event.addListener(center_marker, 'click', function() {
                center_info_window.open(map, center_marker);
                this.info = set_info_window();
            });

            for (var i = 0; i < locs.length; i++) {
                var a_marker = function(j, l) {
                    place_mark(j, l);
                }(i, locs[i]);
            }
        }

        place_markers(locations);

        google.maps.event.addListener(map, 'idle', function() {
            if (panning) {
                map.fitBounds(bounds);
            }
        });

        var dir_display = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            suppressPolylines: false
        });

        $scope.get_route = function(x) {
            if ($scope.show_route.status == true && $scope.show_route.user_id == x) {
                $scope.show_route = {
                    user_id: x
                };
                $scope.show_route.status = false;
                dir_display.setMap(null);
            } else {
                $scope.show_route = {
                    user_id: x
                };
                $scope.show_route.status = true;
                dir_display.setMap(map);
            }
            var u;
            for (var i = 0; i < $scope.paged_users.length; i++) {
                if ($scope.paged_users[i].id == x) {
                    u = $scope.paged_users[i];
                    break;
                }
            }
            MapsFactory.get_route($scope.current_user, u, function(res) {
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
    }; // function intialize()

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

    if ($scope.filtered_users === undefined || $scope.filtered_users === null) {
        $scope.filtered_users = localStorageService.get('other_users');
    }

    $scope.filter_users = function (users) {
        FilterFactory.filter_users(users, $scope.breed);
    };

    $scope.filter_users($scope.filtered_users);

    $scope.$on('filtered_users', function (event, users) {
        console.log("filtering...", users);
        $scope.filtered_users = users;
        $scope.total_items = users.length;
        $scope.set_page();
    });

    if ($scope.current_page === undefined || $scope.current_page === null) {
        $scope.current_page = 1;
    }


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
