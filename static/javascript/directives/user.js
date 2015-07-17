app.factory('UsersFactory', function ($http) {

  var factory = {};

  factory.get_users = function (callback) {
    $http({
      method: 'GET',
      url: '//puppals-api.herokuapp.com/users',
      headers: { 'Access-Control-Allow-Origin': '*' }
    }).success(function (res) {
      callback(res);
    });
  };

  factory.login = function (current_user, callback) {
    $http({
      method: 'POST',
      url: '//puppals-api.herokuapp.com/sessions',
      params: current_user,
      headers: { 'Access-Control-Allow-Origin': '*' }
    }).success(function (res) {
      callback(res);
    });
  };

  return factory;
});