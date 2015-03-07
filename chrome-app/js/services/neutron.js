ndrive.service("NeutronService", function ($http, $rootScope) {
  NeutronService = this;
  NeutronService.base_url = $rootScope.server_url + '/editor/';
  
  NeutronService.get_credits = function () {
    return $http.get(NeutronService.base_url + 'credits');
  };
  
  return NeutronService;
});
