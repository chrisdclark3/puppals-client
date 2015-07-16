app.factory('PaginationFactory', function ($http) {

  var factory = {};

  factory.set_page = function (total_items, current_page, items_per_page) {
    console.log("IN FACTORY... SETTING PAGE... TOTAL ITEMS", total_items, "CURRENT_PAGE", current_page, "ITEMS PER PAGE", items_per_page);

    var begin = ((current_page - 1) * items_per_page);
    var end = begin + items_per_page;
    var total = total_items.slice(begin, end);
    return total;
  };

  return factory;
});