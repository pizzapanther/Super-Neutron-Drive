var lastNewFile = '';
var NewFileInstanceCtrl = function ($scope, $rootScope, $modalInstance, entry, project) {
  $scope.form = {
    name: lastNewFile,
    error: ''
  };
  
  $scope.entry = entry;
  $scope.project = project;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.add_file = function () {
    if ($scope.form.name) {
      lastNewFile = $scope.form.name;
      $scope.project.save_new_file(entry, $scope.form.name);
      $modalInstance.dismiss('create');
    }
    
    else {
      $scope.form.error = 'Please enter a file name.';
    }
  };
};

var RenameFileInstanceCtrl = function ($scope, $rootScope, $modalInstance, entry, project) {
  $scope.form = {
    name: entry.name,
    error: ''
  };
  
  $scope.entry = entry;
  $scope.project = project;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.rename = function () {
    if ($scope.form.name) {
      $scope.project.do_rename(entry, $scope.form.name);
      $modalInstance.dismiss('renamed');
    }
    
    else {
      $scope.form.error = 'Please enter a file name.';
    }
  };
};

ndrive.controller('RightClickCtrl', function($scope, $rootScope, $modal) {
  $scope.display = 'none';
  $scope.position = 'top: 0px; left: 0px';
  $scope.menu = [];
  $scope.modal = $modal;
  
  $scope.hide_menu = function () {
    $scope.display = 'none';
  };
  
  $scope.show_menu = function (event, click, menu) {
    $scope.menu = menu;
    $scope.display = 'block';
    
    var y = click.pageY - 10;
    var x = click.pageX - 10;
    $scope.position = 'top: ' + y + 'px; left: ' + x + 'px';
  };
  
  $rootScope.$on('showRightMenu', $scope.show_menu);
  $rootScope.$on('hideRightMenu', $scope.hide_menu);
});

ndrive.directive('rightClick', function($parse) {
  return {
    restrict:'A',
    link: function(scope, element, attrs) {
      var fn = $parse(attrs.rightClick);
      element.bind('contextmenu', function(event) {
          scope.$apply(function() {
            event.preventDefault();
            fn(scope, {$event:event});
          });
      });
    }
  };
});
