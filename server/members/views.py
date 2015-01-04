import datetime

from django import http
from django.conf import settings
from django.template.response import TemplateResponse
from django.contrib.auth import authenticate, login
from django.core.urlresolvers import reverse
from django.utils import timezone

from account.models import Subscription, SUBSCRIPTIONS
from account.auth import login_required
from editor.forms import LoginForm
from members.forms import NameForm

import stripe
stripe.api_key = settings.STRIPE_SECRET

def members_home (request):
  subs = None
  if request.user.is_authenticated():
    subs = request.user.subscription()
    
  context = {
    'subscriptions': SUBSCRIPTIONS,
    'subscription': subs
  }
  return TemplateResponse(request, 'members/home.html', context)
  
def members_login (request):
  cont = request.GET.get('cont', '')
  init = {'app_id': 'none'}
  if cont:
    init['cont'] = cont
    
  form = LoginForm(request.POST or None, initial=init)
  if request.POST:
    if form.is_valid():
      login(request, form.cleaned_data['user'])
      return http.HttpResponseRedirect(form.cleaned_data['cont'])
      
  context = {
    'form': form,
  }
  return TemplateResponse(request, 'members/login.html', context)
  
@login_required
def purchase (request, level):
  try:
    subs = SUBSCRIPTIONS[level]
    
  except:
    raise http.Http404
    
  context = {
    'key': level,
    'level': subs,
  }
  return TemplateResponse(request, 'members/purchase.html', context)
  
@login_required
def charge (request, level):
  token = request.POST['stripeToken']
  email = request.POST['stripeEmail']
  
  customer = stripe.Customer.create(
    card=token,
    plan=level,
    email=email,
  )
  
  subs = Subscription(
    user = request.user,
    name = request.user.username,
    stype = level,
    stripe_id = customer['id'],
    stripe_subs = customer['subscriptions']['data'][0]['id'],
    expires = timezone.now() + datetime.timedelta(days=365),
  )
  subs.save()
  
  return http.HttpResponseRedirect(reverse('members:home'))
  
@login_required
def members_cancel (request):
  subs = request.user.subscription()
  
  customer = stripe.Customer.retrieve(subs.stripe_id)
  customer.subscriptions.retrieve(subs.stripe_subs).delete()
  
  subs.cancelled = True
  subs.save()
  
  return http.HttpResponseRedirect(reverse('members:home'))
  
@login_required
def edit_name (request):
  subs = request.user.subscription()
  form = NameForm(request.POST or None, initial={'name': subs.name})
  
  if request.POST:
    if form.is_valid():
      subs.name = form.cleaned_data['name']
      subs.save()
      return http.HttpResponseRedirect(reverse('members:home'))
      
  context = {
    'form': form,
    'action': 'Save',
    'icon': 'caret-square-o-right',
  }
  return TemplateResponse(request, 'members/edit-name.html', context)
  