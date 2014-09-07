const boundary = '-------314159265358979323846';
const delimiter = "\r\n--" + boundary + "\r\n";
const close_delim = "\r\n--" + boundary + "--";

var Drive = {};

Drive.list_dir = function (data, callback) {
  var folderId = data.folderId;
  
  var retrievePageOfFiles = function(request, params, result) {
    request.execute(function(resp) {
      result = result.concat(resp.items);
      if (resp.nextPageToken) {
        params.pageToken = resp.nextPageToken;
        request = gapi.client.drive.files.list(params);
        retrievePageOfFiles(request, params, result);
      }
      
      else {
        callback({folderId: folderId, result: result});
      }
    });
  };
  
  var params = {
    q: "'root' in parents",
    fields: 'items(id,mimeType,labels,fileExtension,title,webViewLink,properties(key,value),alternateLink,webContentLink)'
  };
  if (folderId) {
    params.q = "'" + folderId + "' in parents";
  }
  
  var initialRequest = gapi.client.drive.files.list(params);
  retrievePageOfFiles(initialRequest, params, []);
};

Drive.open = function (data, callback) {
  var title = data.title;
  var fileId = data.fileId;
  
  var request = gapi.client.drive.files.get({fileId: fileId});
  request.execute(function (response) {
    if (response.downloadUrl) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', response.downloadUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + Neutron.OAuth.access_token);
      xhr.onload = function() {
        response.content = xhr.responseText;
        response.fileId = fileId;
        callback(response);
      };
      xhr.onerror = function() {
        callback({title: title, fileId: fileId, error: 'Error Opening: ' + title});
      };
      xhr.send();
    }
    
    else {
      callback({title: title, fileId: fileId, error: 'Can Not Open: ' + title});
    }
  });
};

Drive.save = function (data, callback) {
  var base64Data = btoa(unescape(encodeURIComponent(data.text)));
  var multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    delimiter +
    'Content-Type: ' + data.mimeType + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n' +
    '\r\n' +
    base64Data +
    close_delim;
    
  var request = gapi.client.request({
    'path': '/upload/drive/v2/files/' + data.fileId,
    'method': 'PUT',
    'params': {
      'uploadType': 'multipart',
      'alt': 'json',
      'newRevision': 'false',
      'useContentAsIndexableText': 'true'
    },
    'headers': {
      'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
    },
    'body': multipartRequestBody});
    
  request.execute(function (file) {
    if (file.error) {
      callback({error: 'Error Saving ' + data.title, fileId: data.fileId});
    }
    
    else {
      callback({fileId: data.fileId});
    }
  });
};

