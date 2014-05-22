var ndrive = angular.module('ndrive', []);

ndrive.run(function ($rootScope) {
  $rootScope.manifest = chrome.runtime.getManifest();
  
  $rootScope.load_editor = function () {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/textmate");
    editor.getSession().setMode("ace/mode/javascript");
  };
});
