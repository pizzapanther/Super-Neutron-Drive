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
});

ndrive.controller('EnlargeController', function($scope, $mdDialog, img, title) {
  $scope.img = img;
  $scope.title = title;
  console.log($scope);
  
  $scope.closeDialog = function() {
    $mdDialog.hide();
  };
});