ndrive.factory('BeamFactory', function ($q, $http, $rootScope) {
  return function (beam) {
    this.beam = beam;
    this.config = {timeout: 20000};
    
    this.beam_url = function (endpoint) {
      return 'http://' + this.beam.address + ':' + this.beam.port + '/' + endpoint;
    };
    
    this.list = function (entry, callback) {
      var self = this;
      var path = entry.path;
      var name = entry.name;
      
      $http.post(self.beam_url('list/'), {path: path}, self.config).success(function (data) {
        callback(entry, data);
      }).error(function () {
        $rootScope.error_message('Error listing: ' + name);
        callback(entry, null);
      });
    };
    
    this.file_get = function (entry, fs, callback) {
      var self = this;
      
      $http.post(self.beam_url('file/get/'), {path: entry.path}, self.config).success(function (data) {
        callback(entry, fs, data);
      }).error(function () {
        $rootScope.error_message('Error opening: ' + entry.name);
        callback(entry, fs, null);
      });
    };
    
    this.file_save = function (name, path, text, fs, pass_thru, callback) {
      var self = this;
      
      var utf8input = strToUTF8Arr(text);
      var base64 = base64EncArr(utf8input);
      
      $http.post(self.beam_url('file/save/'), {path: path, base64: base64}, self.config).success(function (data) {
        callback(pass_thru, fs, data);
      }).error(function () {
        pass_thru.errorHandler();
      });
    };
    
    this.file_rename = function (fs, entry, name, callback) {
      var self = this;
      
      $http.post(self.beam_url('file/rename/'), {path: entry.path, name: name}, self.config).success(function (data) {
        callback(fs, entry, data);
      }).error(function () {
        $rootScope.error_message('Error renaming: ' + entry.name);
      });
    };
    
    this.file_new = function (fs, entry, name, dir, callback) {
      var self = this;
      console.log(dir);
      $http.post(self.beam_url('file/new/'), {path: entry.path, name: name, dir: dir}, self.config).success(function (data) {
        if (data.status === 'OK') {
          callback(fs, entry, data);
        }
        
        else {
          $rootScope.error_message('Error creating: ' + name);
          callback(fs, entry);
        }
      }).error(function () {
        $rootScope.error_message('Error creating: ' + name);
        callback(fs, entry);
      });
    };
    
    this.file_delete = function (fs, entry, callback) {
      var self = this;
      
      $http.post(self.beam_url('file/delete/'), {path: entry.path}, self.config).success(function (data) {
        callback(fs, entry, data);
      }).error(function () {
        $rootScope.error_message('Error deleting: ' + entry.name);
      });
    };
  };
});