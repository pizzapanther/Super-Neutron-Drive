var ProjectInstanceCtrl = function ($scope, $rootScope, $modalInstance, BeamSetupService, sideScope) {
  $scope.view = 'main';
  $scope.project_types = [
    {name: 'Local', cls: 'LocalFS'},
    {name: 'Google Drive', cls: 'GDriveFS'},
    {name: 'Neutron Beam', cls: 'NBeamFS'},
  ];
  $scope.google_accounts = [
    {name: 'Add An Account', value: 'add-google'}
  ];
  
  $scope.beams = [
    {name: 'Add A Beam', value: 'add-beam'}
  ];
  
  for (var i=0; i < $rootScope.google_accounts.length; i++) {
    $scope.google_accounts.push({name: $rootScope.google_accounts[i].name, value: $rootScope.google_accounts[i].id});
  }
  
  for (i=0; i < $rootScope.neutron_beams.length; i++) {
    var name = $rootScope.neutron_beams[i].address + ':' + $rootScope.neutron_beams[i].port;
    $scope.beams.push({name: name, value: $rootScope.neutron_beams[i].id});
  }
  
  $scope.form = {
    name: '',
    error: '',
    type: $scope.project_types[0],
    google_account: '',
    beam: '',
    folderId: ''
  };
  
  $scope.bform = {
    address: '',
    port: 32828,
    secure: true
  };
  $scope.bform_error = '';
  
  $scope.local_dir = null;
  $scope.sideScope = sideScope;
  $scope.api_key = null;
  
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
  
  $scope.beamUi = function () {
    return $scope.form.type.cls === 'NBeamFS';
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
  
  $scope.beam_choosen = function () {
    if ($scope.form.beam && $scope.form.beam.value === 'add-beam') {
      $scope.form.beam = '';
      $scope.view = 'add-beam';
      $scope.api_key = null;
    }
    
    else if ($scope.form.beam) {
      var b = $rootScope.get_beam($scope.form.beam.value);
      if (b.secure) {
        $scope.api_key = 'Retrieving API Key ...';
        BeamSetupService.generate_api(b.id, false, $scope.set_api_key);
      }
    }
  };
  
  $scope.add_beam = function () {
    if ($scope.bform.address === '') {
      $scope.bform_error = 'Enter a beam address.'; 
    }
    
    else if (!$scope.bform.port || $scope.bform.port < 1) {
      $scope.bform_error = 'Enter a beam port.'; 
    }
    
    else {
      var name = $scope.bform.address + ':' + $scope.bform.port;
      var id = $scope.bform.address + '-' + $scope.bform.port + '-' + Date.now();
      
      $scope.beams.push({name: name, value: id});
      var b = angular.copy($scope.bform);
      b.id = id;
      
      $rootScope.neutron_beams.push(b);
      $rootScope.store_beams();
      $scope.form.beam = $scope.beams[$scope.beams.length - 1];
      
      $scope.view = 'main';
      
      if (b.secure) {
        $scope.api_key = 'Retrieving API Key ...';
        BeamSetupService.generate_api(b.id, false, $scope.set_api_key);
      }
    }
  };
  
  $scope.set_api_key = function (data) {
    $scope.api_key = data.key;
  };
  
  $scope.copy_key = function () {
    var i = document.querySelector('.api_key input');
    i.setSelectionRange(0, i.value.length);
    document.execCommand('copy');
  };
  
  $scope.cancel_beam = function () {
    $scope.view = 'main';
  };
  
  $scope.mainView = function () {
    return $scope.view === 'main';
  };
  
  $scope.beamView = function () {
    return $scope.view === 'add-beam';
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
      
      else if ($scope.beamUi()) {
        if ($scope.form.beam === '') {
          $scope.form.error = 'Please choose a Neutron Beam.';
        }
        
        else {
          var beam = $rootScope.get_beam($scope.form.beam.value);
          $scope.sideScope.add_project($scope.form.name, 'beam', beam);
          $modalInstance.close();
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

ndrive.controller('SideCtrl', function($scope, $rootScope, $modal, $q, BeamFactory) {
  $scope.BeamFactory = BeamFactory;
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
      templateUrl: 'modals/project.html',
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
    
    else if (ptype === 'beam') {
      p = new NBeamFS(name, pinfo, $rootScope, $scope, pinfo.id);
      $scope.projects.push(p);
      $scope.save_projects();
      NBeamFS.store_projects($scope);
    }
  };
  
  $scope.remove_beam = function ($event, id) {
    for (var j=0; j < $scope.projects.length; j++) {
      var project = $scope.projects[j];
      
      if (project.cid == 'NBeamFS' && project.pid == id) {
        $scope.remove_project(project);
      }
    }
  };
  
  $scope.remove_project = function (project) {
    var i = -1;
    var j;
    var p;
    
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
    
    else {
      for (j=0; j < $scope.projects.length; j++) {
        p = $scope.projects[j];
        if (project.cid == p.cid && project.pid == p.pid) {
          $scope.projects.splice(j, 1);
          break;
        }
      }
      
      $scope.save_projects();
      
      if (project.cid == 'GDriveFS') {
        GDriveFS.store_projects($scope);
      }
      
      else if (project.cid == 'NBeamFS') {
        NBeamFS.store_projects($scope);
      }
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
  $rootScope.$on('remove-beam-project', $scope.remove_beam);
  
  window.load_local_files = $rootScope.load_local_files;
  $rootScope.get_beams().then(function () {
    LocalFS.load_projects($scope, $q).then(function () {
      GDriveFS.load_projects($scope, $q).then(function () {
        NBeamFS.load_projects($scope, $q).then($scope.restore_project_order).then(function () {
          $rootScope.$emit('reopenTabs');
        });
      });
    });
  });
});
