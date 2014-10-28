import datetime

from django import http
from django.utils import timezone
from django.conf import settings
from django.template.response import TemplateResponse
from django.views.decorators.csrf import requires_csrf_token, csrf_exempt
from django.contrib.auth import login, logout

from .forms import LoginForm
from .auth import requires_token
from .models import BeamApiKey, EKey

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
  
@csrf_exempt
@requires_token
def gen_api_key (request):
  bkey = BeamApiKey.get_or_create(request.user, request.json['id'])
  if 'regen' in request.json and request.json['regen']:
    bkey.regen()
    
  return http.JsonResponse({'status': 'OK', 'key': bkey.akey, 'user': bkey.user.username})
  
@csrf_exempt
@requires_token
def ekey (request):
  e = EKey.create(request.user, request.json['id'])
  return http.JsonResponse({'status': 'OK', 'key': e.ekey})
  
@csrf_exempt
def get_ekey (request):
  beam = request.POST.get('beam', '')
  akey = request.POST.get('akey', '')
  
  old = timezone.now() - datetime.timedelta(minutes=3)
  
  try:
    api = BeamApiKey.objects.get(beam=beam, akey=akey)
    
  except BeamApiKey.DoesNotExist:
    raise http.Http404
    
  try:
    e = EKey.objects.filter(user=api.user, beam=beam, created__gt=old).latest()
    
  except EKey.DoesNotExist:
    raise http.Http404
    
  key = e.ekey
  e.delete()
  
  return http.JsonResponse({'result': 'OK', 'key': key})
  