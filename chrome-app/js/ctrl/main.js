function Tab (file, project, text, session, scope) {
  this.file = file;
  this.name = file.name;
  this.path = file.path;
  this.retainer = file.retainer;
  this.id = file.id;
  this.project = project;
  this.session = session;
  this.md5sum = md5(text);
  this.saved_md5sum = this.md5sum;
  this.scope = scope;
  this.saving = false;
  
  return this;
}

Tab.prototype.position = function (index) {
  return 125 * index;
};

Tab.prototype.pid = function () {
  return this.project.pid;
};

Tab.prototype.save = function (force) {
  var changed = false;
  
  if (!this.saving) {
    if (!force) {
      if (this.saved_md5sum != this.md5sum) {
        changed = true;
      }
    }
    
    if (force || changed) {
      this.saving = true;
      this.project.save(this);
    }
  }
};

Tab.prototype.update_hash = function () {
  this.md5sum = md5(this.session.getValue());
};

ndrive.controller('MainCtrl', function($scope, $rootScope, AuthService) {
  $scope.tabs = [];
  $scope.current_tab = null;
  $scope.set_hasher = true;
  $scope.recent_files = [];
  
  $scope.bugMe = function () {
    narf();
  };
  
  $scope.hide_right = function () {
    $rootScope.$emit('hideRightMenu');
  };
  
  $scope.update_hash = function (index) {
    if ($scope.current_tab !== null) {
      $scope.tabs[$scope.current_tab].update_hash();
      apply_updates($scope);
    }
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
  
  $scope.set_session_prefs = function (session) {
    session.setTabSize(PREFS.tabsize);
    session.setUseSoftTabs(PREFS.softab);
    
    switch (PREFS.soft_wrap) {
      case "off":
        session.setUseWrapMode(false);
        break;
        
      case "free":
        session.setUseWrapMode(true);
        session.setWrapLimitRange(null, null);
        break;
        
      default:
        session.setUseWrapMode(true);
        session.setWrapLimitRange(PREFS.print_margin, PREFS.print_margin);
        break;
    }
  };
  
  $scope.set_editor_prefs = function () {
    $("#editor").css('font-size', PREFS.fontsize);
    
    var handler = null;
    if (PREFS.keybind == 'emacs') {
      handler = require("ace/keyboard/emacs").handler;
    }
    
    else if (PREFS.keybind == 'vim') {
      handler = require("ace/keyboard/vim").handler;
    }
    
    Editor.setKeyboardHandler(handler);
    Editor.setTheme("ace/theme/" + PREFS.theme);
    
    Editor.setHighlightActiveLine(PREFS.hactive);
    Editor.setHighlightSelectedWord(PREFS.hword);
    Editor.setShowInvisibles(PREFS.invisibles);
    Editor.setBehavioursEnabled(PREFS.behave);
    
    Editor.renderer.setFadeFoldWidgets(false);
    Editor.renderer.setShowGutter(PREFS.gutter);
    Editor.renderer.setShowPrintMargin(PREFS.pmargin);
    Editor.renderer.setPrintMarginColumn(PREFS.print_margin);
    
    $('body').attr("class", PREFS.theme + "-theme");
  };
  
  $scope.set_prefs = function (event, prefs) {
    for (var key in PREFS) {
      if (prefs[key] !== undefined) {
        PREFS[key] = prefs[key];
      }
    }
    
    for (var i=0; i < $scope.tabs.length; i++) {
      $scope.set_session_prefs($scope.tabs[i].session);
    }
    
    $scope.set_editor_prefs();
    
    if (event) {
      chrome.storage.sync.set({'prefs': JSON.stringify(PREFS)}, function() {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
        
        else {
          console.log('Prefs saved');
          console.log(PREFS);
        }
      });
    }
  };
  
  $scope.add_tab = function (event, file, text, project, callback) {
    var session = new EditSession(text);
    session.setUndoManager(new UndoManager());
    session.setMode("ace/mode/" + $scope.get_mode(file.name));
    
    $scope.set_session_prefs(session);
    $scope.set_editor_prefs();
    
    Editor.setSession(session);
    
    var t = new Tab(file, project, text, session, $scope);
    $scope.tabs.push(t);
    $scope.current_tab = $scope.tabs.length - 1;
    apply_updates($scope);
    
    Editor.focus();
    $scope.scroll_to($scope.tabs.length - 1);
    
    if ($scope.set_hasher) {
      Editor.on("change", $scope.update_hash);
      $scope.set_hasher = false;
    }
    
    if (callback) {
      callback(t);
    }
    
    $scope.remember_tabs();
  };
  
  $scope.remember_tabs = function () {
    var save_tabs = [];
    
    for (var i=0; i < $scope.tabs.length; i++) {
      var tab = $scope.tabs[i];
      save_tabs.push({retainer: tab.retainer, ptype: tab.project.cid, pid: tab.project.pid, name: tab.name});
    }
    
    chrome.storage.local.set({'saved_tabs': JSON.stringify(save_tabs)}, function() {
      console.log('Tabs saved');
      console.log(save_tabs);
    });
  };
  
  $scope.open_remember_tabs = function (event) {
    chrome.storage.local.get('saved_tabs', function (obj) {
      if (obj && obj.saved_tabs) {
        var saved_tabs = JSON.parse(obj.saved_tabs);
        $rootScope.$emit('loadTabs', saved_tabs);
      }
    });
  };
  
  $scope.open_tab = function (event, path, pid, range, callback) {
    for (var i=0; i < $scope.tabs.length; i++) {
      var tab = $scope.tabs[i];
      if (tab.path == path && tab.project.pid == pid) {
        $scope.switch_tab(i);
        
        if (range) {
          $scope.tabs[$scope.current_tab].session.getSelection().setSelectionRange(range, false);
        }
        return null;
      }
    }
    
    callback();
  };
  
  $scope.remove_tab = function (index) {
    var id = $scope.tabs[$scope.current_tab].id;
    var pid = $scope.tabs[$scope.current_tab].pid();
    
    var tab = $scope.tabs[index];
    $rootScope.$emit('addRecent', {retainer: tab.retainer, ptype: tab.project.cid, pid: tab.project.pid, name: tab.name});
    
    $scope.tabs[index].session.$stopWorker();
    
    //delete $scope.tabs[index].session;
    
    $scope.tabs.splice(index, 1);
    
    if ($scope.tabs.length > 0) {
      var found = false;
      for (var i=0; i < $scope.tabs.length; i++) {
        var tab = $scope.tabs[i];
        if (tab.id == id && tab.pid() == pid) {
          $scope.current_tab = i;
          found = true;
          break;
        }
      }
      
      if (!found) {
        $scope.current_tab = $scope.current_tab - 1;
        if ($scope.current_tab < 0) {
          $scope.current_tab = 0;
        }
        
        $scope.switch_tab($scope.current_tab);
      }
    }
    
    else {
      $scope.current_tab = null;
    }
    
    $scope.remember_tabs();
  };
  
  $scope.tab_up = function (index, id, pid) {
    if (index !== $scope.tabs.length - 1) {
      var current = false;
      if ($scope.tabs[$scope.current_tab].id == id && $scope.tabs[$scope.current_tab].pid() == pid) {
        current = true;
      }
      
      var p = $scope.tabs.splice(index, 1)[0];
      $scope.tabs.splice(index + 1, 0, p);
      if (index + 1 == $scope.current_tab && !current) {
        $scope.current_tab = index;
      }
      
      else if (index == $scope.current_tab && current) {
        $scope.current_tab = index + 1;
      }
      
      $scope.$apply();
      $scope.remember_tabs();
      return $scope.tabs;
    }
    
    return null;
  };
  
  $scope.tab_down = function (index, id, pid) {
    if (index !== 0) {
      var current = false;
      if ($scope.tabs[$scope.current_tab].id == id && $scope.tabs[$scope.current_tab].pid() == pid) {
        current = true;
      }
      
      var p = $scope.tabs.splice(index, 1)[0];
      $scope.tabs.splice(index - 1, 0, p);
      
      if (index - 1 == $scope.current_tab && !current) {
        $scope.current_tab = index;
      }
      
      else if (index == $scope.current_tab && current) {
        $scope.current_tab = index - 1;
      }
      
      $scope.$apply();
      $scope.remember_tabs();
      return $scope.tabs;
    }
  };
  
  $scope.switch_tab = function (index, noscroll) {
    $scope.current_tab = index;
    Editor.setSession($scope.tabs[index].session);
    Editor.focus();
    
    if (!noscroll) {
      $scope.scroll_to(index);
    }
  };
  
  $scope.scroll_to = function (index) {
    var l = $scope.tabs[index].position(index);
    $("#tabs .tab-scroll").animate({scrollLeft: l}, 500);
  };
  
  $scope.save_current = function (event) {
    $scope.tabs[$scope.current_tab].save(true);
  };
  
  $scope.save_all = function (event) {
    for (var i=0; i < $scope.tabs.length; i++) {
      $scope.tabs[i].save();
    }
  };
  
  $scope.close_tab = function (event) {
    $scope.remove_tab($scope.current_tab);
    
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  $scope.close_tab_all = function (event) {
    while ($scope.tabs.length > 0) {
      $scope.remove_tab($scope.tabs.length - 1);
    }
    
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  chrome.storage.sync.get('prefs', function (obj) {
    if (obj.prefs) {
      $scope.set_prefs(null, JSON.parse(obj.prefs));
    }
    
    apply_updates($scope);
    AuthService.login();
  });
  
  $scope.error_simulation = function  () {
    console.error('BUG!');
    barf();
  };
  
  $scope.remove_project_tabs = function (event, className, pid, callback) {
    for (var j=0; j < $scope.tabs.length; j++) {
      var t = $scope.tabs[j];
      if (t.project.cid == className && t.project.pid == pid) {
        $scope.remove_tab(j);
      }
    }
    
    callback();
  };
  
  $scope.rename_tab = function (event, pid, id, entry) {
    for (var i=0; i < $scope.tabs.length; i++) {
      var tab = $scope.tabs[i];
      if (tab.id == id && tab.project.pid == pid) {
        tab.id = entry.id;
        tab.name = entry.name;
        tab.path = entry.path;
        
        return null;
      }
    }
  };
  
  $scope.set_recent = function (event, recent_files) {
    $scope.recent_files = recent_files;
    apply_updates($scope);
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
  
  $scope.get_sessions = function (event, context, backwards, callback) {
    var tabs = $scope.tabs;
    if (context == 'current') {
      if ($scope.current_tab === null) {
        tabs = [];
      }
      
      else {
        tabs = [$scope.tabs[$scope.current_tab]];
      }
    }
    
    callback(backwards, tabs);
  };
  
  $rootScope.$emit('restoreRecent');
  
  $rootScope.$on('addTab', $scope.add_tab);
  $rootScope.$on('openTab', $scope.open_tab);
  $rootScope.$on('setPrefs', $scope.set_prefs);
  
  //from menu
  $rootScope.$on('recentFiles', $scope.set_recent);
  
  //from side ctrl
  $rootScope.$on('removeProjectTabs', $scope.remove_project_tabs);
  $rootScope.$on('renameTab', $scope.rename_tab);
  $rootScope.$on('reopenTabs', $scope.open_remember_tabs);
  
  //from side search
  $rootScope.$on('getSessions', $scope.get_sessions);
  
  $rootScope.$on('keyboard-error-sim', $scope.error_simulation);
  $rootScope.$on('keyboard-save', $scope.save_current);
  $rootScope.$on('keyboard-save-all', $scope.save_all);
  $rootScope.$on('keyboard-close-tab', $scope.close_tab);
  $rootScope.$on('keyboard-close-tabs-all', $scope.close_tab_all);
});
