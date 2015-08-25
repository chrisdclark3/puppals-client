app.factory('FilterFactory', function($rootScope, localStorageService, $q) {

    var factory = {};

    var filter_by_distance = false,
        one_mile = false,
        one_half_mile = false,
        one_quarter_mile = false,
        age_includes = ['puppy', 'young', 'adult', 'senior'],
        size_includes = ['XS', 'S', 'M', 'L', 'XL'];

    factory.distance_filter = function() {
        filter_by_distance = filter_by_distance == false ? true : false;
    };

    factory.under_distance = function(d) {
        if (d == "one") {
            one_mile = one_mile == false ? true : false;
        }
        if (d == "one_half") {
            one_half_mile = one_half_mile == false ? true : false;
        }
        if (d == "one_quarter") {
            one_quarter_mile = one_quarter_mile == false ? true : false;
        }
    };

    factory.include_age = function(age) {
        if (age_includes.indexOf(age) != -1) {
            age_includes.splice(age_includes.indexOf(age), 1);
        } else {
            age_includes.push(age);
        }
    };

    factory.include_size = function(size) {
        if (size_includes.indexOf(size) != -1) {
            size_includes.splice(size_includes.indexOf(size), 1);
        } else {
            size_includes.push(size);
        }
    };

    var filter = function(users, breed) {
        var filtered_users = [];
        return $q(function(resolve, reject) {
            console.log("users", users);

            for (var i = 0; i < users.length; i++) {
                var age_category = "",
                    dog_age = users[i].dogs[0].age,
                    search_exp = new RegExp(breed, 'ig');

                switch (true) {
                    case dog_age <= 1:
                        age_category = "puppy";
                        break;
                    case dog_age > 1 && dog_age <= 5:
                        age_category = "young";
                        break;
                    case dog_age > 5 && dog_age <= 10:
                        age_category = "adult";
                        break;
                    case dog_age > 10:
                        age_category = "senior";
                        break;
                }
                if (age_includes.length > 0) {
                    if (age_includes.indexOf(age_category) == -1) {
                        continue;
                    }
                }
                if (size_includes.length > 0) {
                    if (size_includes.indexOf(users[i].dogs[0].size) == -1) {
                        continue;
                    }
                }

                if (breed != undefined && breed.length != 0) {
                    if (!search_exp.test(users[i].dogs[0].breed)) {
                        continue;
                    }
                }

                if (one_mile == true) {
                    if (users[i].distance_data.distance.value > 1610) {
                        continue;
                    }
                }

                if (one_half_mile == true) {
                    if (users[i].distance_data.distance.value > 805) {
                        continue;
                    }
                }

                if (one_quarter_mile == true) {
                    if (users[i].distance_data.distance.value > 405) {
                        continue;
                    }
                }

                filtered_users.push(users[i]);
            }

            if (filter_by_distance == true) {
                filtered_users.sort(function(a, b) {
                    if (a.distance_data.distance.value < b.distance_data.distance.value) {
                        return -1;
                    }
                    if (a.distance_data.distance.value > b.distance_data.distance.value) {
                        return 1;
                    }
                    if (a.distance_data.distance.value == b.distance_data.distance.value) {
                        return 0;
                    }
                });
            }
            console.log("filtered_users", filtered_users);
            localStorageService.set('filtered_users', filtered_users);
            resolve(filtered_users);
        });
    };

    factory.filter_users = function(users, breed) {
        var promise = filter(users, breed);
        promise.then(function() {
            console.log("broadcasting...");
            $rootScope.$broadcast('filtered_users', localStorageService.get('filtered_users'));
        });
    };

    return factory;

});