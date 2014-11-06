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

var NBeamsCtrl = function ($scope, $rootScope, $modalInstance, $modal, BeamSetupService) {
  $scope.form = {beams: []};
  for (var i=0; i < $rootScope.neutron_beams.length; i++) {
    var b = angular.copy($rootScope.neutron_beams[i]);
    b.rm = false;
    $scope.form.beams.push(b);
  }
  
  $scope.confirm = function () {
    $modal.open({
      templateUrl: 'modals/confirm.html',
      controller: ConfirmCtrl,
      windowClass: 'confirmModal',
      keyboard: true,
      resolve: {
        message: function () { return 'Deleting a Neutron Beam will delete any projects associated with it.'; },
        f: function () { return $scope.save_beams }
      }
    });
  };
  
  $scope.nothing = function () {};
  $scope.save_beams = function (confirmed) {
    if (!confirmed) {
      for (var i=0; i < $scope.form.beams.length; i++) {
        if ($scope.form.beams[i].rm) {
          $scope.confirm();
          return null;
        }
      }
    }
    
    else if (confirmed === 'no') {
      return null;
    }
    
    for (i=0; i < $scope.form.beams.length; i++) {
      var b = $scope.form.beams[i];
      
      if (b.rm) {
        $rootScope.remove_beam(b.id);
      }
      
      else {
        var root = $rootScope.get_beam(b.id);
        root.address = b.address;
        root.port = b.port;
        root.secure = b.secure;
      }
    }
    
    $rootScope.store_beams();
    $modalInstance.dismiss('save');
  };
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.view_api = function (index, regen) {
    var b = $scope.form.beams[index];
    $scope.bname = b.address + ':' + b.port;
    BeamSetupService.generate_api(b.id, regen, $scope.show_api);
  };
  
  $scope.show_api = function (data) {
    $modal.open({
      templateUrl: 'modals/apikey.html',
      controller: KeyCtrl,
      windowClass: 'keyModal',
      keyboard: true,
      resolve: {
        server: function () {return $scope.bname},
        api_key: function () {return data.key}
      }
    });
  };
};

var KeyCtrl = function ($scope, $rootScope, $modalInstance, server, api_key) {
  $scope.server = server;
  $scope.api_key = api_key;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  
  $scope.copy_key = function () {
    var i = document.querySelector('.api_key input');
    i.setSelectionRange(0, i.value.length);
    document.execCommand('copy');
  };
};

var ConfirmCtrl = function ($scope, $rootScope, $modalInstance, message, f) {
  $scope.f = f;
  $scope.message = message;
  
  $scope.do_no = function () {
    $scope.f('no');
    $modalInstance.dismiss('no');
  };
  
  $scope.do_yes = function () {
    $scope.f('yes');
    $modalInstance.dismiss('yes');
  };
};

ndrive.controller('MenuCtrl', function($scope, $rootScope, $modal, AuthService) {
  $scope.messages = {};
  $scope.recent_files = [];
  $scope.form = {qsearch: ''};
  $scope.update = null;
  
  $scope.show_update = function ($event, details) {
    $scope.update = details;
  };
  
  $scope.do_update = function (answer) {
    if (answer == 'yes') {
      chrome.runtime.reload();
    }
  };
  
  $scope.check_update = function () {
    chrome.runtime.requestUpdateCheck(function(status) {
      if (status == "update_available") {
        $modal.open({
          templateUrl: 'modals/confirm.html',
          controller: ConfirmCtrl,
          windowClass: 'confirmModal',
          keyboard: true,
          resolve: {
            message: function () { return 'An update is available upon restarting the app.'; },
            f: function () { return $scope.do_update }
          }
        });
      }
      
      else {
        $rootScope.modal = $modal.open({
          templateUrl: 'modals/message.html',
          controller: ModalInstanceCtrl,
          windowClass: 'loadingModal messageModal',
          keyboard: true,
          resolve: {message: function () { return 'No update is available'; }}
        });
      }
    });
  };
  
  $scope.hide_right = function () {
    $rootScope.$emit('hideRightMenu');
  };
  
  $scope.add_message = function (event, id, mtype, text, timeout) {
    $scope.messages[id] = {mtype: mtype, text: text, id: md5(id)};
    apply_updates($scope);
    
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
      templateUrl: 'modals/prefs.html',
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
  
  $scope.nbeams_modal = function () {
    $modal.open({
      templateUrl: 'modals/beams.html',
      controller: NBeamsCtrl,
      windowClass: 'beamsModal',
      keyboard: true,
      size: 'lg',
      resolve: {}
    });
  };
  
  $scope.help_modal = function () {
    var version = $rootScope.manifest.version;
    
    $modal.open({
      templateUrl: 'modals/help.html',
      controller: HelpCtrl,
      windowClass: 'helpModal',
      keyboard: true,
      size: 'lg',
      resolve: {version: function () { return version; }}
    });
  };
  
  $scope.donate_modal = function () {
    $modal.open({
      templateUrl: 'modals/donate.html',
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
  
  $scope.go_to_search = function () {
    $("#quick-search input").focus().select();
  };
  
  $scope.logout = function () {
    AuthService.logout();
  };
  
  $scope.login = function () {
    AuthService.login();
  };
  
  $scope.quick_search = function ($event) {
    var opts = {
      needle: $scope.form.qsearch,
      backwards: false,
      wrap: true,
      caseSensitive: false,
      wholeWord: false,
      scope: AceSearch.ALL,
      regExp: false
    };
    
    var search = new AceSearch().set(opts);
    var range = search.find(Editor.session);
    if (range) {
      Editor.session.getSelection().setSelectionRange(range, false);
    }
  };
  
  $scope.focus_editor = function ($event) {
    Editor.focus();
    
    $event.preventDefault();
    return false;
  };
  
  $rootScope.$on('addMessage', $scope.add_message);
  $rootScope.$on('removeMessage', $scope.remove_message);
  $rootScope.$on('donateModal', $scope.donate_modal);
  $rootScope.$on('addRecent', $scope.add_recent);
  $rootScope.$on('restoreRecent', $scope.restore_recent);
  $rootScope.$on('showUpdate', $scope.show_update);
  
  $rootScope.$on('keyboard-quick-search', $scope.go_to_search);
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
