app.factory('PaginationFactory', function ($http) {

  var factory = {};

  factory.set_page = function (total_items, current_page, items_per_page) {
    var begin = ((current_page - 1) * items_per_page);
    var end = begin + items_per_page;
    var total = total_items.slice(begin, end);
    return total;
  };

  return factory;
});