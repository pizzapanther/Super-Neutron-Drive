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

ndrive.controller('SideCtrl', function($scope, $rootScope, $modal, $q) {
  $scope.projects = [];
  $scope.local_pids = [];
  $scope.rootScope = $rootScope;
  $scope.freeAgent = new LocalFree('FreeAgent', {entries: {}}, $scope, 'free-agent');
  
  $scope.hide_right = function () {
    $rootScope.$emit('hideRightMenu');
  };
  
  $scope.project_modal = function () {
    var pmodal = $modal.open({
      templateUrl: 'modal-project.html',
      controller: ProjectInstanceCtrl,
      windowClass: 'projectModal',
      keyboard: true,
      resolve: {
        sideScope: function () { return $scope; }
      }
    });
    
    pmodal.opened.then(function () {
      setTimeout(function () { $("#project-name").focus(); }, 100);
    });
  };
  
  $scope.add_project = function (name, ptype, pinfo) {
    var p = new LocalFS(name, pinfo, $scope);
    p.retain();
    
    $scope.projects.push(p);
    $scope.save_projects();
  };
  
  $scope.remove_project = function (project) {
    var i = -1;
    
    if (project.constructor.name == 'LocalFS') {
      for (var j=0; j < $scope.local_pids.length; j++) {
        if ($scope.local_pids[j].pid == project.pid) {
          i = j;
          break;
        }
      }
    }
    
    if (i >= 0) {
      $rootScope.$emit('removeProjectTabs', project.constructor.name, project.pid, function () {
        $scope.local_pids.splice(i, 1);
        LocalFS.store_projects($scope);
        
        for (var j=0; j < $scope.projects.length; j++) {
          var p = $scope.projects[j];
          if (project.constructor.name == p.constructor.name && project.pid == p.pid) {
            $scope.projects.splice(j, 1);
            
            break;
          }
        }
        
        $scope.save_projects();
      });
    }
  };
  
  $scope.project_down = function (index) {
    if (index !== $scope.projects.length - 1) {
      var p = $scope.projects.splice(index, 1)[0];
      $scope.projects.splice(index + 1, 0, p);
      $scope.$apply();
      
      return $scope.projects;
    }
    
    return null;
  };
  
  $scope.project_up = function (index) {
    if (index !== 0) {
      var p = $scope.projects.splice(index, 1)[0];
      $scope.projects.splice(index - 1, 0, p);
      $scope.$apply();
      
      return $scope.projects;
    }
    
    return null;
  };
  
  $scope.save_projects = function () {
    var projs = [];
    for (var i=0; i < $scope.projects.length; i++) {
      var p = $scope.projects[i];
      projs.push({name: p.name, pid: p.pid, type: p.className()});
    }
    
    chrome.storage.local.set({'projects': JSON.stringify(projs)}, function() {
      console.log('Projects saved');
    });
  };
  
  $scope.restore_project_order = function () {
    chrome.storage.local.get('projects', function (obj) {
      if (obj.projects) {
        var projs = JSON.parse(obj.projects);
        if (projs.length == $scope.projects.length) {
          var new_projects = [];
          
          for (var j=0; j < projs.length; j++) {
            var n = projs[j];
            for (var i=0; i < $scope.projects.length; i++) {
              var p = $scope.projects[i];
              if (p.className() == n.type && p.pid == n.pid) {
                new_projects.push(p);
                break;
              }
            }
          }
          
          $scope.projects = new_projects;
          $scope.$apply();
        }
      }
    });
  };
  
  $scope.open_free_agents = function (event, items) {
    for (var i in items) {
      $scope.freeAgent.open_file(items[i].entry);
    }
  };
  
  $rootScope.$on('openFreeAgents', $scope.open_free_agents);
  window.load_local_files = $rootScope.load_local_files;
  
  LocalFS.load_projects($scope, $q).then($scope.restore_project_order);
});
