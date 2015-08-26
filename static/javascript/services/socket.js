app.factory('socket', function ($rootScope) {
  var s = io.connect(app.HOST);
  var factory = {};

    factory.on = function (event_name, callback) {
      s.on(event_name, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(s, args);
        });
      });
    };

    factory.emit = function (event_name, data, callback) {
      s.emit(event_name, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(s, args);
          }
        });
      });
    };

    return factory;
});