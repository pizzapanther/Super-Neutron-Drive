var GDriveErrorCtrl = function ($scope, $rootScope, $modalInstance, account, pid) {
  $scope.account = account;
  $scope.pid = pid;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.reinit = function () {
    $rootScope.$emit('google-account-init', $scope.account, null);
    $modalInstance.dismiss('reauth');
  };
};
