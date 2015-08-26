app.controller('Users', function($window, $rootScope, $scope, $location, User, localStorageService, socket) {

    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };

    $rootScope.setCollapsed = function() {
        if ($window.width <= 768) {
            $rootScope.isCollapsed = true;
        } else {
            $rootScope.isCollapsed = false;
        }
    };

    if ($location.path() != '/register') {
        User.getUsers(function(data) {
            $rootScope.users = data;
            localStorageService.set('users', data);

            var otherUsers = data;
            for (var i = 0; i < otherUsers.length; i++) {
                if (otherUsers[i].id == $scope.currentUser.id) {
                    otherUsers.splice(i, 1);
                }
            }
            $rootScope.otherUsers = otherUsers;
            localStorageService.set('otherUsers', otherUsers);
        });
        if ($rootScope.currentUser == undefined) {
            currentUser = localStorageService.get('currentUser');
            $rootScope.currentUser = currentUser;
        }
    }

    $rootScope.testLogin = function() {
        $scope.currentUser = {};
        $scope.currentUser.email = "chrisdclark3@gmail.com";
        $scope.currentUser.password = "password";
        $rootScope.login();
    };

    $rootScope.login = function() {
        User.login($scope.currentUser, function(data) {
            if (data.errors) {
                $rootScope.errors = data;
                $location.path("/");
            } else {
                $rootScope.currentUser = data;
                localStorageService.set('currentUser', data);
                $location.path("/home");
            }
        });
    };

    $rootScope.logout = function() {
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