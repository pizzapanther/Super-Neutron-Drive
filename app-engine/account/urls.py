from django.conf import settings
from django.conf.urls import patterns, include, url

urlpatterns = patterns('account.views',
  url(r'^sign-up/$', 'sign_up', name="sign-up"),
  url(r'^sign-up-success/$', 'sign_up_success', name="sign-up-success"),
  
  url(r'^brain-dead/$', 'password_reset', name="password-reset"),
  url(r'^brain-dead/sent/$', 'password_reset_sent', name="password-reset-sent"),
  url(r'^brain-dead/final/$', 'password_reset_final', name="password-reset-final"),
  url(r'^brain-dead/not-anymore/$', 'password_reset_success', name="password-reset-success"),
  
  url(r'^email-verify/$', 'email_verify', name="email-verify"),
)
