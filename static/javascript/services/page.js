app.factory('Page', function($location, socket, $window, $rootScope, localStorageService) {

    $rootScope.totalItems = $rootScope.otherUsers;

    if ($rootScope.currentPage == undefined) {
        $rootScope.currentPage = 1;
    }

    $rootScope.$on('updatePagedUsers', function(event, users) {
        $rootScope.pagedUsers = users;
    });

    var factory = {};

    factory.setPage = function(totalItems, currentPage, itemsPerPage) {
        var begin = ((currentPage - 1) * itemsPerPage);
        var end = begin + itemsPerPage;
        var total = totalItems.slice(begin, end);
        localStorageService.set('pagedUsers', totalItems);
        $rootScope.$broadcast('updatePagedUsers', total);
    };

    return factory;
});