var ndrive = angular.module(
  'ndrive',
  ['ngMaterial'],
  function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  }
);
