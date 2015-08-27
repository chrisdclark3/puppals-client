app.factory('User', function($http, $q, $rootScope, localStorageService) {

    var factory = {};

    factory.getUsers = function(callback) {
        return $http({
            method: 'GET',
            url: '//puppals-api.herokuapp.com/users',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }).then(function(res) {
            if (typeof res.data == 'object') {
                console.log("successful request for users data...");
                return res.data;
            } else {
                console.log("something is wrong");
                return $q.reject(res.data);
            }
        }, function(err) {
            console.log("error: ", err);
        });
    };

    factory.resetUsers = function() {
        return $q(function(resolve, reject) {
            if ($rootScope.currentUser == undefined) {
                $rootScope.currentUser = localStorageService.get('currentUser');
            }
            if ($rootScope.users == undefined) {
                if (localStorageService.get('users') == null) {
                    factory.getUsers().then(function(data) {
                        $rootScope.users = data;
                        localStorageService.set('users', data);
                        resolve(factory.setOtherUsers(data));
                    });
                } else {
                    $rootScope.users = localStorageService.get('users');
                    if (localStorageService.get('otherUsers') == null) {
                      resolve(factory.setOtherUsers($rootScope.users));
                    } else {
                      $rootScope.otherUsers = localStorageService.get('otherUsers');
                      resolve($rootScope.otherUsers);
                    }
                }
            }
        });
    };

    factory.setOtherUsers = function(users) {
        console.log("setting other users...");
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == $rootScope.currentUser.id) {
                users.splice(i, 1);
            }
        }
        $rootScope.otherUsers = users;
        localStorageService.set('otherUsers', users);
        return users;
    };

    factory.login = function(currentUser) {
        return $http({
            method: 'POST',
            url: '//puppals-api.herokuapp.com/sessions',
            params: currentUser,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }).then(function(res) {
            if (typeof res.data == 'object') {
                $rootScope.currentUser = res.data;
                localStorageService.set('currentUser', res.data);
                return res.data;
            } else {
                console.log("something's wrong");
                return $q.reject(res);
            }
        }, function(err) {
            console.log("error: ", err);
        });
    };

    return factory;
});