var UploadCtrl = function ($scope, $rootScope, $modalInstance, entry, project) {
  $scope.entry = entry;
  $scope.project = project;
  $scope.file_count = 0;
  $scope.files = null;
  $scope.error = '';
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.do_upload = function () {
    if ($scope.file_count === 0) {
      $scope.error = 'Please select a file to continue.';
    }
    
    else {
      $modalInstance.dismiss('uploading');
      $scope.project.do_upload($scope.project, $scope.entry, $scope.files);
    }
  };
  
  $scope.choose_file = function () {
    chrome.fileSystem.chooseEntry({type: 'openFile', acceptsMultiple: true}, $scope.files_choosen);
  };
  
  $scope.files_choosen = function (entries) {
    $scope.file_count = entries.length;
    $scope.files = entries;
    apply_updates($scope);
  };
};

var UploadingCtrl = function ($scope, $rootScope, $modalInstance, entry, name) {
  $scope.entry = entry;
  $scope.name = name;
};
