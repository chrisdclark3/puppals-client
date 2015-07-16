
app = angular.module('app', ['ui.bootstrap', 'ngFileUpload', 'ngRoute', 'LocalStorageModule', 'angular-preload-image']);

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);



// ------------------------ROUTES------------------------ //

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/splash.html',
  })
  .when('/home', {
    templateUrl: 'views/home.html'
  })
  .when('/profile', {
    templateUrl: 'views/profile.html'
  })
  .when('/register', {
    templateUrl: 'views/register.html'
  })
  .otherwise({
    redirectTo: '/'
  });
}]);

// ------------------------ SESSIONS ------------------------ //

app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('app')
    .setStorageType('sessionStorage')
    .setNotify(true, true);
});

// ------------------------ SOCKETS ------------------------ //

app.factory('socket', function ($rootScope) {
  var socket = io.connect('localhost:6789');
  return {
    on: function (event_name, callback) {
      socket.on(event_name, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (event_name, data, callback) {
      socket.emit(event_name, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});

app.directive('ngCompare', function() {
    return {
        require: 'ngModel',
        link: function(scope, el1, attrs, ctrl) {
            var compare_field = document.getElementsByName(attrs.ngCompare)[0]; //getting first element
            el2 = angular.element(compare_field);

            //current field key up
            el1.on('keyup', function() {
                if (el2.val() != "") {
                    var isMatch = el1.val() === el2.val();
                    ctrl.$setValidity('compare', isMatch);
                    scope.$digest();
                }
            });

            //Element to compare field key up
            el2.on('keyup', function() {
                if (el1.val() != "") {
                    var isMatch = el1.val() === el2.val();
                    ctrl.$setValidity('compare', isMatch);
                    scope.$digest();
                }
            });
        }
    }
});