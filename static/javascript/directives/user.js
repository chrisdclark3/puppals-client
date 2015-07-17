app.factory('UsersFactory', function ($http) {

  var factory = {};

  factory.get_users = function (callback) {
    $http.get('http://puppals-api.heroku-app.com/users').success(function (res) {
      callback(res);
    });
  };

  factory.login = function (current_user, callback) {
    $http({
      method: 'POST',
      url: 'http://puppals-api.heroku-app.com/sessions',
      params: current_user,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function (res) {
      current_user = res;
      callback(res);
    });
  };

  return factory;
});