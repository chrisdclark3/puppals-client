app.controller('Conversations', function($window, $modal, Conversation, $scope, $rootScope, $location, User, localStorageService, socket) {

    $scope.oneAtATime = true;
    $scope.pageName = "profile";
    $scope.getConversations = function() {
        Conversation.getConversations();
    };

    if ($scope.conversations == undefined) {
        $scope.conversations = localStorageService.get('conversations');
    }

    if ($scope.currentPage === undefined) {
        $scope.currentPage = localStorageService.get('currentPage');
    }


    $scope.$on('updateConversations', function(event, data) {
        $scope.conversations = data;
        $rootScope.setPage($scope.currentPage);
    });

    $rootScope.sendMessage = function(sender_id, recipient_id, new_message) {
        var data = {};
        data.sender_id = sender_id;
        data.recipient_id = recipient_id;
        data.new_message = new_message;
        console.log("message data", data);
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

    $scope.close = function() {
        $scope.modalInstance.close();
    };

    $scope.dismiss = function() {
        $scope.modalInstance.dismiss();
    };

    console.log("Conversations > scope.conversations", $scope.conversations);

});