app.controller('Maps', function($modal, User, Page, Filter, $window, $scope, $rootScope, $location, User, Map, GoogleDistanceMatrixService, localStorageService, socket, $q) {

    User.resetUsers();

    var directionsDisplay;

    if ($scope.filteredUsers == undefined) {
        $scope.filteredUsers = localStorageService.get('otherUsers');
    }

    if ($scope.currentPage == undefined) {
        $scope.currentPage = 1;
    }

    $scope.showRoute = {
        userId: null,
        status: false
    };

    $scope.initialize = function() {
        Map.initializeMap();
        $rootScope.otherUsers = localStorageService.get('otherUsers');
    };

    $scope.initialize();

    $scope.getRoute = function(x) {
        $scope.showRoute.userId = x;
        if ($scope.showRoute.status == true && $scope.showRoute.userId == x) {
            $scope.showRoute.status = false;
            Map.directionsDisplay.setMap(null);
            Map.map.setCenter(Map.center);
            Map.map.panTo(Map.center);
            Map.map.setZoom(16);
        } else {
            $scope.showRoute.status = true;
            Map.directionsDisplay.setMap(Map.map);
        }
        var user;
        for (var i = 0; i < $rootScope.otherUsers.length; i++) {
            if ($rootScope.otherUsers[i].id == x) {
                user = $rootScope.otherUsers[i];
                break;
            }
        }
        Map.getRoute($rootScope.currentUser, user, function(res) {
            Map.directionsDisplay.setDirections(res);
            Map.directionsDisplay.setPanel(document.getElementById('directions-panel'));
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(res.routes[0].overview_path[0]);
            var k = res.routes[0].overview_path.length;
            bounds.extend(res.routes[0].overview_path[k - 1]);
            Map.map.panTo(bounds.getCenter());
            res.routes[0].warnings = "";
        });
    };


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

    $scope.filterUsers = function(users) {
        Filter.filterUsers(users, $scope.breed);
    };

    $scope.$on('filteredUsers', function(event, users) {
        $scope.filteredUsers = users;
        localStorageService.set('filteredUsers', users);
        $rootScope.setPage($rootScope.currentPage);
    });

    $scope.filterUsers($scope.filteredUsers);

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