var ndrive = angular.module(
  'ndrive',
  ['ngMaterial'],
  function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  }
);

ndrive.run(function ($rootScope) {
  $rootScope.menu_on = false;
  
  $rootScope.toggle_menu = function () {
    if ($rootScope.menu_on) {
      $rootScope.menu_on = false;
    }
    
    else {
      $rootScope.menu_on = true;
    }
    
    console.log($rootScope.menu_on);
  };
});
