var PrefCtrl = function ($scope, $rootScope, $modalInstance) {
  $scope.themes = THEMES;
  $scope.key_modes = KEY_MODES;
  $scope.font_modes = FONT_MODES;
  $scope.wrap_modes = WRAP_MODES;
  $scope.form = {};
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  for (var key in PREFS) {
    $scope.form[key] = PREFS[key];
  }
  
  $scope.default = function () {
    for (var key in PREFS) {
      $scope.form[key] = DEFAULT_PREFS[key];
    }
  };
  
  $scope.save_prefs = function () {
    $rootScope.$emit('setPrefs', $scope.form);
    $modalInstance.dismiss('saved');
    return false;
  };
};

var DonateCtrl = function ($scope, $rootScope, $modalInstance) {
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var HelpCtrl = function ($scope, $rootScope, $modalInstance, version) {
  $scope.version = version;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.donate_modal = function () {
    $modalInstance.dismiss('donate');
    $rootScope.$emit('donateModal');
  };
};

ndrive.controller('MenuCtrl', function($scope, $rootScope, $modal) {
  $scope.messages = {};
  $scope.recent_files = [];
  
  $scope.hide_right = function () {
    $rootScope.$emit('hideRightMenu');
  };
  
  $scope.add_message = function (event, id, mtype, text, timeout, skip_apply) {
    $scope.messages[id] = {mtype: mtype, text: text, id: md5(id)};
    if (!skip_apply && !$scope.$$phase) {
      $scope.$apply();
    }
    
    if (timeout) {
      setTimeout(function () {
        $scope.remove_message(event, id);
      }, 4000);
    }
  };
  
  $scope.remove_message = function (event, id) {
    setTimeout(function () {
      $("#message-" + md5(id)).fadeOut("slow", function() {
        delete $scope.messages[id];
        $scope.$apply();
      });
    }, 100);
  };
  
  $scope.pref_modal = function () {
    $scope.pmodal = $modal.open({
      templateUrl: 'modal-prefs.html',
      controller: PrefCtrl,
      windowClass: 'prefModal',
      keyboard: true,
      resolve: {}
    });
    
    $scope.pmodal.opened.then(
      function () {
        setTimeout(function () { $("#prefs-theme").focus(); }, 100);
      }
    );
  };
  
  $scope.help_modal = function () {
    var version = $rootScope.manifest.version;
    
    $modal.open({
      templateUrl: 'modal-help.html',
      controller: HelpCtrl,
      windowClass: 'helpModal',
      keyboard: true,
      size: 'lg',
      resolve: {version: function () { return version; }}
    });
  };
  
  $scope.donate_modal = function () {
    $modal.open({
      templateUrl: 'modal-donate.html',
      controller: DonateCtrl,
      windowClass: 'donateModal',
      keyboard: true,
      resolve: {}
    });
  };
  
  $scope.send_event = function (event) {
    $rootScope.$emit(event);
  };
  
  $scope.add_recent = function (event, file) {
    for (var i=0; i < $scope.recent_files.length; i++) {
      var r = $scope.recent_files[i];
      if (r.retainer == file.retainer && r.ptype == file.ptype && r.pid == file.pid) {
        $scope.recent_files.splice(i, 1);
        break;
      }
    }
    
    $scope.recent_files.push(file);
    if ($scope.recent_files.length > 12) {
      $scope.recent_files.splice(0, 1);
    }
    
    $rootScope.$emit('recentFiles', $scope.recent_files);
    
    chrome.storage.local.set({'recent_files': JSON.stringify($scope.recent_files)}, function() {
      console.log('Recent files saved');
    });
  };
  
  $scope.restore_recent = function () {
    chrome.storage.local.get('recent_files', function (obj) {
      if (obj && obj.recent_files) {
        $scope.recent_files = JSON.parse(obj.recent_files);
        $scope.$apply();
        
        $rootScope.$emit('recentFiles', $scope.recent_files);
      }
    });
  };
  
  $scope.open_recent = function (index) {
    for (var i=0; i < $scope.recent_files.length; i++) {
      var r = $scope.recent_files[i];
      if (i == index) {
        $rootScope.$emit('loadTabs', [r]);
        break;
      }
    }
  };
  
  $rootScope.$on('addMessage', $scope.add_message);
  $rootScope.$on('removeMessage', $scope.remove_message);
  $rootScope.$on('donateModal', $scope.donate_modal);
  $rootScope.$on('addRecent', $scope.add_recent);
  $rootScope.$on('restoreRecent', $scope.restore_recent);
});

ndrive.controller('SplitterCtrl', function($scope, $rootScope) {
  $scope.cls = 'fa-caret-left';
  
  $scope.collapse = function () {
    var w = 0;
    
    if ($scope.cls == 'fa-caret-left') {
      $scope.cls = 'fa-caret-right';
      w = $("#leftSplitter").outerWidth();
      
      $("#mainApp").css('width', 'calc(100% - ' + w + 'px)');
      $("#mainApp").css('left', w + 'px');
      $("#leftSplitter").css('left', '0');
    }
    
    else {
      $scope.cls = 'fa-caret-left';
      var w1 = $("#leftSide").outerWidth();
      var w2 = $("#leftSplitter").outerWidth();
      w = w1 + w2;
      
      $("#mainApp").css('width', 'calc(100% - ' + w + 'px)');
      $("#mainApp").css('left', w + 'px');
      $("#leftSplitter").css('left', w1 + 'px');
    }
  };
  
  $scope.move_side = function (w1) {
    var w2 = $("#leftSplitter").outerWidth();
    var w = w1 + w2;
    
    $("#mainApp").css('width', 'calc(100% - ' + w + 'px)');
    $("#mainApp").css('left', w + 'px');
    $("#leftSplitter").css('left', w1 + 'px');
    $("#leftSide").css('width', w1 + 'px');
  };
  
  $('#leftSplitter')
    .drag("start",function( ev, dd ){
      dd.attr = $( ev.target ).prop("className");
    })
		.drag(function( ev, dd ){
      if ( dd.attr.indexOf("mover") > -1 ){
        console.log(dd.offsetX);
        $scope.move_side(dd.offsetX);
      }
    }
  );
});
