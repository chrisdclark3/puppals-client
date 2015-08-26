
app = angular.module('app', ['ui.bootstrap', 'ngFileUpload', 'ngRoute', 'LocalStorageModule', 'angular-preload-image']);

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

app.constant('HOST', 'http://localhost:5000');

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


