function NBeamFS (name, info, root, scope, pid) {
  LocalFS.call(this, name, info, scope, pid);
  
  this.id = this.info;
  this.cid = 'NBeamFS';
  this.cls = "fa fa-cloud";
  this.outline = true;
  this.root = root;
  this.working = false;
  this.pid = pid;
  this.path = '';
  
  this.beam_service = new scope.BeamFactory(this.info);
}

NBeamFS.prototype = Object.create(LocalFS.prototype);

NBeamFS.prototype.list_fs = function (parentEntry, entry) {
  var self = this;
  
  if (!parentEntry) {
    parentEntry = self;
  }
  
  parentEntry.working = true;
  
  self.beam_service.list(self, parentEntry, self.list_fs_callback);
};

NBeamFS.prototype.list_fs_callback = function (self, entry, data) {
  entry.working = false;
  
  if (data) {
    if (self.info.secure) {
      data = self.beam_service.decrypt(data);
    }
    
    entry.dirs = [];
    entry.files = [];
    entry.state = 'open';
    
    for (var i=0; i < data.dirs.length; i++) {
      var d = data.dirs[i];
      d.dirs = [];
      d.files = [];
      d.state = 'closed';
      d.working = false;
      d.parent = entry;
      
      entry.dirs.push(d);
    }
    
    for (i=0; i < data.files.length; i++) {
      var f = data.files[i];
      f.parent = entry;
      f.retainer = f.path;
      f.working = false;
      
      entry.files.push(f);
    }
  }
};

NBeamFS.prototype.open_file = function (file, range) {
  var self = this;
  
  self.scope.rootScope.$emit('openTab', file.path, self.pid, range, function () {
    self.scope.rootScope.$emit('addMessage', 'open-file' + file.id, 'info', 'Opening: ' + file.name, null, true);
    self.beam_service.file_get(file, self, self.open_file_callback);
  });
};

NBeamFS.prototype.open_file_callback = function (file, self, data) {
  self.scope.rootScope.$emit('removeMessage', 'open-file' + file.id);
  
  if (data) {
    if (self.info.secure) {
      data = self.beam_service.decrypt(data);
    }
    
    var utf8output = base64DecToArr(data.base64);
    var content = UTF8ArrToStr(utf8output);
    
    file.id = data.id;
    self.scope.rootScope.$emit('addTab', file, content, self);
  }
};

NBeamFS.prototype.reopen_file = function (retainer, name) {
  var self = this;
  var file = {path: retainer, name: name, id: retainer, retainer: retainer};
  self.open_file(file);
};

NBeamFS.prototype.do_save = function (tab, name, path, text, md5sum, mid, errorHandler) {
  var self = this;
  
  var pass_thru = {
    tab: tab,
    md5sum: md5sum,
    mid: mid
  };
  self.beam_service.file_save(name, path, text, self, pass_thru, self.do_save_callback);
};

NBeamFS.prototype.do_save_callback = function (pass_thru, self, data) {
  if (self.info.secure) {
    data = self.beam_service.decrypt(data);
  }
  
  pass_thru.tab.saved_md5sum = pass_thru.md5sum;
  pass_thru.tab.saving = false;
  self.scope.rootScope.$emit('removeMessage', pass_thru.mid);
};

NBeamFS.prototype.do_rename = function (entry, name) {
  var self = this;
  
  self.beam_service.file_rename(self, entry, name, self.rename_callback);
};

NBeamFS.prototype.rename_callback = function (self, entry, data) {
  if (self.info.secure) {
    data = self.beam_service.decrypt(data);
  }
  
  entry.name = data.name;
  entry.path = data.path;
  self.scope.rootScope.$emit('renameTab', self.pid, entry.id, entry);
  entry.id = data.id;
};

NBeamFS.prototype.upload_new_file = function (self, name, content, index, entry, files) {
  self.beam_service.upload_file(self, name, content, index, entry, files, self.upload_file_callback);
};

NBeamFS.prototype.upload_file_callback = function (self, name, index, entry, files, data) {
  self.upload_next(self, index, entry, files);
};

NBeamFS.prototype.save_new_file = function (entry, name, dir) {
  var self = this;
  
  self.scope.rootScope.$emit('addMessage', 'new-file', 'info', 'Creating: ' + name, null, true);
  self.beam_service.file_new(self, entry, name, dir, self.save_new_file_callback);
};

NBeamFS.prototype.save_new_file_callback = function (self, entry, data) {
  self.scope.rootScope.$emit('removeMessage', 'new-file');
  
  if (data) {
    entry.state = 'closed';
    entry.dirs = [];
    entry.files = [];
    
    if (data.dir) {}
    else {
      self.open_file({name: data.name, id: data.id, path: data.path, retainer: data.path});
    }
    
    if (entry.id) {
      self.list_dir(entry);
    }
    
    else {
      self.list_dir();
    }
  }
};

NBeamFS.prototype.do_rm = function (entry) {
  var self = this;
  self.beam_service.file_delete(self, entry, self.trash_callback);
};

NBeamFS.prototype.trash_callback = function (self, entry, data) {
  if (self.info.secure) {
    data = self.beam_service.decrypt(data);
  }
  
  self.collapse_listing(entry.parent);
  self.list_dir(entry.parent);
};

NBeamFS.prototype.custom_menu = function (rtype, entry, event) {
  var self = this;
  var menu = [];
  
  if (rtype == 'dir') {
    menu.push(['Upload Files', 'cloud-upload', function ($modal) { self.upload($modal, entry); }]);
  }
  
  return menu;
};

NBeamFS.store_projects = function (scope) {
  var beam_projects = [];
  for (var i=0; i < scope.projects.length; i++) {
    var p = scope.projects[i];
    if (p.cid == 'NBeamFS') {
      beam_projects.push({name: p.name, id: p.info.id});
    }
  }
  
  chrome.storage.sync.set({'beam_projects': JSON.stringify(beam_projects)}, function() {
    console.log('Beam projects saved');
    console.log(beam_projects);
  });
};

NBeamFS.load_projects = function (scope, q) {
  var deferred = q.defer();
  
  chrome.storage.sync.get('beam_projects', function (obj) {
    NBeamFS.load_projects_callback(obj, scope, deferred);
  });
  
  return deferred.promise;
};

NBeamFS.load_projects_callback = function (obj, scope, promise) {
  if (obj && obj.beam_projects) {
    var projects = JSON.parse(obj.beam_projects);
    
    for (var i in projects) {
      var p = projects[i];
      var beam = scope.rootScope.get_beam(p.id);
      
      if (beam) {
        NBeamFS.init(p.name, beam, scope);
      }
    }
    
    apply_updates(scope);
  }
  
  promise.resolve();
};

NBeamFS.init = function (name, info, scope) {
  var project = new NBeamFS(name, info, scope.rootScope, scope, info.id);
  scope.projects.push(project);
};
