function UsersController($window, $rootScope, $scope, $location, UsersFactory, localStorageService, socket, Upload) {

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

  var users;
  var current_user;


  $rootScope.set_collapsed = function () {
    if ($window.width <= 768) {
      $rootScope.isCollapsed = true;
    } else {
      $rootScope.isCollapsed = false;
    }
  };

  if ($location.path() != '/register') {
    UsersFactory.get_users(function (data) {
      localStorageService.set('users', data);
      users = data;
      $rootScope.users = users;
      $scope.users = users;
    });
    if (current_user == undefined) {
      current_user = localStorageService.get('current_user');
      $rootScope.current_user = current_user;
      $scope.current_user = current_user;
    }
  }

  $rootScope.set_navbar = function(tab) {
    if (tab == 'profile') {
      $scope.profile_tab = true;
    }
  }

  $rootScope.test_login = function () {
    console.log('RUNNING TEST LOGIN...');
    $scope.current_user = {};
    $scope.current_user.email = "chrisdclark3@gmail.com";
    $scope.current_user.password = "password";
    $rootScope.login();
  };

  $rootScope.login = function () {
    console.log("SCOPE CURRENT_USER IN LOGIN > USERSCONTROLLER", $scope.current_user);
    UsersFactory.login($scope.current_user, function (data) {
      console.log("DATA IN USERS FACTORY CURRENT_USER", data);
      if (data.errors) {
        $rootScope.errors = data;
        $location.path("/");
      } else {
        current_user = data;
        $rootScope.current_user = current_user;
        $scope.current_user = current_user;
        localStorageService.set('current_user', current_user);
        $location.path("/home");
      }
      console.log("SCOPE CURRENT_USER IN LOGIN > USERSCONTROLLER", current_user);
    });
  };

  $rootScope.logout = function () {
    localStorageService.clearAll();
    $scope.messages = "Thank you for being a loyal customer of PupPals!";
    console.log($scope);
  };

  var new_user = {};
  $scope.show_default_dog = true;
  $scope.show_default_user = true;

  $scope.$watch('dog_image', function(){
    if ($scope.show_default_dog == true) {
      $scope.show_default_dog = false;
    } else {
      $scope.show_default_dog = true;
    }
  });

  $scope.$watch('user_image', function(){
    if ($scope.show_default_user == true) {
      $scope.show_default_user = false;
    } else {
      $scope.show_default_user = true;
    }
  });

  $scope.upload_user = function () {
    console.log('UPLOADING USER...', $scope.new_user);
    user_image = $scope.user_image;
    new_user = {};
    new_user.first_name = $scope.new_user.first_name;
    new_user.last_name = $scope.new_user.last_name;
    new_user.password_digest = $scope.new_user.password_digest;
    new_user.email = $scope.new_user.email;
    if ($scope.new_user.address2 == null || $scope.new_user.address2 == undefined) {
      $scope.new_user.address2 = "";
    }
    new_user.address = $scope.new_user.address1 + " " + $scope.new_user.address2 + " " + $scope.new_user.city + " " + $scope.new_user.state + " " + $scope.new_user.zipcode;

    $scope.upload = Upload.upload({
      headers: { 'Access-Control-Allow-Origin': '*' },
      url: 'http://localhost:3000/users',
      method: 'POST',
      fields: {
        'new_user[first_name]': new_user.first_name,
        'new_user[last_name]': new_user.last_name,
        'new_user[password_digest]': new_user.password_digest,
        'new_user[email]': new_user.email,
        'new_user[address]': new_user.address,
      },
      file: $scope.user_image,
      fileFormDataName: 'new_user[avatar]'
    }).success(function (data, status, headers, config){
      current_user = data;
      $scope.current_user = current_user;
      upload_dog();
    }).error(function (data, status, headers, config) {
      console.log('error status: ' + status);
    });
  };

  function upload_dog () {
    console.log('UPLOADING DOG...', $scope.current_user, $scope.dog);
    dog_image = $scope.dog_image;
    $scope.upload = Upload.upload({
      headers: { 'Access-Control-Allow-Origin': '*' },
      url: 'http://localhost:3000/dogs',
      method: 'POST',
      fields: {
        'new_user[id]': $scope.current_user.id,
        'dog[name]': $scope.new_user.dogs[0].name,
        'dog[age]': $scope.new_user.dogs[0].age,
        'dog[breed]': $scope.new_user.dogs[0].breed,
        'dog[description]': $scope.new_user.dogs[0].description,
        'dog[size]': $scope.new_user.dogs[0].size,
      },
      file: $scope.dog_image,
      fileFormDataName: 'dog[avatar]'
    }).success(function (data, status, headers, config){
      console.log("USERS IN UPLOAD DOG", data);
      users = data;
      $rootScope.users = users;
      $scope.users = users;
      localStorageService.set('users', users);
      $scope.login();
    }).error(function (data, status, headers, config) {
      console.log('error status: ' + status);
    });
  }
}

UsersController.$inject = ["$window","$rootScope", "$scope", "$location", "UsersFactory", "localStorageService", "socket", "Upload"];

app.controller('UsersController', UsersController);
