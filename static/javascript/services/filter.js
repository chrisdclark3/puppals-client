app.factory('Filter', function($rootScope, localStorageService, $q) {

    var factory = {};

    var filterDistance = false,
        oneMile = false,
        oneHalfMile = false,
        oneQuarterMile = false,
        ageIncludes = ['puppy', 'young', 'adult', 'senior'],
        sizeIncludes = ['XS', 'S', 'M', 'L', 'XL'];

    factory.distanceFilter = function() {
        filterDistance = filterDistance == false ? true : false;
    };

    factory.underDistance = function(d) {
        if (d == "one") {
            oneMile = oneMile == false ? true : false;
        }
        if (d == "one_half") {
            oneHalfMile = oneHalfMile == false ? true : false;
        }
        if (d == "one_quarter") {
            oneQuarterMile = oneQuarterMile == false ? true : false;
        }
    };

    factory.includeAge = function(age) {
        if (ageIncludes.indexOf(age) != -1) {
            ageIncludes.splice(ageIncludes.indexOf(age), 1);
        } else {
            ageIncludes.push(age);
        }
    };

    factory.includeSize = function(size) {
        if (sizeIncludes.indexOf(size) != -1) {
            sizeIncludes.splice(sizeIncludes.indexOf(size), 1);
        } else {
            sizeIncludes.push(size);
        }
    };
    factory.filterUsers = function(users, breed) {
        var filteredUsers = [];
        for (var i = 0; i < users.length; i++) {
            var ageType = "",
                age = users[i].dogs[0].age,
                search_exp = new RegExp(breed, 'ig');

            switch (true) {
                case age <= 1:
                    ageType = "puppy";
                    break;
                case age > 1 && age <= 5:
                    ageType = "young";
                    break;
                case age > 5 && age <= 10:
                    ageType = "adult";
                    break;
                case age > 10:
                    ageType = "senior";
                    break;
            }
            if (ageIncludes.length > 0) {
                if (ageIncludes.indexOf(ageType) == -1) {
                    continue;
                }
            }
            if (sizeIncludes.length > 0) {
                if (sizeIncludes.indexOf(users[i].dogs[0].size) == -1) {
                    continue;
                }
            }

            if (breed != undefined && breed.length != 0) {
                if (!search_exp.test(users[i].dogs[0].breed)) {
                    continue;
                }
            }

            if (oneMile == true) {
                if (users[i].distanceData.distance.value > 1610) {
                    continue;
                }
            }

            if (oneHalfMile == true) {
                if (users[i].distanceData.distance.value > 805) {
                    continue;
                }
            }

            if (oneQuarterMile == true) {
                if (users[i].distanceData.distance.value > 405) {
                    continue;
                }
            }

            filteredUsers.push(users[i]);
        }

        if (filterDistance == true) {
            filteredUsers.sort(function(a, b) {
                if (a.distanceData.distance.value < b.distanceData.distance.value) {
                    return -1;
                }
                if (a.distanceData.distance.value > b.distanceData.distance.value) {
                    return 1;
                }
                if (a.distanceData.distance.value == b.distanceData.distance.value) {
                    return 0;
                }
            });
        }
        console.log("Filter factory filteredUsers", filteredUsers);
        localStorageService.set('filteredUsers', filteredUsers);
        $rootScope.$broadcast('filteredUsers', filteredUsers);
    };

    return factory;

});