ndrive.service("BeamSetupService", function ($http, $rootScope, AuthService) {
  var BeamSetupService = this;
  
  BeamSetupService.base_url = $rootScope.server_url + '/editor/';
  BeamSetupService.callback_args = null;
  
  BeamSetupService.generate_api = function (id, regen, callback) {
    var url = BeamSetupService.base_url + "generate-api-key";
    
    if (BeamSetupService.logged_in('generate_api', id, regen, callback)) {
      $http.post(url, {id: id, token: $rootScope.neutron_account.token, regen: regen}).
      success(function (data) {
        if (data.status == 'OK') {
          callback(data);
        }
        
        else {
          BeamSetupService.force_login('generate_api', id, regen, callback);
        }
      }).
      error(function () {
        $rootScope.error_message('Error generating API key.');
      })
    }
  };
  
  BeamSetupService.force_login = function () {
    $rootScope.neutron_account.token = null;
    
    var args = [];
    for (var i=0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    BeamSetupService.logged_in.apply(BeamSetupService, args);
  };
  
  BeamSetupService.logged_in = function () {
    if ($rootScope.neutron_account.token) {
      return true;
    }
    
    BeamSetupService.callback_args = arguments;
    AuthService.login(BeamSetupService.login_callback);
    return false;
  };
  
  BeamSetupService.login_callback = function () {
    var f = BeamSetupService.callback_args[0];
    var args = [];
    for (var i=1; i < BeamSetupService.callback_args.length; i++) {
      args.push(BeamSetupService.callback_args[i]);
    }
    
    BeamSetupService[f].apply(BeamSetupService, args);
  };
  
  BeamSetupService.new_ekey = function (BeamFactory, id, callback) {
    var url = BeamSetupService.base_url + "ekey";
    
    if (BeamSetupService.logged_in('new_ekey', BeamFactory, id, callback)) {
      $http.post(url, {id: id, token: $rootScope.neutron_account.token}).
      success(function (data) {
        if (data.status == 'OK') {
          BeamFactory.setup(function (good) {
            if (good) {
              callback(data);
            }
            
            else {
              callback(null);
            }
          });
        }
        
        else {
          BeamSetupService.force_login('new_ekey', id, callback);
        }
      }).
      error(function () {
        $rootScope.error_message('Error generating encryption key.');
      });
    }
  };
});
