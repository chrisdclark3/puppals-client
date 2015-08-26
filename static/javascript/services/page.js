app.factory('Page', function (socket, $window, $rootScope, localStorageService) {

  var factory = {};

  factory.setPage = function (totalItems, currentPage, itemsPerPage) {
    var begin = ((currentPage - 1) * itemsPerPage);
    var end = begin + itemsPerPage;
    var total = totalItems.slice(begin, end);
    localStorageService.set('pagedUsers', totalItems);
    $rootScope.$broadcast('updatePagedUsers', total);
  };

  return factory;
});