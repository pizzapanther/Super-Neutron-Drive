var ModalInstanceCtrl = function ($scope, $modalInstance, message) {
  $scope.message = message;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var Editor = null;
var EditSession = require('ace/edit_session').EditSession;
var UndoManager = require("ace/undomanager").UndoManager;

var ndrive = angular.module('ndrive', ['ui.utils', 'ui.bootstrap']);
ndrive.run(function ($rootScope, $modal) {
  $rootScope.manifest = chrome.runtime.getManifest();
  
  $rootScope.server_url = 'https://super.neutrondrive.com';
  if ($rootScope.manifest.server_url) {
    $rootScope.server_url = $rootScope.manifest.server_url;
  }
  $rootScope.google_accounts = [];
  
  $rootScope.load_editor = function () {
    Editor = ace.edit("editor");
    Editor.setTheme("ace/theme/textmate");
    
    $rootScope.load_commands(0);
  };
  
  $rootScope.load_commands = function (i) {
    if (i < SHORTCUTS.length) {
      var cmd = SHORTCUTS[i];
      
      Editor.commands.addCommand({
        name: cmd.name,
        bindKey: {
          win: cmd.win,
          mac: cmd.mac,
          sender: 'editor'
        },
        exec: function(env, args, request) {
          $rootScope.$emit('keyboard-' + cmd.event);
        }
      });
      
      $rootScope.load_commands(i + 1);
    }
  };
  
  $rootScope.error_message = function (m) {
    $rootScope.modal = $modal.open({
      templateUrl: 'modal-error.html',
      controller: ModalInstanceCtrl,
      windowClass: 'loadingModal errorModal',
      keyboard: true,
      resolve: {message: function () { return m; }}
    });
    
    $rootScope.modal.opened.then(function () {
      setTimeout(function () { $("#error-ok").focus() }, 100);
    });
  };
  
  $rootScope.load_local_files = function (items) {
    $rootScope.$emit('openFreeAgents', items);
  };
  
  $rootScope.get_account = function (id) {
    for (var i=0; i < $rootScope.google_accounts.length; i++) {
      if ($rootScope.google_accounts[i].id == id) {
        return $rootScope.google_accounts[i];
      }
    }
    
    return null;
  };
});

function randomString (len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var rs = '';
  for (var i = 0; i < len; i++) {
  	var randomPoz = Math.floor(Math.random() * charSet.length);
  	rs += charSet.substring(randomPoz,randomPoz+1);
  }
  
  return rs;
}

function apply_updates ($scope) {
  if(!$scope.$$phase) {
    $scope.$apply();
  }
}