function GDriveFS (name, info, root, scope, pid) {
  LocalFS.call(this, name, info, scope, pid);
  
  this.cid = 'GDriveFS';
  this.cls = "fa fa-google";
  this.outline = true;
  this.root = root;
  this.account = this.root.get_account(pid);
  
  this.account.list_dir = this.list_fs_callback;
  this.transactions = {};
}

GDriveFS.prototype = Object.create(LocalFS.prototype);

GDriveFS.prototype.list_fs = function (parentEntry, entry) {
  var self = this;
  
  console.log(self.info);
  
  var folderId = self.info;
  if (parentEntry) {
    folderId = parentEntry.id;
  }
  
  self.transactions[parentEntry.id] = parentEntry;
  self.account.webview.contentWindow.postMessage({task: 'list-dir', id: folderId}, '*');
};

GDriveFS.prototype.list_fs_callback = function (listing) {
  console.log(listing);
};
