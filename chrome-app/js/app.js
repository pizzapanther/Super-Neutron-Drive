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

var LAST_EXCEPTION = null;

var show_update;


ndrive.factory('$exceptionHandler', function ($log) {
  return function (exception, cause) {
    LAST_EXCEPTION = exception;
    report_error(exception.message, {cause: '' + cause + '', stack: exception.stack});
    
    //default action taken by angular
    $log.error.apply($log, arguments);
  };
});

window.onerror = function (msg, url, line) {
  report_error(msg, {url: url, line: line});
};

function report_error (error, data) {
  var service = angular.element('html').injector().get('ErrorService');
  service.report_error(error, data);
}

ndrive.run(function ($rootScope, $modal, $q) {
  $rootScope.manifest = chrome.runtime.getManifest();
  
  $rootScope.server_url = 'https://super.neutrondrive.com';
  if ($rootScope.manifest.server_url) {
    $rootScope.server_url = $rootScope.manifest.server_url;
  }
  
  $rootScope.google_accounts = [];
  $rootScope.neutron_beams = [];
  $rootScope.neutron_account = {token: null, username: null};
  
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
      templateUrl: 'modals/error.html',
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
  
  $rootScope.get_beam = function (id) {
    for (var i=0; i < $rootScope.neutron_beams.length; i++) {
      if ($rootScope.neutron_beams[i].id == id) {
        return $rootScope.neutron_beams[i];
      }
    }
    
    return null;
  };
  
  $rootScope.remove_beam = function (id) {
    var b = null;
    
    for (var i=0; i < $rootScope.neutron_beams.length; i++) {
      if ($rootScope.neutron_beams[i].id == id) {
        b = i;
        break;
      }
    }
    
    if (b !== null) {
      $rootScope.neutron_beams.splice(b, 1);
      $rootScope.$emit('remove-beam-project', id);
    }
  };
  
  $rootScope.store_beams = function () {
    chrome.storage.sync.set({'neutron_beams': JSON.stringify($rootScope.neutron_beams)}, function() {
      console.log('Beams saved');
      console.log($rootScope.neutron_beams);
    });
  };
  
  $rootScope.get_beams = function () {
    var deferred = $q.defer();
    
    chrome.storage.sync.get('neutron_beams', function (obj) {
      if (obj && obj.neutron_beams) {
        $rootScope.neutron_beams = JSON.parse(obj.neutron_beams);
        apply_updates($rootScope);
      }
      
      deferred.resolve();
    });
    
    return deferred.promise;
  };
  
  $rootScope.show_update = function (details) {
    $rootScope.$emit('showUpdate', details);
    apply_updates($rootScope);
  };
  
  show_update = $rootScope.show_update;
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