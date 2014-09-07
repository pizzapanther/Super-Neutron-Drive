function GDriveFS (name, info, root, scope, pid) {
  LocalFS.call(this, name, info, scope, pid);
  
  this.cid = 'GDriveFS';
  this.cls = "fa fa-google";
  this.outline = true;
  this.root = root;
  this.account = this.root.get_account(pid);
  this.working = false;
  this.account.fs = this;
  this.transactions = {};
  this.pid = 'gdrive-' + pid;
}

GDriveFS.prototype = Object.create(LocalFS.prototype);

GDriveFS.prototype.list_fs = function (parentEntry, entry) {
  var self = this;
  
  var folderId = self.info;
  if (parentEntry) {
    folderId = parentEntry.id;
    self.transactions[parentEntry.id] = parentEntry;
    parentEntry.working = true;
  }
  
  self.working = true;
  self.account.webview.contentWindow.postMessage({task: 'list_dir', folderId: folderId}, '*');
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
  
  self.process_entries(self, parentEntry, listing.result, [], []);
};

GDriveFS.prototype.process_entries = function (self, parentEntry, entries, dirs, files) {
  var basepath = '';
  if (parentEntry) {
    basepath = parentEntry.path;
  }
  
  for(var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!entry.labels.trashed) {
      var path = os.join_path(basepath, entry.title);
      
      if (entry.mimeType === 'application/vnd.google-apps.folder') {
        dirs.push({
          path: path,
          name: entry.title,
          dirs: [],
          files: [],
          state: 'closed',
          id: entry.id,
          working: false
        });
      }
      
      else {
        files.push({
          path: path,
          name: entry.title,
          id: entry.id,
          retainer: entry.id,
          working: false,
          mimeType: entry.mimeType
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
    self.dirs = dirs;
    self.files = files;
    self.state = 'open';
  }
  
  self.working = false;
  self.scope.$apply();
};

GDriveFS.prototype.open_file = function (file, range) {
  var self = this;
  
  self.scope.rootScope.$emit('openTab', file.id, self.pid, range, function () {
    self.transactions[file.id] = {range: range, entry: file};
    self.account.webview.contentWindow.postMessage({task: 'open', title: file.name, fileId: file.id}, '*');
  });
};


GDriveFS.prototype.open_file_callback = function (file) {
  var self = this;
  var range = self.transactions[file.fileId].range;
  var entry = self.transactions[file.fileId].entry;
  entry.name = file.title;
  entry.mimeType = file.mimeType;
  entry.retainer = file.id;
  
  //todo: open range
  //todo: check transactions
  delete self.transactions[file.fileId];
  
  if (file.error) {
    root.error_message(file.error);
  }
  
  else {
    self.scope.rootScope.$emit('addTab', entry, file.content, self);
  }
};

GDriveFS.prototype.do_save = function (tab, name, path, text, md5sum, mid, errorHandler) {
  var self = this;
  self.transactions[tab.file.id] = {tab: tab, errorHandler: errorHandler, mid: mid, md5sum: md5sum};
  self.account.webview.contentWindow.postMessage({
    task: 'save', text: text, title: name, fileId: tab.file.id, mimeType: tab.file.mimeType
  }, '*');
};

GDriveFS.prototype.do_save_callback = function (save) {
  var self = this;
  var t = self.transactions[save.fileId];
  delete self.transactions[save.fileId];
  
  if (save.error) {
    errorHandler();
  }
  
  else {
    t.tab.saved_md5sum = t.md5sum;
    t.tab.saving = false;
    self.scope.rootScope.$emit('removeMessage', t.mid);
    t.tab.scope.$apply();
  }
};
