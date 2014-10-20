ndrive.service("AuthService", function ($http, $rootScope) {
  this.base_url = $rootScope.server_url + '/editor/';
  
  this.login = function () {
    if (PREFS.show_login) {
      var self = this;
      var webAuth = {
        url: self.base_url + "login/?app_id=" + chrome.runtime.id,
        interactive: true
      };
      
      chrome.identity.launchWebAuthFlow(webAuth, function (responseUrl) {
        if (responseUrl) {
          var parts = responseUrl.split("/");
          if (parts[3] === 'skip') {
            if (parts[4] === 'forever') {
              $rootScope.$emit('setPrefs', {show_login: false});
              apply_updates($rootScope);
            }
          }
          
          else if (parts[3] === 'token') {
            $rootScope.neutron_account.token = parts[4];
            apply_updates($rootScope);
            $rootScope.$emit('loggedIn');
          }
        }
        
        else {
          $rootScope.error_message('Error logging in.');
        }
      });
    }
  };
  
  this.logout = function () {
    var self = this;
    var url = self.base_url + "logout/" + $rootScope.neutron_account.token;
    $rootScope.$emit('addMessage', 'logging-out', 'info', 'Logging Out', null);
    
    $http.get(url).
    success(function () {
      $rootScope.neutron_account.token = null;
      $rootScope.$emit('loggedOut');
    }).
    error(function () {
      $rootScope.error_message('Error logging out.');
    }).
    then(function () {
      $rootScope.$emit('removeMessage', 'logging-out');
    });
  };
});
