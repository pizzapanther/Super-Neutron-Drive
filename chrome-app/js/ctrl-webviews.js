ndrive.controller('WebViewCtrl', function($scope, $rootScope) {
  $scope.google_accounts = $rootScope.google_accounts;
  $scope.get_account = $rootScope.get_account;
  
  $scope.add_account = function (event) {
    var id = null;
    var found;
    
    while (1) {
      id = Math.floor((Math.random() * 1000000) + 1);
      found = false;
      
      for (var i=0; i < $rootScope.google_accounts.length; i++) {
        if ($rootScope.google_accounts[i].id == id) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        break;
      }
    }
    
    $rootScope.google_accounts.push({name: 'Retrieving ...', id: id, style: {}});
    
    setTimeout(function () {
      var webview = document.querySelector("#webview" + id);
      webview.src = $rootScope.server_url + "/view-" + id;
      webview.addEventListener('newwindow', $scope.handle_popup);
      webview.addEventListener("loadstop", function (event) {
        window.addEventListener("message", $scope.receive_message, false);
        
        webview.contentWindow.postMessage({task: 'handshake', id: id}, '*');
      });
    }, 50);
  };
  
  $scope.handle_popup = function (event) {
    event.preventDefault();
    
    chrome.app.window.create('html/popup.html', {id: "popup", bounds: {width: 600, height: 600}},
      function(newwindow) {
        newwindow.contentWindow.onload = function(e) { 
          var newwebview = newwindow.contentWindow.document.querySelector("webview");
          event.window.attach(newwebview);
        }   
    });
  };
  
  $scope.receive_message = function (event) {
    if (event.origin === $rootScope.server_url) {
      if (event.data && event.data.task) {
        if (event.data.task === 'close-popup') {
          var p = chrome.app.window.get('popup');
          if (p) {
            p.close();
          }
        }
        
        else if (event.data.task === 'cancel') {
          console.log('cancel');
        }
        
        else if (event.data.task === 'token') {
          var account = $scope.get_account(event.data.id);
          account.oauth = event.data.oauth;
          account.email = event.data.email;
          account.name = account.email;
          $scope.hide_webview(account);
          apply_updates($scope);
          apply_updates($rootScope);
          
          $rootScope.$emit('google-added', account.id);
        }
        console.log('main window');
        console.log(event);
      }
    }
  };
  
  $scope.hide_webview = function (account) {
    account.style = {'z-index': '-2000', 'visibility': 'hidden'};
  };
  
  $rootScope.$on('add-google-account', $scope.add_account);
});
