function LocalFree (name, info, scope, pid) {
  LocalFS.call(this, name, info, scope, pid);
  
  this.cid = 'LocalFree';
}

LocalFree.prototype = Object.create(LocalFS.prototype);

LocalFree.prototype.reopen_file = function (retainer) {
  var self = this;
  
  chrome.fileSystem.restoreEntry(retainer, function (entry) {
    if (entry) {
      self.open_file(entry);
    }
  });
};

LocalFree.prototype.open_file = function (fileEntry) {
  var self = this;
  
  fileEntry.file(function (f) {
    fileEntry.path = "/" + randomString(20) + fileEntry.fullPath;
    fileEntry.retainer = chrome.fileSystem.retainEntry(fileEntry);
    fileEntry.id = self.file_id(fileEntry.path);
    
    var reader = new FileReader();
    reader.onloadend = function (e) {
      self.scope.rootScope.$emit('addTab', fileEntry, this.result, self, function (t) { t.fileEntry = fileEntry; });
    };
    
    reader.readAsText(f);
  }, function () { self.scope.rootScope.error_message('Error Opening: ' + fileEntry.name); });
};

LocalFree.prototype.do_save = function (tab, name, path, text, md5sum, mid, errorHandler) {
  var self = this;
  
  tab.fileEntry.createWriter(function(fileWriter) {
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
};
