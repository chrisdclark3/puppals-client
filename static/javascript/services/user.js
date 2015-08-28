app.factory('User', function($http, $q, $rootScope, localStorageService) {

    var factory = {};

    factory.getUsers = function() {
        var def = $q.defer();
        $http({
            method: 'GET',
            url: '//puppals-api.herokuapp.com/users',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }).success(function(data) {
            localStorageService.set('users', data);
            factory.setOtherUsers(data);
            def.resolve(data);
        }).error(function(err) {
            def.reject(err);
        });
        return def.promise;
    };

    factory.setOtherUsers = function(others) {
        console.log("setting other others...");
        console.log("rootscope current suers", $rootScope.currentUser);
        for (var i = 0; i < others.length; i++) {
            if (others[i].id == localStorageService.get('currentUser').id) {
                others.splice(i, 1);
            } else if (localStorageService.get('currentUser') == null) {
              others.splice(0, 1);
            }
        }
        console.log("returning others...", others);
        localStorageService.set('otherUsers', others);
        $rootScope.otherUsers = others;
    };

    factory.login = function(currentUser) {
        var def = $q.defer();
        $http({
            method: 'POST',
            url: '//puppals-api.herokuapp.com/sessions',
            params: currentUser,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }).success(function(data) {
            $rootScope.currentUser = data;
            localStorageService.set('currentUser', data);
            def.resolve(data);
        }).error(function(err) {
            def.reject(err);
        });
        return def.promise;
    };

    return factory;
});