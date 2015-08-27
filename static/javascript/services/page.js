app.factory('Page', function($location, socket, $window, $rootScope, localStorageService) {

    if ($rootScope.totalItems == undefined) {
        $rootScope.totalItems = localStorageService.get('otherUsers').length;
    }

    if ($rootScope.currentPage == undefined) {
        $rootScope.currentPage = 1;
    }

    $rootScope.setItemsPerPage = function() {
        var size;
        if ($location.$$path == '/home') {
            size = $window.windowWidth < 992 ? 3 : 6;
        } else {
            size = $window.windowWidth < 992 ? 4 : 9;
        }
        return size;
    };

    $rootScope.setPage = function(p) {
        $rootScope.currentPage = p;
        localStorageService.set('currentPage', p);
        var users = $location.$$path == '/home' ? localStorageService.get('filteredUsers') : localStorageService.get('otherUsers');
        $rootScope.totalItems = users.length;
        $rootScope.itemsPerPage = $rootScope.setItemsPerPage();
        $rootScope.totalPages = Math.ceil($rootScope.totalItems / $rootScope.itemsPerPage);
        factory.setPage(users, $rootScope.currentPage, $rootScope.itemsPerPage);
    };

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