app.factory('User', function ($http) {

  var factory = {};

  factory.get_users = function (callback) {
    $http({
      method: 'GET',
      url: '//puppals-api.herokuapp.com/users',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    }).success(function (res) {
      callback(res);
    });
  };

  factory.login = function (currentUser, callback) {
    $http({
      method: 'POST',
      url: '//puppals-api.herokuapp.com/sessions',
      params: currentUser,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    }).success(function (res) {
      callback(res);
    });
  };

  return factory;
});