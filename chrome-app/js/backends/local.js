function LocalFS (name, info, scope, pid) {
  this.name = name;
  this.info = info;
  this.dirs = [];
  this.files = [];
  this.state = 'closed';
  this.scope = scope;
  this.cls = "fa fa-floppy-o";
  this.pid = pid;
  this.open = [];
  this.cid = 'LocalFS';
}

LocalFS.prototype.file_id = function (path) {
  var id = this.cid + '-' + this.pid + '-' + path;
  id = md5(id);
  
  return id;
};

LocalFS.prototype.list_dir = function (parentEntry, entry) {
  var self = this;
  
  var state = self.state;
  if (parentEntry) {
    state = parentEntry.state;
  }
  
  if (state == 'open') {
    if (parentEntry) {
      parentEntry.state = 'closed';
      parentEntry.dirs = [];
      parentEntry.files = [];
    }
    
    else {
      self.state = 'closed';
      self.dirs = [];
      self.files = [];
    }
    
    return null;
  }
  
  return self.list_fs(parentEntry, entry);
};

LocalFS.prototype.list_fs = function (parentEntry, entry) {
  var self = this;
  var dirReader = null;
  if (parentEntry) {
    if (entry) {
      dirReader = entry.createReader();
    }
    
    else {
      self.info.entry.getDirectory(parentEntry.path, {create: false}, function (dirEntry) {
        self.list_dir(parentEntry, dirEntry);
      }, function (dirError) {
        console.error('Error: ' + parentEntry.path + ' ' + dirError);
      });
      
      return null;
    }
  }
  
  else {
    dirReader = self.info.entry.createReader();
  }
  
  var dirs = [];
  var files = [];
  dirReader.readEntries(function (entries) {
    self.process_entries(self, dirReader, parentEntry, entries, dirs, files);
  });
};

LocalFS.prototype.reopen_file = function (retainer) {
  var self = this;
  
  var id = self.file_id(retainer);
  var file = {path: retainer, name: os.basename(retainer), id: id, retainer: retainer};
  self.open_file(file);
};

LocalFS.prototype.process_entries = function (self, dirReader, parentEntry, entries, dirs, files) {
  if (entries.length > 0) {
    for(var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var id = self.file_id(entry.fullPath);
      
      if (entry.isDirectory) {
        dirs.push({
          path: entry.fullPath,
          name: entry.name,
          dirs: [],
          files: [],
          state: 'closed',
          id: id,
          parent: parentEntry
        });
      }
      
      else {
        files.push({
          path: entry.fullPath,
          name: entry.name,
          id: id,
          retainer: entry.fullPath,
          parent: parentEntry
        });
      }
    }
    
    dirReader.readEntries(function (entries) {
      self.process_entries(self, dirReader, parentEntry, entries, dirs, files);
    });
  }
  
  else {
    dirs.sort(name_sort);
    files.sort(name_sort);
    
    if (parentEntry) {
      parentEntry.dirs = dirs;
      parentEntry.files = files;
      parentEntry.state = 'open';
    }
    
    else {
      self.dirs = dirs;
      self.files = files;
      self.state = 'open';
    }
    
    self.scope.$apply();
  }
};

LocalFS.prototype.open_file = function (file, range) {
  var self = this;
  
  self.scope.rootScope.$emit('openTab', file.path, self.pid, range, function () {
    self.info.entry.getFile(file.path, {}, function(fileEntry) {
      fileEntry.file(function (f) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          self.scope.rootScope.$emit('addTab', file, this.result, self);
        };
        
        reader.readAsText(f);
      }, function () { self.scope.rootScope.error_message('Error Opening: ' + file.name); });
    }, function () { self.scope.rootScope.error_message('Error Opening: ' + file.name); });
  });
};

LocalFS.prototype.new_file = function ($modal, entry, dir) {
  var self = this;
  
  var pmodal = $modal.open({
    templateUrl: 'modals/new-file.html',
    controller: NewFileInstanceCtrl,
    windowClass: 'newFileModal',
    keyboard: true,
    resolve: {
      dir: function () { return dir; },
      entry: function () { return entry; },
      project: function () { return self; }
    }
  });
  
  pmodal.opened.then(function () {
    self.scope.rootScope.$emit('hideRightMenu');
    setTimeout(function () { $("#new-file-name").focus().select(); }, 100);
  });
};

LocalFS.prototype.upload = function ($modal, entry) {
  var self = this;
  
  $modal.open({
    templateUrl: 'modals/upload.html',
    controller: UploadCtrl,
    windowClass: 'uploadModal',
    keyboard: true,
    resolve: {
      entry: function () { return entry; },
      project: function () { return self; }
    }
  });
  
  self.scope.rootScope.$emit('hideRightMenu');
};

LocalFS.prototype.do_upload = function (self, entry, files) {
  $modal = angular.injector(["ng", "ui.bootstrap"]).get('$modal');
  self.upload_file(self, 0, entry, files);
};

LocalFS.prototype.upload_next = function (self, index, entry, files) {
  index += 1;
  if (self.uploading) {
    self.uploading.close('done');
  }
  
  if (index >= files.length) {
    delete self.uploading;
    
    self.collapse_listing(entry);
    self.list_dir(entry);
  }
  
  else {
    self.upload_file(self, index, entry, files);
  }
};

LocalFS.prototype.upload_file = function (self, index, entry, files) {
  files[index].file(
    function (f) {
      var reader = new FileReader();
      reader.onloadend = function (e) {
        self.uploading = $modal.open({
          templateUrl: 'modals/uploading.html',
          controller: UploadingCtrl,
          windowClass: 'uploadModal',
          keyboard: false,
          resolve: {
            entry: function () { return entry; },
            name: function () { return files[index].name; }
          }
        });
        
        self.upload_new_file(self, files[index].name, this.result, index, entry, files);
      };
      
      reader.readAsBinaryString(f);
    },
    
    function () {
      self.upload_next(self, files.length, entry, files);
      self.scope.rootScope.error_message('Error Reading: ' + file.name);
    }
  );
};

LocalFS.prototype.rename = function ($modal, entry) {
  var self = this;
  
  var pmodal = $modal.open({
    templateUrl: 'modals/rename-file.html',
    controller: RenameFileInstanceCtrl,
    windowClass: 'renameFileModal',
    keyboard: true,
    resolve: {
      entry: function () { return entry; },
      project: function () { return self; }
    }
  });
  
  pmodal.opened.then(function () {
    self.scope.rootScope.$emit('hideRightMenu');
    setTimeout(function () { $("#rename-file-name").focus().select(); }, 100);
  });
};

LocalFS.prototype.rm = function ($modal, entry) {
  var self = this;
  
  var pmodal = $modal.open({
    templateUrl: 'modals/remove-confirm.html',
    controller: RemoveConfirmCtrl,
    windowClass: 'removeConfirmModal',
    keyboard: true,
    resolve: {
      entry: function () { return entry; },
      project: function () { return self; }
    }
  });
  
  pmodal.opened.then(function () {
    self.scope.rootScope.$emit('hideRightMenu');
  });
};

LocalFS.prototype.collapse_listing = function (entry) {
  if (!entry) {
    entry = this;
  }
  
  entry.working = false;
  entry.state = 'closed';
  entry.dirs = [];
  entry.files = [];
};

LocalFS.prototype.do_rename = function (entry, name) {
  var self = this;
  var parent = os.dirname(entry.path);
  
  var error_function = function () {
    self.scope.rootScope.error_message('Error Renaming: ' + entry.name);
  };
  
  self.info.entry.getDirectory(parent, {create: false}, function (parentEntry) {
    if (entry.state) {
      parentEntry.getDirectory(entry.name, {create: false}, function (dirEntry) {
        dirEntry.moveTo(parentEntry, name);
        entry.name = name;
        entry.path = os.join_path(parent, name);
        entry.id = self.file_id(entry.path);
        
        if (entry.state == 'open') {
          entry.state = 'closed';
          entry.dirs = [];
          entry.files = [];
          self.list_dir(entry);
        }
        
        self.scope.$apply();
        
      }, function (dirError) {
        error_function();
      });
    }
    
    else {
      parentEntry.getFile(entry.name, {create: false}, function (fileEntry) {
        fileEntry.moveTo(parentEntry, name);
        var old_id = entry.id;
        entry.name = name;
        entry.path = os.join_path(parent, name);
        entry.id = self.file_id(entry.path);
        
        self.scope.rootScope.$emit('renameTab', self.pid, old_id, entry);
        self.scope.$apply();
      }, function (dirError) {
        error_function();
      });
    }
  }, function (parentError) {
    error_function();
  });
};

LocalFS.prototype.do_rm = function (entry) {
  var parent = os.dirname(entry.path);
  var self = this;
  
  var error_function = function () {
    self.scope.rootScope.error_message('Error Removing: ' + entry.path);
  };
  
  if (entry.state) {
    self.info.entry.getDirectory(entry.path, {create: false}, function (dirEntry) {
      dirEntry.removeRecursively(function () {
        self.collapse_listing(entry.parent);
        self.list_dir(entry.parent);
        apply_updates(self.scope);
      }, error_function);
    }, function (dirError) {
      error_function();
    });
  }
  
  else {
    self.info.entry.getFile(entry.path, {create: false}, function (fileEntry) {
      fileEntry.remove(function () {
        self.collapse_listing(entry.parent);
        self.list_dir(entry.parent);
        apply_updates(self.scope);
      }, error_function);
    }, function (dirError) {
      error_function();
    });
  }
};

LocalFS.prototype.save_new_file = function (entry, name, dir) {
  var self = this;
  var path = '';
  if (entry.path) {
    path = os.join_path(entry.path, name);
  }
  
  else {
    path = os.join_path(self.info.entry.fullPath, name);
  }
  
  self.info.entry.getFile(path, {create: false}, function (fileEntry) {
    self.scope.rootScope.error_message(name + ' already exists!');
  }, function () {
    self.scope.rootScope.$emit('addMessage', 'new-file', 'info', 'Creating: ' + name, null, true);
    var errorHandler = function () {
      self.scope.rootScope.$emit('addMessage', 'new-file', 'error', 'Error Creating: ' + name, true);
    };
    
    if (dir) {
      self.info.entry.getDirectory(path, {create: true}, function (fileEntry) {
        self.scope.rootScope.$emit('removeMessage', 'new-file');
        entry.state = 'closed';
        entry.dirs = [];
        entry.files = [];
        
        apply_updates(self.scope);
        self.list_dir(entry);
      }, errorHandler);
    }
    
    else {
      self.info.entry.getFile(path, {create: true}, function (fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function (e) {
            self.scope.rootScope.$emit('removeMessage', 'new-file');
            entry.state = 'closed';
            entry.dirs = [];
            entry.files = [];
            
            apply_updates(self.scope);
            self.list_dir(entry);
            self.open_file({name: name, path: path, retainer: path});
          };
          
          fileWriter.onerror = function (e) {
            errorHandler();
          };
          
          var blob = new Blob([''], {type: 'text/plain'});
          fileWriter.write(blob);
        }, errorHandler);
      }, errorHandler);
    }
  });
};

LocalFS.prototype.custom_menu = function (rtype, entry, event) {
  return null;
};

LocalFS.prototype.right_menu = function (rtype, entry, event) {
  var self = this;
  var menu = [];
  
  if (rtype == 'dir') {
    menu = [
      ['New File', 'file-text', function ($modal) { self.new_file($modal, entry, false); }],
      ['New Directory', 'folder', function ($modal) { self.new_file($modal, entry, true); }],
      //'-'
    ];
    
    if (!entry.info) {
      menu.push(['Rename', 'pencil-square-o', function ($modal) { self.rename($modal, entry); }]);
    }
  }
  
  else {
    menu = [
      ['Rename', 'pencil-square-o', function ($modal) { self.rename($modal, entry); }],
      //'-'
    ];
  }
  
  var cmenu = self.custom_menu(rtype, entry, event)
  if (cmenu && cmenu.length > 0) {
    menu.push('-');
    for (var c=0; c < cmenu.length; c++) {
      menu.push(cmenu[c]);
    }
  }
  
  if (!entry.cid) {
    menu.push(
      '-',
      ['Delete', 'trash-o', function ($modal) { self.rm($modal, entry); }]
    );
  }
  
  this.scope.rootScope.$emit('showRightMenu', event, menu);
  return false;
};

LocalFS.prototype.retain = function () {
  this.pid = chrome.fileSystem.retainEntry(this.info.entry);
};

LocalFS.prototype.save = function (tab) {
  var self = this;
  var name = tab.name;
  var path = tab.path;
  var text = tab.session.getValue();
  var md5sum = md5(text);
  var mid = self.pid + md5(path);
  
  self.scope.rootScope.$emit('addMessage', mid, 'info', 'Saving: ' + name);
  var errorHandler = function () {
    self.scope.rootScope.$emit('addMessage', mid, 'error', 'Error Saving: ' + name, true);
    tab.saving = false;
    tab.scope.$apply();
  };
  
  self.do_save(tab, name, path, text, md5sum, mid, errorHandler);
};

LocalFS.prototype.do_save = function (tab, name, path, text, md5sum, mid, errorHandler) {
  var self = this;
  
  self.info.entry.getFile(path, {create: true}, function (fileEntry) {
    fileEntry.createWriter(function(fileWriter) {
      var truncated = false;
      
      fileWriter.onwriteend = function (e) {
        if (!truncated) {
          truncated = true;
          this.truncate(this.position);
          return;
        }
        
        tab.saved_md5sum = md5sum;
        tab.saving = false;
        self.scope.rootScope.$emit('removeMessage', mid);
        tab.scope.$apply();
      };
      
      fileWriter.onerror = function (e) {
        errorHandler();
      };
      
      var blob = new Blob([text], {type: 'text/plain'});
      fileWriter.write(blob);
    }, errorHandler);
  }, errorHandler);
};

LocalFS.store_projects = function (scope) {
  var local_pids = [];
  for (var i=0; i < scope.projects.length; i++) {
    var p = scope.projects[i];
    if (p.cid == 'LocalFS') {
      local_pids.push({name: p.name, pid: p.pid});
    }
  }
  
  scope.local_pids = local_pids;
  chrome.storage.local.set({'local_pids': JSON.stringify(scope.local_pids)}, function() {
    console.log('Local projects saved');
    console.log(scope.local_pids);
  });
};

LocalFS.load_projects = function (scope, q) {
  var deferred = q.defer();
  
  chrome.storage.local.get('local_pids', function (obj) {
    LocalFS.load_projects_callback(obj, scope, deferred);
  });
  
  return deferred.promise;
};

LocalFS.load_projects_callback = function (obj, scope, promise) {
  if (obj && obj.local_pids) {
    scope.local_pids = JSON.parse(obj.local_pids);
    scope.$apply();
    
    if (scope.local_pids.length > 0) {
      LocalFS.restore_local(0, scope, promise);
    }
    
    else {
      promise.resolve();
    }
  }
  
  else {
    promise.resolve();
  }
};

LocalFS.restore_local = function (i, scope, promise) {
  if (i < scope.local_pids.length) {
    try {
      chrome.fileSystem.restoreEntry(scope.local_pids[i].pid, function (saved) {
        LocalFS.init(saved, scope, i, promise);
      });
    }
    
    catch (e) {
      scope.bad_project(scope.local_pids[i].pid);
      i = i + 1;
      LocalFS.restore_local(i, scope, promise);
    }
  }
  
  else {
    promise.resolve();
  }
};


LocalFS.init = function (entry, scope, i, promise) {
  if (entry) {
    var local_dir = {entry: entry};
    
    chrome.fileSystem.getDisplayPath(entry, function (path) {
      local_dir.path = path;
      
      var p = new LocalFS(scope.local_pids[i].name, local_dir, scope, scope.local_pids[i].pid);
      scope.projects.push(p);
      scope.$apply();
      
      i = i + 1;
      LocalFS.restore_local(i, scope, promise);
    });
  }
  
  else {
    scope.bad_project(scope.local_pids[i].pid);
    i = i + 1;
    LocalFS.restore_local(i, scope, promise);
  }
};
