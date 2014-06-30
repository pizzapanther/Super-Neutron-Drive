var AceSearch = require('ace/search').Search;
var AceRange = require("ace/range").Range;

ndrive.controller('SearchCtrl', function($scope, $rootScope) {
  $scope.form = {
    search: '',
    replace: '',
    context: 'current',
    case_sensitive: false,
    whole_word: false,
    regex: false
  };
  
  $scope.search_context = null;
  $scope.ranges = [];
  
  $scope.searchObj = null;
  $scope.searchOptions = null;
  $scope.currentRange = null;
  $scope.tabs = '';
  
  $scope.goto = function (tab, range) {
    tab.project.open_file(tab.file, range);
  };
  
  $scope.search_prev = function () {
    $scope.search_next(true);
  };
  
  $scope.search_next = function (backwards, tabs) {
    if (!backwards) {
      backwards = false;
    }
    
    if ($scope.form.search == '') {
      $rootScope.error_message('Please fill in a search term.');
      return null;
    }
    
    if (tabs === undefined) {
      $rootScope.$emit('getSessions', $scope.form.context, backwards, $scope.search_next);
      return null;
    }
    
    var tabsid = '';
    for (var i=0; i < tabs.length; i++) {
      tabsid += tabs[i].id + tabs[i].project.cid + tabs[i].project.pid;
    }
    
    var new_search = true;
    if ($scope.searchObj) {
      var o = $scope.searchOptions;
      if ($scope.form.context == 'tabs') {
        new_search = true;
      }
      
      else if ($scope.search_context != $scope.form.context) {
        new_search = true;
      }
      
      else if ($scope.tabs != tabsid) {
        new_search = true;
      }
      
      else if (o.needle == $scope.form.search && o.backwards == backwards && o.caseSensitive == $scope.form.case_sensitive && o.wholeWord == $scope.form.whole_word && o.regExp == $scope.form.regex) {
        new_search = false;
      }
    }
    
    if (new_search) {
      $scope.searchOptions = {
        needle: $scope.form.search,
        backwards: backwards,
        wrap: true,
        caseSensitive: $scope.form.case_sensitive,
        wholeWord: $scope.form.whole_word,
        scope: AceSearch.ALL,
        regExp: $scope.form.regex
      };
      
      $scope.searchObj = new AceSearch().set($scope.searchOptions);
      $scope.search_context = $scope.form.context;
      
      $scope.ranges = [];
      $scope.tabs = '';
      
      for (var i=0; i < tabs.length; i++) {
        var ranges = $scope.searchObj.findAll(tabs[i].session);
        $scope.ranges.push({ranges: ranges, tab: tabs[i]});
        $scope.tabs = tabsid;
      }
    }
    
    if ($scope.form.context == 'current') {
      var session = tabs[0].session;
      $scope.currentRange = $scope.searchObj.find(session);
      
      if ($scope.currentRange) {
        session.getSelection().setSelectionRange($scope.currentRange, false);
      }
    }
  };
  
  $scope.replace_next = function () {
    if ($scope.currentRange) {
      var session = Editor.getSession();
      var input = session.getTextRange($scope.currentRange);
      var replacement = $scope.searchObj.replace(input, $scope.form.replace);
      if (replacement !== null) {
        $scope.currentRange.end = session.replace($scope.currentRange, replacement);
      }
    }
    
    $scope.search_next();
  };
  
  $scope.replace_all = function () {
    $scope.search_next();
    
    for (var i=0; i < $scope.ranges.length; i++) {
      var r = $scope.ranges[i];
      if (r.ranges.length > 0) {
        var selection = Editor.getSelectionRange();
        Editor.clearSelection();
        Editor.selection.moveCursorTo(0, 0);
      
        Editor.$blockScrolling += 1;
        for (var j = r.ranges.length - 1; j >= 0; --j) {
          var input = r.tab.session.getTextRange(r.ranges[j]);
          var replacement = $scope.searchObj.replace(input, $scope.form.replace);
          if (replacement !== null) {
            r.tab.session.replace(r.ranges[j], replacement);
          }
        }
          
        Editor.$blockScrolling -= 1;
        r.tab.update_hash();
      }
    }
  };
  
  $scope.go_to_search = function () {
    $("#searchToolTab").click();
    $("#search-search").focus().select();
  };
  
  $rootScope.$on('keyboard-search', $scope.go_to_search);
});
