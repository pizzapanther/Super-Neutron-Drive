ndrive.factory('BeamFactory', function ($q, $http, $rootScope, $timeout, BeamSetupService) {
  return function (beam) {
    var BeamFactory = this;
    
    BeamFactory.beam = beam;
    BeamFactory.name = beam.address + ':' + beam.port;
    BeamFactory.config = {timeout: 20000};
    BeamFactory.ekey = null;
    BeamFactory.akey = null;
    BeamFactory.user = null;
    BeamFactory.callback_args = null;
    
    BeamFactory.beam_url = function (endpoint) {
      return 'http://' + BeamFactory.beam.address + ':' + BeamFactory.beam.port + '/' + endpoint;
    };
    
    BeamFactory.encrypt = function (data) {
      data = JSON.stringify(data);
      
      var token = new fernet.Token({
        secret: BeamFactory.ekey,
        time: Date.parse(1),
        iv: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      });
      
      return token.encode(data);
    };
    
    BeamFactory.decrypt = function (data) {
      var token = new fernet.Token({
        secret: BeamFactory.ekey,
        token: data,
        ttl: 0
      });
      
      return JSON.parse(token.decode());
    };
    
    BeamFactory.prepare_data = function (data) {
      if (BeamFactory.beam.secure) {
        return BeamFactory.encrypt(data);
      }
      
      return data;
    };
    
    BeamFactory.eready = function () {
      if (BeamFactory.beam.secure) {
        if (BeamFactory.akey) {
          if (BeamFactory.ekey) {
            return true;
          }
          
          BeamFactory.callback_args = arguments;
          BeamSetupService.new_ekey(BeamFactory, BeamFactory.beam.id, BeamFactory.edone);
          
          return false;
        }
        
        BeamFactory.callback_args = arguments;
        BeamSetupService.generate_api(BeamFactory.beam.id, false, BeamFactory.adone);
        
        return false;
      }
      
      return true;
    };
    
    BeamFactory.resume = function (failed) {
      var f = BeamFactory.callback_args[0];
      var args = [];
      for (var i=1; i < BeamFactory.callback_args.length; i++) {
        args.push(BeamFactory.callback_args[i]);
      }
      
      if (failed) {
        args.push(true);
      }
      
      BeamFactory[f].apply(BeamFactory, args);
    };
    
    BeamFactory.adone = function (data) {
      if (data && data.key) {
        BeamFactory.akey = data.key;
        BeamFactory.user = data.user;
        BeamFactory.resume();
      }
      
      else {
        BeamFactory.resume(true);
      }
    };
    
    BeamFactory.erefresh = function () {
      if ($http.pendingRequests.length === 0) {
        BeamFactory.ekey = null;
      }
      
      else {
        $timeout(BeamFactory.erefresh, 500);
      }
    };
    
    BeamFactory.edone = function (data) {
      if (data && data.key) {
        BeamFactory.ekey = new fernet.Secret(data.key);
        BeamFactory.resume();
        
        $timeout(BeamFactory.erefresh, 1000 * 60 * 50);
      }
      
      else {
        BeamFactory.resume(true);
      }
    };
    
    BeamFactory.setup = function (callback) {
      var hs256 = '{"typ": "JWT", "alg": "HS256"}';
      var token = new jwt.WebToken(JSON.stringify({user: BeamFactory.user, id: BeamFactory.beam.id}), hs256);
      var signed = token.serialize(BeamFactory.akey);
      
      $http.post(BeamFactory.beam_url('setup/'), signed, BeamFactory.config).success(function (data) {
        callback(true);
      }).error(function () {
        $rootScope.error_message('Error setting up encryption: ' + BeamFactory.name);
        callback(false);
      });
    };
    
    BeamFactory.list = function (fs, entry, callback, failed_setup) {
      if (failed_setup) {
        callback(fs, entry, null);
      }
      
      else if (BeamFactory.eready('list', fs, entry, callback)) {
        var path = entry.path;
        var name = entry.name;
        
        var d = BeamFactory.prepare_data({path: path});
        $http.post(BeamFactory.beam_url('list/'), d, BeamFactory.config).success(function (data) {
          callback(fs, entry, data);
        }).error(function () {
          $rootScope.error_message('Error listing: ' + name);
          callback(fs, entry, null);
        });
      }
    };
    
    BeamFactory.file_get = function (entry, fs, callback, failed_setup) {
      if (failed_setup) {
        callback(entry, fs, null);
      }
      
      else if (BeamFactory.eready('file_get', entry, fs, callback)) {
        var d = BeamFactory.prepare_data({path: entry.path});
        $http.post(BeamFactory.beam_url('file/get/'), d, BeamFactory.config).success(function (data) {
          callback(entry, fs, data);
        }).error(function () {
          $rootScope.error_message('Error opening: ' + entry.name);
          callback(entry, fs, null);
        });
      }
    };
    
    BeamFactory.file_save = function (name, path, text, fs, pass_thru, callback, failed_setup) {
      if (failed_setup) {}
      
      else if (BeamFactory.eready('file_save', name, path, text, fs, pass_thru, callback)) {
        var utf8input = strToUTF8Arr(text);
        var base64 = base64EncArr(utf8input);
        
        var d = BeamFactory.prepare_data({path: path, base64: base64});
        $http.post(BeamFactory.beam_url('file/save/'), d, BeamFactory.config).success(function (data) {
          callback(pass_thru, fs, data);
        }).error(function () {
          pass_thru.errorHandler();
        });
      }
    };
    
    BeamFactory.file_rename = function (fs, entry, name, callback, failed_setup) {
      if (failed_setup) {}
      
      else if (BeamFactory.eready('file_rename', fs, entry, name, callback)) {
        var d = BeamFactory.prepare_data({path: entry.path, name: name});
        $http.post(BeamFactory.beam_url('file/rename/'), d, BeamFactory.config).success(function (data) {
          callback(fs, entry, data);
        }).error(function () {
          $rootScope.error_message('Error renaming: ' + entry.name);
        });
      }
    };
    
    BeamFactory.file_new = function (fs, entry, name, dir, callback, failed_setup) {
      if (failed_setup) {
        callback(fs, entry);
      }
      
      else if (BeamFactory.eready('file_new', fs, entry, name, dir, callback)) {
        var d = BeamFactory.prepare_data({path: entry.path, name: name, dir: dir});
        $http.post(BeamFactory.beam_url('file/new/'), d, BeamFactory.config).success(function (data) {
          if (BeamFactory.beam.secure) {
            data = BeamFactory.decrypt(data);
          }
          
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
      }
    };
    
    BeamFactory.file_delete = function (fs, entry, callback, failed_setup) {
      if (failed_setup) {}
      
      else if (BeamFactory.eready('file_delete', fs, entry, callback)) {
        var d = BeamFactory.prepare_data({path: entry.path});
        $http.post(BeamFactory.beam_url('file/delete/'), d, BeamFactory.config).success(function (data) {
          callback(fs, entry, data);
        }).error(function () {
          $rootScope.error_message('Error deleting: ' + entry.name);
        });
      }
    };
  };
});