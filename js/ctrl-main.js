function Tab (name) {
  this.name = name;
  
  return this;
}

Tab.prototype.position = function (index) {
  return 75 * index;
};

ndrive.controller('MainCtrl', function($scope, $rootScope) {
  $scope.tabs = [new Tab('narf.py'), new Tab('troz.css')];
  $scope.current_tab= null;
  
});