from django import http
from django.template.response import TemplateResponse
from django.contrib.auth import authenticate, login
from django.core.urlresolvers import reverse

from .forms import SignUpForm

def sign_up (request):
  form = SignUpForm(request.POST or None)
  
  if request.POST:
    if form.is_valid():
      user = form.save(commit=False)
      user.set_password(form.cleaned_data['password'])
      user.save()
      
      user = authenticate(
        username=form.cleaned_data['username'],
        password=form.cleaned_data['password']
      )
      login(request, user)
      return http.HttpResponseRedirect(reverse('account:sign-up-success'))
      
  context = {
    'form': form,
    'icon': 'pencil-square-o',
    'action': 'Sign Up',
  }
  return TemplateResponse(request, 'account/sign-up.html', context)
  
def sign_up_success (request):
  return TemplateResponse(request, 'account/sign-up-success.html', {})
  
def password_reset (request):
  context = {}
  return TemplateResponse(request, 'account/password-reset.html', context)
  