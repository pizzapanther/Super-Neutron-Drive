ndrive.service("ErrorService", function ($http, $rootScope) {
  this.url = $rootScope.server_url + '/editor/error';
  
  this.report_error = function (error, data) {
    var post_data = {
      error: JSON.stringify(error),
      data: JSON.stringify(data),
      apikey: 'errors-are-a-bitch',
      username: $rootScope.neutron_account.username
    };
    
    $http.post(this.url, post_data);
  };
});
