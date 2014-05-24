function Tab (name, path, id, text, project, session) {
  this.name = name;
  this.path = path;
  this.id = id;
  this.text = text;
  this.project = project;
  this.session = session;
  
  return this;
}

Tab.prototype.position = function (index) {
  return 115 * index;
};

ndrive.controller('MainCtrl', function($scope, $rootScope) {
  $scope.tabs = [];
  $scope.current_tab = null;
  
  $scope.add_tab = function (event, file, text, project) {
    var session = new EditSession(text);
    session.setUndoManager(new UndoManager());
    session.setMode("ace/mode/javascript");
    Editor.setSession(session);
    
    var t = new Tab(file.name, file.path, file.id, text, project, session);
    $scope.tabs.push(t);
    $scope.current_tab = $scope.tabs.length - 1;
    $scope.$apply();
  };
  
  $rootScope.$on('addTab', $scope.add_tab);
  
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
});
