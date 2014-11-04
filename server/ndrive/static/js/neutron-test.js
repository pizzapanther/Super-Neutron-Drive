var immediateAuth = false;
var Neutron = {
  gdrive_api_loaded: false,
  authorized: false,
  authorizer: null,
  OAuth: null,
  UserId: null,
  parent: null,
  origin: null,
  id: null,
  init_token: null,
  share: null
};

function start () {
          gapi.load('auth:client,drive-realtime,drive-share,picker', function () {
            Neutron.auth_init(true);
          });

}

Neutron.auth_init = function (setkey, force_slow) {
  if (setkey) {
    gapi.client.setApiKey(GOOGLE_KEY);
  }
  
  if (!Neutron.share) {
    Neutron.share = new gapi.drive.share.ShareClient(GOOGLE_APP_ID);
  }
    
  if (!Neutron.gdrive_api_loaded) {
    gapi.client.load('drive', 'v2', function () {
      Neutron.gdrive_api_loaded = true;
      Neutron.auth_init();
    });
    return 0;
  }
  
  if (Neutron.authorizer) {
    clearTimeout(Neutron.authorizer);
    Neutron.authorizer = null;
  }
  
  var options = {
    client_id: GOOGLE_CLIENT_ID,
    immediate: immediateAuth,
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.scripts'
    ]
  };
  
  if (Neutron.UserId) {
    options.user_id = Neutron.UserId;
  }
  
  if (force_slow) {
    options.immediate = false;
  }
  
  gapi.auth.authorize(options, Neutron.auth_callback);
};

Neutron.auth_callback = function (OAuth) {  
  if (OAuth && OAuth.error) {
    Neutron.auth_init(false, true);
    return null;
  }
  
  if (OAuth && OAuth.expires_in) {
    try {
      gapi.drive.realtime.setServerAddress('https://docs.google.com/otservice/');
    }
    
    catch (e) {
      setTimeout(Neutron.auth_init, 300);
      return 0;
    }
    
    Neutron.OAuth = OAuth;
    Neutron.authorizer = setTimeout(Neutron.auth_init, 60 * 25 * 1000);
    Neutron.authorized = true;
    
    oauth = {
      access_token: OAuth.access_token,
      expires_at: OAuth.expires_at
    };
    
    gapi.client.load('oauth2', 'v2', function() {
      gapi.client.oauth2.userinfo.get().execute(function (resp) {
        oauth.user_id = resp.id;
        Neutron.UserId = resp.id;
        
        var request = gapi.client.drive.about.get();
        request.execute(function (response) {
          document.querySelector("#email").innerHTML = 'Account: ' + response.user.emailAddress;
          immediateAuth = true;
        });
      });
    });
  }
};

Neutron.pick_folder = function () {
  var docsView = new google.picker.DocsView().
    setIncludeFolders(true).
    setMimeTypes('application/vnd.google-apps.folder').
    setSelectFolderEnabled(true);
  var picker = new google.picker.PickerBuilder().
    addView(docsView).
    setOAuthToken(Neutron.OAuth.access_token).
    setDeveloperKey(GOOGLE_KEY).
    setCallback(Neutron.pick_folder_callback).
    build();
  picker.setVisible(true);
};

Neutron.pick_folder_callback = function (data) {
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    var doc = data[google.picker.Response.DOCUMENTS][0];
    var id = doc[google.picker.Document.ID];
    console.log(id);
  }
  
  else if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
    console.log('cancel');
  }
};


