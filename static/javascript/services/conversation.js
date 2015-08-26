app.factory('Conversation', function ($http, localStorageService, socket, $rootScope, $location, $q) {

  var factory = {};
  if ($rootScope.otherUsers == undefined) {
    $rootScope.otherUsers = localStorageService.get('otherUsers');
  }
  if ($rootScope.currentUser == undefined) {
    $rootScope.currentUser = localStorageService.get('currentUser');
  }

  factory.getConversations = function() {
    console.log("FACTORY > getConversations")
    socket.emit('getConversations', { currentUser: $rootScope.currentUser });
  };

  socket.on('conversations', function (data) {
    console.log("CONVERSATIONS", data);
    for (var i = 0; i < data.length; i++) {
      if (data[i].recipient_id == $rootScope.currentUser.id) {
        var temp = data[i].recipient;
        data[i].recipient = data[i].sender;
        data[i].recipient_id = data[i].sender_id;
        data[i].sender = temp;
        data[i].sender_id = temp.id;
      }
    }
    localStorageService.set('conversations', data);
    $rootScope.$broadcast('updateConversations', data);
    if ($location.path() != '/profile') {
      $location.path('/profile');
    }
  });


  return factory;
});
