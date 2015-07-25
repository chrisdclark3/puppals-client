function ConversationsController($window, $modal, PaginationFactory, $scope, $rootScope, $location, UsersFactory, localStorageService, socket) {

  $scope.oneAtATime = true;
  var current_user;
  var other_users;
  var users;


  if (current_user == undefined) {
    current_user = localStorageService.get('current_user');
    $rootScope.current_user = current_user;
    $scope.current_user = current_user;
  }

  if (users == undefined) {
    users = localStorageService.get('users');
    $rootScope.users = users;
    $scope.users = users;
  }

  if (other_users == undefined) {
    other_users = localStorageService.get('other_users');
    $rootScope.other_users = other_users;
    $scope.other_users = other_users;
  }

  UsersFactory.get_users(function (data) {
    localStorageService.set('users', data);
    users = data;
    $scope.users = users;
    $rootScope.users = users;
  });


  $scope.get_conversations = function () {
    if (current_user == undefined) {
      current_user = localStorageService.get('current_user');
      $scope.current_user = current_user;
    }

    if (users == undefined) {
      users = localStorageService.get('users');
      $scope.users = users;
    }

    if (other_users == undefined) {
      other_users = localStorageService.get('other_users');
      $scope.other_users = other_users;
    }
    socket.emit('get_conversations', { current_user: current_user });
  };



  socket.on('conversations', function (data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].recipient_id == current_user.id) {
        var temp = data[i].recipient;
        data[i].recipient = data[i].sender;
        data[i].recipient_id = data[i].sender_id;
        data[i].sender = temp;
        data[i].sender_id = temp.id;
      }
    }
    $scope.conversations = data;
    localStorageService.set('conversations', data);
    conversations = data;
    if ($location.path() != '/profile') {
      $location.path('/profile');
    }
  });

  $rootScope.send_message = function (sender_id, recipient_id, new_message) {
    var data = {};
    data.sender_id = sender_id;
    data.recipient_id = recipient_id;
    data.new_message = new_message;
    socket.emit('send_message', data);
  };

  $scope.total_items = $scope.other_users.length;


  function set_items_per_page (size) {
    var window_width = get_width();
    console.log('WINDOW WIDTH', window_width);
    if (window_width < 992) {
      $scope.items_per_page = 3;
    } else {
      $scope.items_per_page = 9;
    }
  }

  function get_width () {
    return $window.innerWidth;
  };

  function set_total_pages () {
    $scope.total_pages = Math.ceil($scope.total_items / $scope.items_per_page);
  }

  if ($scope.current_page == undefined) {
    $scope.current_page = 1;
  }

  $scope.$watch("window.innerWidth", function () {
    console.log("WINDOW WIDTH", window.innerWidth);
    $scope.set_page();
  });

  $scope.set_page = function() {
    set_items_per_page();
    set_total_pages();
    $scope.paged_users = PaginationFactory.set_page($scope.other_users, $scope.current_page, $scope.items_per_page);
  };

  $scope.open = function (size, user) {
    $scope.modal_user = user;
    $scope.modalInstance = $modal.open({
      templateUrl: 'views/mini_profile.html',
      controller: 'ConversationsController',
      scope: $scope,
      size: size,
    });
  };

  $scope.close = function () {
    $scope.modalInstance.close();
  };

  $scope.dismiss = function () {
    $scope.modalInstance.dismiss();
  };

}

ConversationsController.$inject = ["$window","$modal", "PaginationFactory", "$scope", "$rootScope", "$location", "UsersFactory", "localStorageService", "socket"];

app.controller('ConversationsController', ConversationsController);