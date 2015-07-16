
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

