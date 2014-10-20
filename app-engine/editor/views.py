from django import http
from django.conf import settings
from django.template.response import TemplateResponse
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth import login, logout

from .forms import LoginForm
from account.models import User

@requires_csrf_token
def login_view (request):
  initial = {'app_id': request.REQUEST.get('app_id', settings.CHROME_ID)}
  
  skip = request.GET.get('skip', '')
  if skip in ('1', 'forever'):
    return http.HttpResponseRedirect(
      'https://{}.chromiumapp.org/skip/{}'.format(initial['app_id'], skip)
    )
    
  if request.user.is_authenticated() and request.user.is_active:
    token = request.user.chrome_token(request.session)
    return http.HttpResponseRedirect(
      'https://{}.chromiumapp.org/token/{}'.format(initial['app_id'], token)
    )
    
  form = LoginForm(request.POST or None, initial=initial)
  if request.POST:
    if form.is_valid():
      login(request, form.cleaned_data['user'])
      token = request.user.chrome_token(request.session)
      return http.HttpResponseRedirect(
        'https://{}.chromiumapp.org/token/{}'.format(initial['app_id'], token)
      )
      
  context = {
    'form': form,
    'target': '_blank',
  }
  return TemplateResponse(request, 'editor/login.html', context)
  
def logout_view (request, token):
  try:
    session = User.get_session(token)
    
  except:
    raise http.Http404
    
  else:
    session.flush()
    
  return http.JsonResponse({'result': 'OK'})
  