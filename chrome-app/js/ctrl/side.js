var ProjectInstanceCtrl = function ($scope, $rootScope, $modalInstance, sideScope) {
  $scope.project_types = [
    {name: 'Local', cls: 'LocalFS'},
    {name: 'Google Drive', cls: 'GDriveFS'}
  ];
  $scope.google_accounts = [
    {name: 'Add An Account', value: 'add-google'}
  ];
  
  for (var i=0; i < $rootScope.google_accounts.length; i++) {
    $scope.google_accounts.push({name: $rootScope.google_accounts[i].name, value: $rootScope.google_accounts[i].id});
  }
  
  $scope.form = {
    name: '',
    error: '',
    type: $scope.project_types[0],
    google_account: '',
    folderId: ''
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
  
  $scope.localUi = function () {
    return $scope.form.type.cls === 'LocalFS';
  };
  
  $scope.gdriveUi = function () {
    return $scope.form.type.cls === 'GDriveFS';
  };
  
  $scope.gdriveUiPicker = function () {
    return $scope.gdriveUi() && $scope.form.google_account !== '';
  };
  
  $scope.google_account_choosen = function () {
    if ($scope.form.google_account && $scope.form.google_account.value === 'add-google') {
      $scope.form.google_account = '';
      $rootScope.$emit('add-google-account');
    }
    
    else if ($scope.form.google_account) {
      var account = $rootScope.get_account($scope.form.google_account.value);
      if (!account.webview) {
        $rootScope.$emit('google-account-init', account);
      }
    }
  };
  
  $scope.google_added = function (event, id) {
    var account = $rootScope.get_account(id);
    $scope.google_accounts.push({name: account.name, value: account.id});
    $scope.form.google_account = $scope.google_accounts[$scope.google_accounts.length - 1];
    apply_updates($scope);
  };
  
  $scope.choose_google_dir = function () {
    var account = $rootScope.get_account($scope.form.google_account.value);
    if (account.webview) {
      $rootScope.$emit('google-picker-folder', $scope.form.google_account.value);
    }
    
    else {
      $rootScope.error_message('Google account has not been authenicated.');
    }
  };
  
  $scope.folder_picked = function (event, folderId) {
    $scope.form.folderId = folderId;
  };
  
  $scope.add_project = function () {
    if ($scope.form.name) {
      if ($scope.localUi()) {
        if ($scope.local_dir) {
          $scope.form.error = '';
          $scope.sideScope.add_project($scope.form.name, 'local-dir', $scope.local_dir);
          $modalInstance.close();
        }
        
        else {
          $scope.form.error = 'Please choose a directory.';
        }
      }
      
      else if ($scope.gdriveUi()) {
        if ($scope.form.google_account === '') {
          $scope.form.error = 'Please choose a Google account.';
        }
        
        else {
          var account = $rootScope.get_account($scope.form.google_account.value);
          if (account.webview) {
            $scope.form.error = '';
            var drive = {folderId: $scope.form.folderId, account: $scope.form.google_account.value};
            $scope.sideScope.add_project($scope.form.name, 'gdrive', drive);
            $modalInstance.close();
          }
          
          else {
            $scope.form.error = 'Google account has not been authenicated.';
          }
        }
      }
    }
    
    else {
      $scope.form.error = 'Please enter a name.';
    }
  };
  
  $scope.listeners = [];
  $scope.listeners.push($rootScope.$on('google-added', $scope.google_added));
  $scope.listeners.push($rootScope.$on('folder-picked', $scope.folder_picked));
  
  $scope.$on('$destroy', function() {
    for (var i=0; i < $scope.listeners.length; i++) {
      $scope.listeners[i]();
    }
  });
};

ndrive.controller('SideCtrl', function($scope, $rootScope, $modal, $q) {
  $scope.projects = [];
  $scope.local_pids = [];
  $scope.rootScope = $rootScope;
  $scope.freeAgent = new LocalFree('FreeAgent', {entries: {}}, $scope, 'free-agent');
  $scope.current_tool = 'projects';
  
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
  
  $scope.bad_project = function (pid) {
    for (var j=0; j < $scope.projects.length; j++) {
      if ($scope.projects[j].pid == pid) {
        $scope.projects.splice(j, 1);
        break;
      }
    }
    
    apply_updates($scope);
    $scope.save_projects();
  };
  
  $scope.add_project = function (name, ptype, pinfo) {
    var p;
    
    if (ptype === 'local-dir') {
      p = new LocalFS(name, pinfo, $scope);
      p.retain();
      $scope.projects.push(p);
      $scope.save_projects();
      LocalFS.store_projects($scope);
    }
    
    else if (ptype === 'gdrive') {
      p = new GDriveFS(name, pinfo.folderId, $rootScope, $scope, pinfo.account);
      $scope.projects.push(p);
      $scope.save_projects();
      GDriveFS.store_projects($scope);
    }
  };
  
  $scope.remove_project = function (project) {
    var i = -1;
    var j;
    
    if (project.cid == 'LocalFS') {
      for (j=0; j < $scope.local_pids.length; j++) {
        if ($scope.local_pids[j].pid == project.pid) {
          i = j;
          break;
        }
      }
      
      if (i >= 0) {
        $rootScope.$emit('removeProjectTabs', project.cid, project.pid, function () {
          for (j=0; j < $scope.projects.length; j++) {
            var p = $scope.projects[j];
            if (project.cid == p.cid && project.pid == p.pid) {
              $scope.projects.splice(j, 1);
              break;
            }
          }
          
          $scope.save_projects();
          LocalFS.store_projects($scope);
        });
      }
    }
    
    if (project.cid == 'GDriveFS') {
      for (j=0; j < $scope.projects.length; j++) {
        var p = $scope.projects[j];
        if (project.cid == p.cid && project.pid == p.pid) {
          $scope.projects.splice(j, 1);
          break;
        }
      }
      
      $scope.save_projects();
      GDriveFS.store_projects($scope);
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
      projs.push({name: p.name, pid: p.pid, type: p.cid});
    }
    
    chrome.storage.local.set({'projects': JSON.stringify(projs)}, function() {
      console.log('Projects saved');
      console.log(projs);
    });
  };
  
  $scope.restore_project_order = function () {
    chrome.storage.local.get('projects', function (obj) {
      if (obj.projects) {
        var projs = JSON.parse(obj.projects);
        var new_projects = [];
        var found = [];
        
        for (var j=0; j < projs.length; j++) {
          var n = projs[j];
          
          for (var i=0; i < $scope.projects.length; i++) {
            var p = $scope.projects[i];
            if (p.cid == n.type && p.pid == n.pid) {
              new_projects.push(p);
              found.push(p.cid + '-' + p.pid)
              break;
            }
          }
        }
        
        for (var k=0; k < $scope.projects.length; k++) {
          var pp = $scope.projects[k];
          if (found.indexOf(pp.cid + '-' + pp.pid) < 0) {
            new_projects.push(pp);
          }
        }
        
        $scope.projects = new_projects;
        $scope.$apply();
      }
    });
  };
  
  $scope.open_free_agents = function (event, items) {
    for (var i in items) {
      $scope.freeAgent.open_file(items[i].entry);
    }
  };
  
  $scope.open_remembered_tabs = function (event, saved_tabs) {
    for (var i=0; i < saved_tabs.length; i++) {
      var t = saved_tabs[i];
      if (t.pid == "free-agent" && t.ptype == "LocalFree") {
        $scope.freeAgent.reopen_file(t.retainer);
      }
      
      else {
        for (var j=0; j < $scope.projects.length; j++) {
          var p = $scope.projects[j];
          if (p.pid == t.pid && p.cid == t.ptype) {
            p.reopen_file(t.retainer, t.name);
            break;
          }
        }
      }
    }
  };
  
  $rootScope.$on('openFreeAgents', $scope.open_free_agents);
  $rootScope.$on('loadTabs', $scope.open_remembered_tabs);
  $rootScope.$on('save-projects', $scope.save_projects);
  
  window.load_local_files = $rootScope.load_local_files;
  
  LocalFS.load_projects($scope, $q)
  .then(function () {
    GDriveFS.load_projects($scope, $q)
    .then($scope.restore_project_order)
    .then(function () { $rootScope.$emit('reopenTabs') });
  });
});
