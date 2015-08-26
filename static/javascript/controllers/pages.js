app.controller('Pages', function($scope, $window, $location, $rootScope, localStorageService, Page ) {

  if ($rootScope.totalItems == undefined) {
    $rootScope.totalItems = localStorageService.get('otherUsers').length;
  }

  if ($rootScope.currentPage == undefined) {
      $rootScope.currentPage = 1;
  }

  $rootScope.setItemsPerPage = function () {
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
    Page.setPage(users, $rootScope.currentPage, $rootScope.itemsPerPage);
  };

  $rootScope.$on('updatePagedUsers', function (event, users){
    $rootScope.pagedUsers = users;
  });

});