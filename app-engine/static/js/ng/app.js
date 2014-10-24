var ndrive = angular.module(
  'ndrive',
  ['ngMaterial'],
  function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  }
);

ndrive.run(function ($rootScope, $mdDialog) {
  $rootScope.menu_on = false;
  
  $rootScope.toggle_menu = function () {
    if ($rootScope.menu_on) {
      $rootScope.menu_on = false;
    }
    
    else {
      $rootScope.menu_on = true;
    }
  };
  
  $rootScope.enlarge = function($event, img, title) {
    $mdDialog.show({
      targetEvent: $event,
      controller: 'EnlargeController',
      templateUrl: '/static/templates/enlarge.html',
      locals: {img: img, title: title}
    });
  };
  
  $rootScope.egg_modal = function() {
    $mdDialog.show({
      controller: 'EggController',
      templateUrl: '/static/templates/egg.html'
    });
  };
  
  $rootScope.k_code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  $rootScope.keys = [];
  $rootScope.easter_egg = function ($event) {
    $rootScope.keys.push($event.keyCode);
    
    while ($rootScope.keys.length > 10) {
      $rootScope.keys.shift();
    }
    
    if ($rootScope.keys.length == 10) {
      if (JSON.stringify($rootScope.keys) == JSON.stringify($rootScope.k_code)) {
        $rootScope.egg_modal();
      }
    }
  };
});

ndrive.controller('EnlargeController', function($scope, $mdDialog, img, title) {
  $scope.img = img;
  $scope.title = title;
  
  $scope.closeDialog = function() {
    $mdDialog.hide();
  };
});

ndrive.controller('EggController', function($scope, $mdDialog) {
  $scope.closeDialog = function() {
    $mdDialog.hide();
  };
});