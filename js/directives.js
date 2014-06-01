ndrive.directive('draggable', function () {
  return {
    restrict:'A',
    
    link: function (scope, element, attrs) {
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
