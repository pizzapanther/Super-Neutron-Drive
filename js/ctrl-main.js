function Tab (name, path, id, project, text, session, scope) {
  this.name = name;
  this.path = path;
  this.id = id;
  this.project = project;
  this.session = session;
  this.md5sum = md5(text);
  this.saved_md5sum = this.md5sum;
  this.scope = scope;
  
  return this;
}

Tab.prototype.position = function (index) {
  return 115 * index;
};

Tab.prototype.save = function (force) {
  var changed = false;
  if (!force) {
    var md5sum = md5(this.session.getValue());
    if (md5sum != this.md5sum) {
      changed = true;
    }
  }
  
  if (force || changed) {
    this.project.save(this);
  }
};

Tab.prototype.update_hash = function () {
  this.md5sum = md5(this.session.getValue());
};

ndrive.controller('MainCtrl', function($scope, $rootScope) {
  $scope.tabs = [];
  $scope.current_tab = null;
  
  $scope.update_hash = function () {
    $scope.tabs[$scope.current_tab].update_hash();
    $scope.$apply();
  };
  
  $scope.get_mode = function (name) {
    var parts = name.split('.');
    var ext = name.toLowerCase();
    if (parts.length > 1) {
      ext = parts[parts.length - 1].toLowerCase();
    }
    
    if (EXTENSIONS[ext]) {
      return EXTENSIONS[ext];
    }
    
    return 'plain_text';
  };
  
  $scope.add_tab = function (event, file, text, project) {
    var session = new EditSession(text);
    session.setUndoManager(new UndoManager());
    session.setMode("ace/mode/" + $scope.get_mode(file.name));
    session.setTabSize(2);
    session.setUseSoftTabs(true);
    Editor.setSession(session);
    
    var t = new Tab(file.name, file.path, file.id, project, text, session, $scope);
    $scope.tabs.push(t);
    $scope.current_tab = $scope.tabs.length - 1;
    $scope.$apply();
    
    Editor.focus();
    Editor.on("change", $scope.update_hash);
  };
  
  $scope.open_tab = function (event, path, pid, callback) {
    for (var i=0; i < $scope.tabs.length; i++) {
      var tab = $scope.tabs[i];
      if (tab.path == path && tab.project.pid == pid) {
        $scope.switch_tab(i);
        return null;
      }
    }
    
    callback();
  };
  
  $scope.remove_tab = function (index) {
    delete $scope.tabs[index].session;
    $scope.tabs.splice(index, 1);
    if (index === $scope.current_tab) {
      if ($scope.tabs.length === 0) {
        $scope.current_tab = null;
      }
      
      else {
        if ($scope.tabs.length > index) {
          $scope.switch_tab(index);
        }
        
        else {
          $scope.switch_tab(index - 1);
        }
      }
    }
  };
  
  $scope.switch_tab = function (index) {
    $scope.current_tab = index;
    Editor.setSession($scope.tabs[index].session);
  };
  
  $scope.save_current = function () {
    $scope.tabs[$scope.current_tab].save(true);
  };
  
  $rootScope.$on('addTab', $scope.add_tab);
  $rootScope.$on('openTab', $scope.open_tab);
  $rootScope.$on('keyboard-save', $scope.save_current);
});
