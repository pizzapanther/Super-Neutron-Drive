chrome.app.runtime.onLaunched.addListener(launch_main_window);

function launch_main_window () {
  var width = 1100;
  var height = 870;
  
  if (width > screen.availWidth) {
    width = screen.availWidth;
  }
  
  if (height > screen.availHeight) {
    height = screen.availHeight;
  }
  
  chrome.app.window.create('html/main.html', {
    'resizable': true,
    'bounds': {
      'width': width,
      'height': height
    }
  });
}
