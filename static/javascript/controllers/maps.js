app.controller('Maps', function(Page, Filter, Map, $window, $modal, $scope, $rootScope, $location, $q, localStorageService) {
    $rootScope.currentUser = $rootScope.currentUser === undefined ? localStorageService.get('currentUser') : $rootScope.currentUser;
    $rootScope.otherUsers = $rootScope.otherUsers === undefined ? localStorageService.get('otherUsers') : $rootScope.otherUsers;
    $rootScope.users = $rootScope.users === undefined ? localStorageService.get('users') : $rootScope.users;
    $scope.currentPage = $scope.currentPage === undefined ? 1 : $scope.currentPage;

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


    $scope.setPage = function(p) {
        $scope.currentPage = p;
        users = localStorageService.get('filteredUsers');
        $scope.totalItems = users.length;
        $scope.itemsPerPage = $scope.setItemsPerPage();
        $scope.totalPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);
        Page.setPage(users, $scope.currentPage, $scope.itemsPerPage);
    };


    $scope.setItemsPerPage = function() {
        var size;
        if ($location.$$path == '/home') {
            size = $window.windowWidth < 992 ? 3 : 6;
        } else {
            size = $window.windowWidth < 992 ? 4 : 9;
        }
        return size;
    };
    var directionsDisplay;

    if ($scope.currentPage == undefined) {
        $scope.currentPage = 1;
    }

    $scope.showRoute = {
        userId: null,
        status: false
    };

    $scope.initializeMap = function() {
        Map.drawMap();
        var locs = Map.getLocations($rootScope.users);
        Map.placeMarkers(locs);
        var promise = Map.getDistances($rootScope.currentUser.address);
        promise.then(function (users){
            console.log("PROMISES USERS", users);
            localStorageService.set('otherUsers', users);
            $rootScope.otherUsers = users;
            $scope.filterUsers(users);
        });
    };

    $scope.getRoute = function(x) {
        $scope.showRoute.userId = x;
        if ($scope.showRoute.status == true && $scope.showRoute.userId == x) {
            $scope.showRoute.status = false;
            Map.directionsDisplay.setMap(null);
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
        console.log("scope on filteredUsers", users);
        $scope.filteredUsers = users;
        localStorageService.set('filteredUsers', users);
        $scope.setPage($scope.currentPage);
    });

    $scope.$watch(function($rootScope){
        return $rootScope.otherUsers;
    }, function(newValues, oldValues){
        console.log("watching other users", newValues);
        $rootScope.otherUsers = newValues;
        localStorageService.set('otherUsers', newValues);
        $scope.filterUsers(newValues);
    });

    $scope.initializeMap();

});