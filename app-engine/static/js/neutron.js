var Neutron = {
  gdrive_api_loaded: false,
  authorized: false,
  authorizer: null,
  OAuth: null,
  UserId: null,
  parent: null,
  origin: null,
  id: null
};

Neutron.auth_init = function (setkey) {
  if (setkey) {
    gapi.client.setApiKey(GOOGLE_KEY);
  }
  
  if (!Neutron.parent) {
    setTimeout(Neutron.auth_init, 300);
    return 0;
  }
  
  if (!Neutron.gdrive_api_loaded) {
    gapi.client.load('drive', 'v2', function () {
      Neutron.gdrive_api_loaded = true;
    });
  }
  
  if (Neutron.authorizer) {
    clearTimeout(Neutron.authorizer);
    Neutron.authorizer = null;
  }
  
  var options = {
    client_id: GOOGLE_CLIENT_ID,
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.scripts'
    ]
  };
  
  if (Neutron.UserId) {
    options.user_id = Neutron.UserId;
    options.immediate = true;
  }
  
  gapi.auth.authorize(options, Neutron.auth_callback);
};

Neutron.auth_callback = function (OAuth) {
  Neutron.parent.postMessage({'task': 'close-popup', id: Neutron.id}, Neutron.origin);
  console.log(OAuth);
  
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
      client_id: OAuth.client_id,
      expires_at: OAuth.expires_at
    };
    
    var request = gapi.client.drive.about.get();
    request.execute(function (response) {
      console.log(response);
      Neutron.parent.postMessage({
        task: 'token',
        oauth: oauth,
        email: response.user.emailAddress,
        id: Neutron.id
      }, Neutron.origin);
    });
  }
};

Neutron.cancel_webview = function () {
  Neutron.parent.postMessage({'task': 'cancel', id: Neutron.id}, Neutron.origin);
};

Neutron.receive_message = function (event) {
  console.log(event);
  
  if (event.data && event.data.task) {
    if (event.data.task === 'handshake') {
      Neutron.parent = event.source;
      Neutron.origin = event.origin;
      Neutron.id = event.data.id;
    }
  }
};

window.addEventListener("message", Neutron.receive_message, false);
