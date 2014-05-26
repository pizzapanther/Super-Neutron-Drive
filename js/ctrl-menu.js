ndrive.controller('MenuCtrl', function($scope, $rootScope) {
  $scope.messages = {};
  
  $scope.add_message = function (event, id, mtype, text, timeout) {
    $scope.messages[id] = {mtype: mtype, text: text, id: md5(id)};
    $scope.$apply();
    
    if (timeout) {
      setTimeout(function () {
        $scope.remove_message(event, id);
      }, 4000);
    }
  };
  
  $scope.remove_message = function (event, id) {
    $("#message-" + md5(id)).fadeOut("slow", function() {
      delete $scope.messages[id];
      $scope.$apply();
    });
  };
  
  $rootScope.$on('addMessage', $scope.add_message);
  $rootScope.$on('removeMessage', $scope.add_message);
});