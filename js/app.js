var ModalInstanceCtrl = function ($scope, $modalInstance, message) {
  $scope.message = message;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var Editor = null;
var EditSession = require('ace/edit_session').EditSession;
var UndoManager = require("ace/undomanager").UndoManager;

var ndrive = angular.module('ndrive', ['ui.bootstrap']);

ndrive.run(function ($rootScope, $modal) {
  $rootScope.manifest = chrome.runtime.getManifest();
  
  $rootScope.load_editor = function () {
    Editor = ace.edit("editor");
    Editor.setTheme("ace/theme/textmate");
  };
  
  $rootScope.error_message = function (m) {
    $rootScope.modal = $modal.open({
      templateUrl: 'modal-error.html',
      controller: ModalInstanceCtrl,
      windowClass: 'loadingModal errorModal',
      keyboard: true,
      resolve: {message: function () { return m; }}
    });
  };
});
