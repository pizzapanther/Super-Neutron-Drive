import urllib

from django import http
from django.core.urlresolvers import reverse

class login_required (object):
  def __init__ (self, target):
    self.target = target
    
  def __call__ (self, *args, **kwargs):
    request = args[0]
    if request.user.is_authenticated():
      return self.target(*args, **kwargs)
      
    path = urllib.quote(request.get_full_path())
    return http.HttpResponseRedirect(reverse('members:login') + '?cont=' + path)
    