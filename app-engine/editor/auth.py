import json

from django import http
from django.conf import settings
from django.contrib.auth import SESSION_KEY, BACKEND_SESSION_KEY, load_backend

from account.models import User

class requires_token:
  def __init__ (self, target):
    self.target = target
    
  def __call__ (self, *args, **kwargs):
    request = args[0]
    request.json = json.loads(request.body)
    
    if 'token' in request.json:
      session = User.get_session(request.json['token'])
      
      user = None
      try:
        user_id = session[SESSION_KEY]
        backend_path = session[BACKEND_SESSION_KEY]
        
      except KeyError:
        pass
        
      else:
        if backend_path in settings.AUTHENTICATION_BACKENDS:
          backend = load_backend(backend_path)
          user = backend.get_user(user_id)
          
      if user:
        request.user = user
        return self.target(*args, **kwargs)
        
    return http.JsonResponse({'status': 'login-required'})
    