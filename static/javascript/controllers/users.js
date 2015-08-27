app.controller('Users', function($window, $rootScope, $scope, $location, User, localStorageService, socket) {

    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.setCollapsed = function() {
        if ($window.width <= 768) {
            $rootScope.isCollapsed = true;
        } else {
            $rootScope.isCollapsed = false;
        }
    };

    $scope.testLogin = function() {
        $rootScope.currentUser = {};
        $rootScope.currentUser.email = "chrisdclark3@gmail.com";
        $rootScope.currentUser.password = "password";
        localStorageService.set('currentUser', $rootScope.currentUser);
        $scope.login();
    };

    $scope.login = function() {
        var res = User.login($rootScope.currentUser);
        console.log("LOGIN RES", res);
        var promise = User.resetUsers();
        console.log("promise", promise);
        promise.then(function() {
          console.log("done resetting users");
            $location.path("/home");
        });
    };

    $scope.logout = function() {
        localStorageService.clearAll();
        $scope.messages = "Thank you for being a loyal customer of PupPals!";
    };

    var new_user = {};
    $scope.showDefaultDog = true;
    $scope.showDefaultUser = true;

    $scope.$watch('dog_image', function() {
        if ($scope.showDefaultDog == true) {
            $scope.showDefaultDog = false;
        } else {
            $scope.showDefaultDog = true;
        }
    });

    $scope.$watch('user_image', function() {
        if ($scope.showDefaultUser == true) {
            $scope.showDefaultUser = false;
        } else {
            $scope.showDefaultUser = true;
        }
    });

    $scope.upload_user = function() {
        user_image = $scope.user_image;
        new_user = {};
        new_user.first_name = $scope.new_user.first_name;
        new_user.last_name = $scope.new_user.last_name;
        new_user.password_digest = $scope.new_user.password_digest;
        new_user.email = $scope.new_user.email;
        if ($scope.new_user.address2 == null || $scope.new_user.address2 == undefined) {
            $scope.new_user.address2 = "";
        }
        new_user.address = $scope.new_user.address1 + " " + $scope.new_user.address2 + " " + $scope.new_user.city + " " + $scope.new_user.state + " " + $scope.new_user.zipcode;

        $scope.upload = Upload.upload({
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            url: '//puppals-api.herokuapp.com/users',
            method: 'POST',
            fields: {
                'new_user[first_name]': new_user.first_name,
                'new_user[last_name]': new_user.last_name,
                'new_user[password_digest]': new_user.password_digest,
                'new_user[email]': new_user.email,
                'new_user[address]': new_user.address,
            },
            file: $scope.user_image,
            fileFormDataName: 'new_user[avatar]'
        }).success(function(data, status, headers, config) {
            currentUser = data;
            $scope.currentUser = currentUser;
            upload_dog();
        }).error(function(data, status, headers, config) {
            console.log('error status: ' + status);
        });
    };

    function upload_dog() {
        dog_image = $scope.dog_image;
        $scope.upload = Upload.upload({
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            url: '//puppals-api.herokuapp.com/dogs',
            method: 'POST',
            fields: {
                'new_user[id]': $scope.currentUser.id,
                'dog[name]': $scope.new_user.dogs[0].name,
                'dog[age]': $scope.new_user.dogs[0].age,
                'dog[breed]': $scope.new_user.dogs[0].breed,
                'dog[description]': $scope.new_user.dogs[0].description,
                'dog[size]': $scope.new_user.dogs[0].size,
            },
            file: $scope.dog_image,
            fileFormDataName: 'dog[avatar]'
        }).success(function(data, status, headers, config) {
            users = data;
            $rootScope.users = users;
            $scope.users = users;
            localStorageService.set('users', users);
            $scope.login();
        }).error(function(data, status, headers, config) {
            console.log('error status: ' + status);
        });
    }
});