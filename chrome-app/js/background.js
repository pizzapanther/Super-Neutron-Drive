
function launch_main_window (launchData) {
  var win = chrome.app.window.get("ndrive-main");
  if (win) {
    if (launchData && launchData.items) {
      win.contentWindow.load_local_files(launchData.items);
    }
  }
  
  else {
    var width = 1100;
    var height = 870;
    
    if (width > screen.availWidth) {
      width = screen.availWidth;
    }
    
    if (height > screen.availHeight) {
      height = screen.availHeight;
    }
    
    chrome.app.window.create('html/main.html', {
      resizable: true,
      id: "ndrive-main",
      bounds: {
        width: width,
        height: height
      }
    });
    
    if (launchData && launchData.items) {
      load_items(launchData.items);
    }
  }
}

function load_items (items) {
  var win = chrome.app.window.get("ndrive-main");
  
  if (win && win.contentWindow.load_local_files) {
    win.contentWindow.load_local_files(items);
  }
  
  else {
    setTimeout(function () { load_items(items) }, 250);
  }
}

function update_notification (details) {
  var win = chrome.app.window.get("ndrive-main");
  
  if (win && win.contentWindow.show_update) {
    win.contentWindow.show_update(details);
  }
}

chrome.app.runtime.onLaunched.addListener(launch_main_window);
chrome.runtime.onUpdateAvailable.addListener(update_notification);
