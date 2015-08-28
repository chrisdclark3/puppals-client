app.controller('Conversations', function(Page, $window, $modal, Conversation, $scope, $rootScope, $location, User, localStorageService, socket) {
    $rootScope.currentUser = $rootScope.currentUser === undefined ? localStorageService.get('currentUser') : $rootScope.currentUser;
    $rootScope.otherUsers = $rootScope.otherUsers === undefined ? localStorageService.get('otherUsers') : $rootScope.otherUsers;
    $rootScope.users = $rootScope.users === undefined ? localStorageService.get('users') : $rootScope.users;
    $scope.currentPage = $scope.currentPage === undefined ? 1 : $scope.currentPage;
    $scope.conversations = $scope.conversations === undefined ? localStorageService.get('conversations') : $scope.conversations;

    $scope.oneAtATime = true;
    $scope.getConversations = function(currentUser) {
        Conversation.getConversations(currentUser);
    };
    $scope.getConversations($rootScope.currentUser);

    $scope.$on('updateConversations', function(event, data) {
        $scope.conversations = data;
        $rootScope.setPage($scope.currentPage);
    });

    $rootScope.sendMessage = function(sender_id, recipient_id, new_message) {
        var data = {};
        data.sender_id = sender_id;
        data.recipient_id = recipient_id;
        data.new_message = new_message;
        socket.emit('sendMessage', data);
    };

    $scope.open = function(size, user) {
        $scope.modalUser = user;
        $scope.modalInstance = $modal.open({
            templateUrl: 'views/mini_profile.html',
            controller: 'Conversations',
            scope: $scope,
            size: size,
        });
    };

    $scope.setItemsPerPage = function() {
        var size;
        if ($location.$$path == '/home') {
            size = $window.windowWidth < 992 ? 3 : 6;
        } else {
            size = $window.windowWidth < 992 ? 4 : 9;
        }
        return size;
    };

    $scope.close = function() {
        $scope.modalInstance.close();
    };

    $scope.dismiss = function() {
        $scope.modalInstance.dismiss();
    };

    $scope.setPage = function(p, users) {
        $scope.currentPage = p;
        localStorageService.set('currentPage', p);
        if (users == undefined) {
            users = localStorageService.get('otherUsers');
        }
        $scope.totalItems = users.length;
        $scope.itemsPerPage = $scope.setItemsPerPage();
        $scope.totalPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);
        Page.setPage(users, $scope.currentPage, $scope.itemsPerPage);
    };

    $scope.$watch(function($rootScope) {
        return $rootScope.otherUsers;
    }, function(newValues, oldValues) {
        console.log("watching other users", newValues);
        $rootScope.otherUsers = newValues;
        localStorageService.set('otherUsers', newValues);
        $scope.setPage($scope.currentPage, newValues);
    });

    $scope.$watch(function($scope) {
        return $scope.conversations;
    }, function(newValues, oldValues) {
        console.log("watching conversations", newValues);
        $scope.conversations = newValues;
        localStorageService.set('conversations', newValues);
    });

});