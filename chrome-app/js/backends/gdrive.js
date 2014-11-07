function GDriveFS (name, info, root, scope, pid) {
  LocalFS.call(this, name, info, scope, pid);
  
  this.id = this.info;
  this.cid = 'GDriveFS';
  this.cls = "fa fa-google";
  this.outline = true;
  this.root = root;
  this.account = this.root.get_account(pid);
  this.working = false;
  this.transactions = {};
  this.pid = 'gdrive-' + pid + '-' + this.info;
  
  if (!this.account.fs) {
    this.account.fs = {};
  }
  
  this.account.fs[this.pid] = this;
}

GDriveFS.prototype = Object.create(LocalFS.prototype);

GDriveFS.prototype.postMessage = function (data) {
  var self = this;
  
  data.pid = self.pid;
  if (self.account.webview) {
    self.account.webview.contentWindow.postMessage(data, '*');
  }
  
  else {
    self.root.$emit('google-account-init', self.account, data);
  }
};

GDriveFS.prototype.has_error = function (data) {
  var self = this;
  var error = null;
  
  if (data.error) {
    error = data.error;
  }
  
  else if (data.result) {
    error = data.result;
  }
  
  if (error) {
    if (error.code)  {
      if (error.code == 401 || error.code == 403) {
        var injector = angular.element('html').injector();
        var $modal = injector.get('$modal');
        
        $modal.open({
          templateUrl: 'modals/gdrive-error.html',
          controller: GDriveErrorCtrl,
          windowClass: 'gdriveErrorModal',
          keyboard: true,
          resolve: {
            account: function () { return self.account; },
            pid: function () { return self.pid; },
          }
        });
        
        return true;
      }
    }
  }
  return false;
};

GDriveFS.prototype.list_fs = function (parentEntry, entry) {
  var self = this;
  
  //info is root folder id
  var folderId = self.info;
  if (parentEntry) {
    folderId = parentEntry.id;
    self.transactions[parentEntry.id] = parentEntry;
    parentEntry.working = true;
  }
  
  self.working = true;
  self.postMessage({task: 'list_dir', folderId: folderId});
};

GDriveFS.prototype.list_fs_callback = function (listing) {
  var self = this;
  var parentEntry = null;
  
  if (listing.folderId && self.transactions[listing.folderId]) {
    parentEntry = self.transactions[listing.folderId];
    delete self.transactions[listing.folderId];
  }
  
  else if (listing.folderId && self.info !== listing.folderId) {
    return null;
  }
  
  if (self.has_error(listing)) {
    self.collapse_listing(parentEntry);
  }
  
  else {
    self.process_entries(self, parentEntry, listing.result, [], []);
  }
};

GDriveFS.prototype.process_entries = function (self, parentEntry, entries, dirs, files) {
  var basepath = '';
  var path;
  
  if (parentEntry) {
    basepath = parentEntry.path;
  }
  
  for(var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    
    if (!entry.labels.trashed) {
      path = os.join_path(basepath, entry.title);
      
      if (entry.mimeType === 'application/vnd.google-apps.folder') {
        dirs.push({
          path: path,
          name: entry.title,
          dirs: [],
          files: [],
          state: 'closed',
          id: entry.id,
          working: false,
          parent: parentEntry,
          webViewLink: entry.webViewLink
        });
      }
      
      else {
        var link = null;
        if (parentEntry && parentEntry.webViewLink) {
          link = parentEntry.webViewLink + entry.title;
        }
        
        files.push({
          path: path,
          name: entry.title,
          id: entry.id,
          retainer: entry.id,
          working: false,
          mimeType: entry.mimeType,
          parent: parentEntry,
          webViewLink: link
        });
      }
    }
  }
  
  dirs.sort(name_sort);
  files.sort(name_sort);
  
  if (parentEntry) {
    parentEntry.dirs = dirs;
    parentEntry.files = files;
    parentEntry.state = 'open';
    parentEntry.working = false;
  }
  
  else {
    if (self.info === "") {
      dirs.unshift({
        path: "Shared-With-Me",
        name: "Shared With Me",
        dirs: [],
        files: [],
        state: 'closed',
        id: "sharedWithMe",
        working: false
      });
    }
    
    self.dirs = dirs;
    self.files = files;
    self.state = 'open';
  }
  
  self.working = false;
  self.scope.$apply();
};

GDriveFS.prototype.custom_menu = function (rtype, entry, event) {
  var self = this;
  var menu = [];
  
  if (rtype == 'dir') {
    menu.push(['Upload Files', 'cloud-upload', function ($modal) { self.upload($modal, entry); }]);
  }
  
  if (!entry.info) {
    menu.push(['Sharing', 'share-alt', function ($modal) { self.sharing($modal, entry); }]);
    
    if (rtype == 'dir') {
      if (entry.webViewLink) {
        menu.push(['Turn off Web View', 'globe', function ($modal) { self.public_viewing($modal, entry, false); }]);
      }
      
      else {
        menu.push(['Turn on Web View', 'globe', function ($modal) { self.public_viewing($modal, entry, true); }]);
      }
    }
    
    if (entry.webViewLink) {
      menu.push(['View on the Web', 'eye', null, entry.webViewLink]);
    }
  }
  
  return menu;
};

GDriveFS.prototype.sharing = function (modal, entry) {
  var self = this;
  self.transactions[entry.id] = entry;
  self.scope.rootScope.$emit('hideRightMenu');
  self.scope.rootScope.$emit('show-webview', self.account);
  self.postMessage({task: 'share', fileId: entry.id});
};

GDriveFS.prototype.open_file = function (file, range) {
  var self = this;
  
  self.scope.rootScope.$emit('addMessage', 'open-file' + file.id, 'info', 'Opening: ' + file.name, null, true);
  self.scope.rootScope.$emit('openTab', file.id, self.pid, range, function () {
    self.transactions[file.id] = {range: range, entry: file};
    self.postMessage({task: 'open', title: file.name, fileId: file.id});
  });
};


GDriveFS.prototype.open_file_callback = function (file) {
  var self = this;
  var entry = self.transactions[file.fileId].entry;
  
  self.scope.rootScope.$emit('removeMessage', 'open-file' + file.fileId);
  //todo: open range
  //todo: check transactions
  
  if (file.error) {
    if (self.has_error(file)) {}
    
    else {
      self.root.error_message(file.error);
    }
  }
  
  else {
    var range = self.transactions[file.fileId].range;
    entry.name = file.title;
    entry.mimeType = file.mimeType;
    entry.retainer = file.fileId;
    self.scope.rootScope.$emit('addTab', entry, file.content, self);
  }
  
  delete self.transactions[file.fileId];
};

GDriveFS.prototype.do_save = function (tab, name, path, text, md5sum, mid, errorHandler) {
  var self = this;
  self.transactions[tab.file.id] = {tab: tab, errorHandler: errorHandler, mid: mid, md5sum: md5sum};
  self.postMessage({
    task: 'save', text: text, title: name, fileId: tab.file.id, mimeType: tab.file.mimeType
  });
};

GDriveFS.prototype.do_save_callback = function (save) {
  var self = this;
  var t = self.transactions[save.fileId];
  delete self.transactions[save.fileId];
  
  if (save.error) {
    if (self.has_error(save)) {}
    errorHandler();
  }
  
  else {
    t.tab.saved_md5sum = t.md5sum;
    t.tab.saving = false;
    self.scope.rootScope.$emit('removeMessage', t.mid);
    t.tab.scope.$apply();
  }
};

GDriveFS.prototype.do_rename = function (entry, name) {
  var self = this;
  self.transactions[entry.id] = entry;
  self.postMessage({task: 'rename', new_name: name, fileId: entry.id});
};

GDriveFS.prototype.public_viewing = function ($modal, entry, make_public) {
  var self = this;
  self.transactions[entry.id] = entry;
  self.postMessage({task: 'webview', make_public: make_public, fileId: entry.id});
  
  self.scope.rootScope.$emit('addMessage', 'public-view', 'info', 'Setting Web View: ' + entry.name, false);
  self.scope.rootScope.$emit('hideRightMenu');
};

GDriveFS.prototype.pub_callback = function (data) {
  var self = this;
  var entry = self.transactions[data.fileId];
  delete self.transactions[data.fileId];
  
  self.scope.rootScope.$emit('removeMessage', 'public-view');
  if (self.has_error(data)) {
    entry.working = false;
  }
  
  else {
    entry.webViewLink = data.webViewLink;
    if (entry.state == 'open') {
      self.collapse_listing(entry);
      if (entry.id) {
        self.list_dir(entry);
      }
      
      else {
        self.list_dir();
      }
    }
  }
  
  apply_updates(self.scope);
};

GDriveFS.prototype.do_rm = function (entry) {
  var self = this;
  self.transactions[entry.id] = entry;
  self.postMessage({task: 'trash', fileId: entry.id});
};

GDriveFS.prototype.rename_callback = function (data) {
  var self = this;
  var entry = self.transactions[data.fileId];
  
  if (self.has_error(data)) {}
  
  else {
    entry.name = data.title;
    self.scope.rootScope.$emit('renameTab', self.pid, data.fileId, entry);
  }
  
  apply_updates(self.scope);
  delete self.transactions[data.fileId];
};

GDriveFS.prototype.trash_callback = function (data) {
  var self = this;
  var entry = self.transactions[data.fileId];
  
  if (self.has_error(data)) {}
  
  else {
    self.collapse_listing(entry.parent);
    self.list_dir(entry.parent);
  }
  apply_updates(self.scope);
  delete self.transactions[data.fileId];
};

GDriveFS.prototype.upload_new_file = function (self, name, content, index, entry, files) {
  self.transactions[entry.id] = [index, entry, files];
  
  self.postMessage({task: 'newupload', name: name, folderId: entry.id, content: content});
};

GDriveFS.prototype.newupload_callback = function (data) {
  var self = this;
  var stuff = self.transactions[data.folderId];
  delete self.transactions[data.folderId];
  
  self.upload_next(self, stuff[0], stuff[1], stuff[2]);
};

GDriveFS.prototype.save_new_file = function (entry, name, dir) {
  var self = this;
  
  self.scope.rootScope.$emit('addMessage', 'new-file', 'info', 'Creating: ' + name, null, true);
  self.transactions[entry.id] = entry;
  self.postMessage({task: 'newfile', name: name, parentId: entry.id, dir: dir});
};

GDriveFS.prototype.save_new_file_callback = function (data) {
  var self = this;
  var entry = self.transactions[data.parentId];
  delete self.transactions[data.parentId];
  
  if (data.error) {
    self.has_error(data);
    self.scope.rootScope.$emit('addMessage', 'new-file', 'error', data.error, true);
  }
  
  else {
    self.scope.rootScope.$emit('removeMessage', 'new-file');
    entry.state = 'closed';
    entry.dirs = [];
    entry.files = [];
    
    apply_updates(self.scope);
    
    if (!data.dir) {
      self.open_file({name: data.title, id: data.id, path: data.title, retainer: data.id});
    }
    
    if (entry.id) {
      self.list_dir(entry);
    }
    
    else {
      self.list_dir();
    }
  }
};

GDriveFS.prototype.reopen_file = function (retainer, name) {
  var self = this;
  var file = {path: name, name: name, id: retainer, retainer: retainer};
  self.open_file(file);
};

GDriveFS.store_projects = function (scope) {
  var drive_projects = [];
  for (var i=0; i < scope.projects.length; i++) {
    var p = scope.projects[i];
    if (p.cid == 'GDriveFS') {
      drive_projects.push({
        name: p.name,
        info: p.info,
        pid: p.pid,
        account: {
          name: p.account.name,
          id: p.account.id,
          oauth: p.account.oauth,
          email: p.account.email
        }
      });
    }
  }
  
  chrome.storage.sync.set({'drive_projects': JSON.stringify(drive_projects)}, function() {
    console.log('GDrive projects saved');
    console.log(drive_projects);
  });
};

GDriveFS.load_projects = function (scope, q) {
  var deferred = q.defer();
  
  chrome.storage.sync.get('drive_projects', function (obj) {
    GDriveFS.load_projects_callback(obj, scope, deferred);
  });
  
  return deferred.promise;
};

GDriveFS.load_projects_callback = function (obj, scope, promise) {
  if (obj && obj.drive_projects) {
    var projects = JSON.parse(obj.drive_projects);
    scope.rootScope.google_accounts = [];
    
    for (var i in projects) {
      var p = projects[i];
      var account = scope.rootScope.get_account(p.account.id);
      if (!account) {
        scope.rootScope.google_accounts.push(p.account);
      }
      
      p.account.style = {};
      p.cancel_style = {display: 'block'};
      p.account.root = '';
      scope.rootScope.$emit('webview-init', p.account.id);
    }
    
    scope.rootScope.$apply();
    for (var j in projects) {
      var pp = projects[j];
      GDriveFS.init(pp, scope);
    }
    scope.$apply();
  }
  
  promise.resolve();
};

GDriveFS.init = function (p, scope) {
  var project = new GDriveFS(p.name, p.info, scope.rootScope, scope, p.account.id);
  scope.projects.push(project);
};
