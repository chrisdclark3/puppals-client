function MapsController ($modal, $window, PaginationFactory, $modal, $scope, $rootScope, $location, UsersFactory, MapsFactory, GoogleDistanceMatrixService, localStorageService, socket, $filter, $q) {
  var address_data, locations, center, map, infowindow, marker, panning;
  $scope.current_user = localStorageService.get('current_user');
  var current_user = localStorageService.get('current_user');
  $scope.users = localStorageService.get('users');
  var users = localStorageService.get('users');
  var other_users;

  if ($scope.current_page == undefined || $scope.current_page == null) {
    $scope.current_page = 1;
  }

  if ($scope.other_users == undefined || $scope.other_users == null) {
    $scope.other_users = localStorageService.get('other_users');
  }

  if ($scope.filtered_users == undefined || $scope.filtered_users == null) {
    $scope.filtered_users = localStorageService.get('other_users');
  }


  $scope.filter_by_distance = false;
  $scope.distance_filter = function() {
    if ($scope.filter_by_distance == false) {
      $scope.filter_by_distance = true;
    } else {
      $scope.filter_by_distance = false;
    }
  };


  $scope.one_mile = false;
  $scope.one_half_mile = false;
  $scope.one_quarter_mile = false;
  $scope.under_distance = function (d) {
    if (d == "one") {
      if ($scope.one_mile == false) {
        $scope.one_mile = true;
      }
      else if ($scope.one_mile == true) {
        $scope.one_mile = false;
      }
    }
    if (d == "one_half") {
      if ($scope.one_half_mile == false) {
        $scope.one_half_mile = true;
      }
      else if ($scope.one_half_mile == true) {
        $scope.one_half_mile = false;
      }
    }
    if (d == "one_quarter") {
      if ($scope.one_quarter_mile == false) {
        $scope.one_quarter_mile = true;
        console.log($scope.one_quarter_mile);
      }
      else if ($scope.one_quarter_mile == true) {
        $scope.one_quarter_mile = false;
        console.log($scope.one_quarter_mile);
      }
    }
  };

  $scope.initialize = function() {
    console.log("SCOPE IN INITIALIZE", $scope);

    other_users = [];
    $scope.show_route = {};
    for (var i = 0; i < users.length; i++) {
      if ($scope.current_user.id != users[i].id) { other_users.push(users[i]); }
    }
    localStorageService.set('other_users', other_users);
    $scope.other_users = other_users;
    if ($scope.distance_data_received != true) {
      GoogleDistanceMatrixService.calculate_distances($scope.current_user.address, $scope.other_users, function (users){
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
    pin_shadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow");
    var marker;
    panning = false;



    var set_info_window = function (i) {
      var a_user;
      if (i === undefined) {
        a_user = $scope.current_user;
      } else {
        a_user = $scope.other_users[i];
      }
      var html_string =
        "<div class='infowindow_wrapper'"+
        "<div class='panel panel-default infowindow' id='modal'>"+
          "<div class='panel-header'>"+
            "<h3 class='panel-title'> "+a_user.first_name+" & "+a_user.dogs[0].name+"</h3>"+
          "</div>"+
          "<div class='panel-body'>"+
            "<div class='row'>"+
              "<div class='col-xs-6 image_wrapper'>"+
                "<img preload-image src='"+a_user.avatar_url+"' class='img-responsive'>"+
                "<p>"+a_user.email+"</p>"+
                "<p>"+a_user.address+"</p>"+
              "</div>"+
              "<div class='col-xs-6 image_wrapper'>"+
                "<img preload-image src='"+a_user.dogs[0].avatar_url+"' class='img-responsive'>"+
                "<p> Breed: "+a_user.dogs[0].breed+"</p>"+
                "<p> Age: "+a_user.dogs[0].age+"</p>"+
                "<p> Gender: "+a_user.dogs[0].gender+"</p>"+
              "</div>"+
            "</div>"+
          "</div>"+
          "</div>"+
        "</div>";
        return html_string;
    }



    function place_markers (locs) {
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
      google.maps.event.addListener(center_marker, 'click', function () {
          center_info_window.open(map, center_marker);
      });

      for (var i = 0; i < locs.length; i++) {

        var html_str = set_info_window(i);

        var a_marker = new google.maps.Marker({
          position: locs[i],
          info: html_str,
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
          arrowStyle: 2
        });

        google.maps.event.addListener(a_marker, 'click', function () {
          console.log("THIS IS A MARKER IN EVENT LISTENER", a_marker);
          info_bubble.setContent(this.info);
          info_bubble.open(map, a_marker);
        });

        google.maps.event.addListener(map, "click", function () {
          info_bubble.close(map, a_marker);
        });
      }
    }
    place_markers(locations);



    google.maps.event.addListener(map, 'idle', function(){
      if (panning) {
        map.fitBounds(bounds);
      }
    });

    var dir_display = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      suppressPolylines: false
    });



    $scope.get_route = function (x) {
      if ($scope.show_route.status == true && $scope.show_route.user_id == x) {
        $scope.show_route = { user_id: x };
        $scope.show_route.status = false;
        dir_display.setMap(null);
      } else {
        $scope.show_route = { user_id: x };
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
      MapsFactory.get_route($scope.current_user, u, function (res) {
        dir_display.setDirections(res);
        dir_display.setPanel(document.getElementById('directions_panel'));
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(res.routes[0].overview_path[0]);
        var k = res.routes[0].overview_path.length;
        bounds.extend(res.routes[0].overview_path[k-1]);
        map.panTo(bounds.getCenter());
        res.routes[0].warnings = "";
      });
    };
  } // function intialize()

  age_includes = ['puppy','young','adult','senior'];
  size_includes = ['XS', 'S', 'M', 'L', 'XL'];

  $scope.include_age = function (age) {
    if (age_includes.indexOf(age) != -1) {
      age_includes.splice(age_includes.indexOf(age), 1);
    } else {
      age_includes.push(age);
    }
  };

  $scope.include_size = function (size) {
    if (size_includes.indexOf(size) != -1) {
      size_includes.splice(size_includes.indexOf(size), 1);
    } else {
      size_includes.push(size);
    }
  };

  if ($scope.filtered_users === undefined || $scope.filtered_users === null) {
    $scope.filtered_users = localStorageService.get('other_users');
  }

  $scope.search = function (some_users) {
    var promise = $q.defer();
    console.log("RUNNING SEARCH FILTER...");
    var fil_users = [];
    for (var i = 0; i < some_users.length; i++) {

      var age_category = "";
      var dog_age = some_users[i].dogs[0].age;
      var search_exp = new RegExp($scope.breed,'i');

      switch (true) {
        case dog_age <= 1:
          age_category = "puppy";
          break;
        case dog_age > 1 && dog_age <= 5:
          age_category = "young";
          break;
        case dog_age > 5 && dog_age <= 10:
          age_category = "adult";
          break;
        case dog_age > 10:
          age_category = "senior";
          break;
      }
      if (age_includes.length > 0) {
        if (age_includes.indexOf(age_category) == -1) {
          continue;
        }
      }
      if (size_includes.length > 0) {
        if (size_includes.indexOf(some_users[i].dogs[0].size) == -1) {
          continue;
        }
      }

      if ($scope.breed != undefined && $scope.breed.length != 0) {
        if (!search_exp.test(some_users[i].dogs[0].breed)) {
          continue;
        }
      }

      if ($scope.one_mile == true) {
        if (some_users[i].distance_data.distance.value > 1610) {
          continue;
        }
      }

      if ($scope.one_half_mile == true) {
        if (some_users[i].distance_data.distance.value > 805) {
          continue;
        }
      }

      if ($scope.one_quarter_mile == true) {
        if (some_users[i].distance_data.distance.value > 405) {
          continue;
        }
      }

      fil_users.push(some_users[i]);
    }

    if ($scope.filter_by_distance == true) {
      fil_users.sort(function (a,b) {
        if (a.distance_data.distance.value < b.distance_data.distance.value) {
          return -1;
        }
        if (a.distance_data.distance.value > b.distance_data.distance.value) {
          return 1;
        }
        if (a.distance_data.distance.value == b.distance_data.distance.value) {
          return 0;
        }
      });
    }
    $scope.filtered_users = fil_users;
    $scope.total_items = $scope.filtered_users.length;
    localStorageService.set('filtered_users', fil_users);
    promise.resolve($scope.set_page());
  };

  if ($scope.current_page === undefined || $scope.current_page === null) {
    $scope.current_page = 1;
  }

  $scope.set_items_per_page = function (size) {
    var window_height = window.innerHeight;
    var items_per_page = Math.floor(( window_height - 340) / size);
    if (items_per_page <= 4) {
      items_per_page = 4;
    }
    $scope.items_per_page = items_per_page;
  };

  $scope.set_total_pages = function () {
    $scope.total_pages = $scope.total_items / $scope.items_per_page;
  };

  $scope.set_page = function() {
    $scope.set_items_per_page(72);
    $scope.set_total_pages();
    $scope.paged_users = PaginationFactory.set_page($scope.filtered_users, $scope.current_page, $scope.items_per_page);
  };

  $scope.open = function (size, user) {
    $scope.modal_user = user;
    $scope.modalInstance = $modal.open({
      templateUrl: 'views/mini_profile.html',
      controller: 'ConversationsController',
      scope: $scope,
      size: size,
    });
  };

  $scope.close = function () {
    $scope.modalInstance.close();
    $location.path('/profile');
  };

  $scope.dismiss = function () {
    $scope.modalInstance.dismiss();
  }

}

MapsController.$inject = ["$modal", "$window", "PaginationFactory", "$modal", "$scope", "$rootScope", "$location", "UsersFactory", "MapsFactory", "GoogleDistanceMatrixService", "localStorageService", "socket", "$filter", "$q"];

app.controller('MapsController', MapsController);
