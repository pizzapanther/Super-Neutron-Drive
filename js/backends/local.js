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

LocalFS.prototype.className = function () {
  return this.constructor.name;
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
        dirs.push({path: entry.fullPath, name: entry.name, dirs: [], files: [], state: 'closed', id: id});
      }
      
      else {
        files.push({path: entry.fullPath, name: entry.name, id: id, retainer: entry.fullPath});
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

LocalFS.prototype.open_file = function (file) {
  var self = this;
  
  self.scope.rootScope.$emit('openTab', file.path, self.pid, function () {
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

LocalFS.prototype.new_file = function ($modal, entry) {
  var self = this;
  
  var pmodal = $modal.open({
    templateUrl: 'modal-new-file.html',
    controller: NewFileInstanceCtrl,
    windowClass: 'newFileModal',
    keyboard: true,
    resolve: {
      entry: function () { return entry; },
      project: function () { return self; }
    }
  });
  
  pmodal.opened.then(function () {
    self.scope.rootScope.$emit('hideRightMenu');
    setTimeout(function () { $("#new-file-name").focus().select(); }, 100);
  });
};

LocalFS.prototype.rename = function ($modal, entry) {
  var self = this;
  
  var pmodal = $modal.open({
    templateUrl: 'modal-rename-file.html',
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

LocalFS.prototype.save_new_file = function (entry, name) {
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
    
    self.info.entry.getFile(path, {create: true}, function (fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function (e) {
          self.scope.rootScope.$emit('removeMessage', 'new-file');
          entry.state = 'closed';
          entry.dirs = [];
          entry.files = [];
          
          self.scope.$apply();
          self.list_dir(entry);
          self.open_file({name: name, path: path});
        };
        
        fileWriter.onerror = function (e) {
          errorHandler();
        };
        
        var blob = new Blob([''], {type: 'text/plain'});
        fileWriter.write(blob);
      }, errorHandler);
    }, errorHandler);
  });
};

LocalFS.prototype.right_menu = function (rtype, entry, event) {
  var self = this;
  var menu = [];
  
  if (rtype == 'dir') {
    menu = [
      ['New File', 'file-text', function ($modal) { self.new_file($modal, entry); }],
      
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
  
  this.scope.rootScope.$emit('showRightMenu', event, menu);
  return false;
};

LocalFS.prototype.retain = function () {
  this.pid = chrome.fileSystem.retainEntry(this.info.entry);
  
  this.scope.local_pids.push({name: this.name, pid: this.pid});
  LocalFS.store_projects(this.scope);
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
};

LocalFS.restore_local = function (i, scope, promise) {
  if (i < scope.local_pids.length) {
    try {
      chrome.fileSystem.restoreEntry(scope.local_pids[i].pid, function (saved) {
        LocalFS.init(saved, scope, i, promise);
      });
    }
    
    catch (e) {
      console.error(e);
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
    i = i + 1;
    LocalFS.restore_local(i, scope. promise);
  }
};
