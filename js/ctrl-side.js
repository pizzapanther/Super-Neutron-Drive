var ProjectInstanceCtrl = function ($scope, $rootScope, $modalInstance, sideScope) {
  $scope.form = {
    name: '',
    error: ''
  };
  $scope.local_dir = null;
  $scope.sideScope = sideScope;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.choose_dir = function () {
    chrome.fileSystem.chooseEntry({type: "openDirectory"}, $scope.set_dir);
  };
  
  $scope.set_dir = function (dir) {
    $scope.local_dir = {entry: dir};
    
    chrome.fileSystem.getDisplayPath(dir, function (path) {
      $scope.local_dir.path = path;
      $scope.$apply();
    });
  };
  
  $scope.add_project = function () {
    if ($scope.form.name) {
      if ($scope.local_dir) {
        $scope.form.error = '';
        $scope.sideScope.add_project($scope.form.name, 'local-dir', $scope.local_dir);
        $modalInstance.close();
      }
      
      else {
        $scope.form.error = 'Please choose a directory.';
      }
    }
    
    else {
      $scope.form.error = 'Please enter a name.';
    }
  };
};

ndrive.controller('SideCtrl', function($scope, $rootScope, $modal) {
  $scope.projects = [];
  $scope.local_pids = [];
  $scope.rootScope = $rootScope;
  
  $scope.project_modal = function () {
    $scope.pmodal = $modal.open({
      templateUrl: 'modal-project.html',
      controller: ProjectInstanceCtrl,
      windowClass: 'projectModal',
      keyboard: true,
      resolve: {
        sideScope: function () { return $scope; }
      }
    });
  };
  
  $scope.add_project = function (name, ptype, pinfo) {
    var p = new LocalFS(name, pinfo, $scope);
    p.retain();
    
    $scope.projects.push(p);
  };
  
  LocalFS.load_projects($scope);
});
