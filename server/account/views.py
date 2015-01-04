import logging
import traceback

from django import http
from django.template.response import TemplateResponse
from django.contrib.auth import authenticate, login
from django.core.urlresolvers import reverse

from .forms import SignUpForm, ResetForm, PasswordForm
from .models import EmailVerify

def sign_up (request):
  cont = request.GET.get('cont', '')
  init = {}
  if cont:
    init = {'cont': cont}
    
  form = SignUpForm(request.POST or None, initial=init)
  
  if request.POST:
    if form.is_valid():
      user = form.save(commit=False)
      user.set_password(form.cleaned_data['password'])
      user.save()
      
      user.send_verify(request)
      
      user = authenticate(
        username=form.cleaned_data['username'],
        password=form.cleaned_data['password']
      )
      login(request, user)
      
      if form.cleaned_data['cont']:
        return http.HttpResponseRedirect(form.cleaned_data['cont'])
        
      return http.HttpResponseRedirect(reverse('account:sign-up-success'))
      
  context = {
    'form': form,
    'icon': 'pencil-square-o',
    'action': 'Sign Up',
    'continue': cont,
  }
  return TemplateResponse(request, 'account/sign-up.html', context)
  
def sign_up_success (request):
  context = {
    'title': 'Sign Up Successful',
    'message': 'You have successfully signed up!',
    'submessage': 'Don\'t forget to check your e-mail to verify your address.'
  }
  return TemplateResponse(request, 'message.html', context)
  
def password_reset (request):
  form = ResetForm(request.POST or None)
  
  if request.POST:
    if form.is_valid():
      for user in form.cleaned_data['qs']:
        user.send_pwreset(request)
        
      return http.HttpResponseRedirect(reverse('account:password-reset-sent'))
      
  context = {
    'form': form
  }
  return TemplateResponse(request, 'account/password-reset.html', context)
  
def password_reset_sent (request):
  context = {
    'title': 'Password Reset Sent',
    'message': 'Please follow the link sent to your e-mail to reset your password.',
  }
  return TemplateResponse(request, 'message.html', context)
  
def password_reset_final (request):
  token = request.REQUEST.get('token', '')
  email = request.REQUEST.get('email', '')
  
  initial = {'token': token, 'email': email}
  
  try:
    verify = EmailVerify.verify_token(token, email, 1, True)
    
  except:
    logging.info(traceback.format_exc())
    raise http.Http404
    
  form = PasswordForm(request.POST or None, initial=initial)
  if request.POST:
    if form.is_valid():
      verify.used = True
      verify.save()
      
      verify.user.set_password(form.cleaned_data['new_password'])
      verify.user.save()
      return http.HttpResponseRedirect(reverse('account:password-reset-success'))
      
  context = {
    'form': form,
    'icon': 'caret-square-o-right',
    'action': 'Sign Up',
  }
  return TemplateResponse(request, 'account/password-form.html', context)
  
def password_reset_success (request):
  context = {
    'title': 'Password Reset Success',
    'message': 'Your password has been reset successfully!',
  }
  return TemplateResponse(request, 'message.html', context)
  
def email_verify (request):
  token = request.GET.get('token', '')
  email = request.GET.get('email', '')
  
  try:
    verify = EmailVerify.verify_token(token, email)
    
  except:
    logging.info(traceback.format_exc())
    raise http.Http404
    
  verify.user.verified = True
  verify.user.save()
  
  context = {
    'title': 'E-Mail Verification Complete',
    'message': 'Thank you, your e-mail has been successfully verified.'
  }
  return TemplateResponse(request, 'message.html', context)
  