ndrive.directive('projectDrag', function () {
  return {
    restrict:'A',
    
    link: function (scope, element, attrs) {
      element.attr('draggable');
      element.drag("start",function (ev, dd) {
        dd.projects = [];
        dd.project = null;
        
        while (1) {
          if (element.hasClass('project')) {
            dd.project = element.data();
            dd.project.top = $(element).position().top;
            dd.project.bottom = dd.project.top + $(element).outerHeight();
            dd.project.start = $(element).position().top + $(element).find(".psort").outerHeight() / 2;
            break;
          }
          
          element = element.parent();
        }
        
        $("ul.project").each(function () {
          var p = $(this).data();
          p.top = $(this).position().top;
          p.bottom = p.top + $(this).outerHeight();
          dd.projects.push(p);
        });
      })
      .drag(function (ev, dd) {
        if (dd.project) {
          for (var i=0; i < dd.projects.length; i++) {
            var p = dd.projects[i];
            var offset = dd.project.start + dd.deltaY;
            
            if (p.type == dd.project.type && p.pid == dd.project.pid) {
              var projects = null;
              
              if (dd.deltaY > 0) {
                if (offset > p.bottom) {
                  projects = scope.project.scope.project_down(i);
                }
              }
              
              else if (dd.deltaY < 0) {
                if (offset < p.top) {
                  projects = scope.project.scope.project_up(i);
                }
              }
              
              if (projects) {
                var pid = dd.project.pid;
                var type = dd.project.type;
                
                dd.projects = [];
                var start = dd.project.start;
                dd.project = null;
                
                setTimeout(function () {
                  $("ul.project").each(function () {
                    var p = $(this).data();
                    p.top = $(this).position().top;
                    p.bottom = p.top + $(this).outerHeight();
                    dd.projects.push(p);
                    
                    if (p.pid == pid) {
                      dd.project = $(this).data();
                      dd.project.top = $(this).position().top;
                      dd.project.bottom = dd.project.top + $(this).outerHeight();
                      dd.project.start = start;
                    }
                  });
                  
                  scope.project.scope.save_projects();
                }, 100);
              }
              
              break;
            }
          }
        }
      });
    }
  };
});

ndrive.directive('tabDrag', function () {
  return {
    restrict:'A',
    
    link: function (scope, element, attrs) {
      element.attr('draggable');
      element.drag("start",function (ev, dd) {
        dd.tabs = [];
        dd.tab = null;
        
        while (1) {
          if (element.hasClass('tab')) {
            dd.tab = element.data();
            dd.tab.left = $(element).position().left;
            dd.tab.right = dd.tab.top + $(element).outerWidth();
            dd.tab.start = $(element).position().left + $(element).outerWidth() / 2;
            break;
          }
          
          element = element.parent();
        }
        
        $(".tab-scroll div.tab").each(function () {
          var p = $(this).data();
          p.left = $(this).position().left;
          p.right = p.left + $(this).outerWidth();
          dd.tabs.push(p);
        });
      })
      .drag(function (ev, dd) {
        if (dd.tab) {
          for (var i=0; i < dd.tabs.length; i++) {
            var p = dd.tabs[i];
            var offset = dd.tab.start + dd.deltaX;
            
            if (p.type == dd.tab.type && p.pid == dd.tab.pid) {
              var tabs = null;
              
              if (dd.deltaX > 0) {
                if (offset > p.right) {
                  tabs = scope.tab.scope.tab_up(i, p.pid, p.type);
                }
              }
              
              else if (dd.deltaX < 0) {
                if (offset < p.left) {
                  tabs = scope.tab.scope.tab_down(i, p.pid, p.type);
                }
              }
              
              if (tabs) {
                var pid = dd.tab.pid;
                var type = dd.tab.type;
                
                dd.tabs = [];
                var start = dd.tab.start;
                dd.tab = null;
                
                setTimeout(function () {
                  $(".tab-scroll div.tab").each(function () {
                    var p = $(this).data();
                    p.left = $(this).position().left;
                    p.right = p.left + $(this).outerWidth();
                    dd.tabs.push(p);
                    
                    if (p.pid == pid) {
                      dd.tab = $(this).data();
                      dd.tab.left = $(this).position().left;
                      dd.tab.right = dd.tab.left + $(this).outerWidth();
                      dd.tab.start = start;
                    }
                  });
                  
                  //todo: save tab order
                }, 100);
              }
              
              break;
            }
          }
        }
      });
    }
  };
});

