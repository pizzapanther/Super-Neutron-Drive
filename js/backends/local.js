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
  
  return this;
}

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
  
  dirReader.readEntries(function (entries) {
    var dirs = [];
    var files = [];
    
    for(var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var id = 'LocalFS-' + self.pid + '-' + entry.fullPath;
      id = md5(id);
      
      if (entry.isDirectory) {
        dirs.push({path: entry.fullPath, name: entry.name, dirs: [], files: [], state: 'closed', id: id});
      }
      
      else {
        files.push({path: entry.fullPath, name: entry.name, dirs: [], files: [], state: 'closed', id: id});
      }
    }
    
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
  });
};

LocalFS.prototype.open_file = function (file) {
  var self = this;
  
  self.info.entry.getFile(file.path, {}, function(fileEntry) {
    fileEntry.file(function (f) {
      var reader = new FileReader();
      reader.onloadend = function (e) {
        self.scope.rootScope.$emit('addTab', file, this.result, self);
      };
      
      reader.readAsText(f);
    }, function () { self.scope.rootScope.error_message('Error Opening: ' + file.name); });
  }, function () { self.scope.rootScope.error_message('Error Opening: ' + file.name); });
};

LocalFS.prototype.retain = function () {
  this.pid = chrome.fileSystem.retainEntry(this.info.entry);
  
  this.scope.local_pids.push({name: this.name, pid: this.pid});
  LocalFS.store_projects(this.scope);
};

LocalFS.store_projects = function (scope) {
  chrome.storage.local.set({'local_pids': JSON.stringify(scope.local_pids)}, function() {
    console.log('Local projects saved');
    console.log(scope.local_pids);
  });
};

LocalFS.load_projects = function (scope) {
  chrome.storage.local.get('local_pids', function (obj) { LocalFS.load_projects_callback(obj, scope); });
};

LocalFS.load_projects_callback = function (obj, scope) {
  if (obj && obj.local_pids) {
    scope.local_pids = JSON.parse(obj.local_pids);
    
    if (scope.local_pids.length > 0) {
      LocalFS.restore_local(0, scope);
    }
    
    scope.$apply();
  }
};

LocalFS.restore_local = function (i, scope) {
  if (i < scope.local_pids.length) {
    try {
      chrome.fileSystem.restoreEntry(scope.local_pids[i].pid, function (saved) {
        LocalFS.init(saved, scope, i);
      });
    }
    
    catch (e) {
      console.error(e);
      i = i + 1;
      LocalFS.restore_local(i, scope);
    }
  }
};


LocalFS.init = function (entry, scope, i) {
  if (entry) {
    var local_dir = {entry: entry};
    
    chrome.fileSystem.getDisplayPath(entry, function (path) {
      local_dir.path = path;
      
      var p = new LocalFS(scope.local_pids[i].name, local_dir, scope, scope.local_pids[i].pid);
      scope.projects.push(p);
      scope.$apply();
      
      i = i + 1;
      LocalFS.restore_local(i, scope);
    });
  }
  
  else {
    i = i + 1;
    LocalFS.restore_local(i, scope);
  }
};
