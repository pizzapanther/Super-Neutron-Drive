from django.conf import settings
from django.conf.urls import patterns, include, url

urlpatterns = patterns('account.views',
  url(r'^sign-up/$', 'sign_up', name="sign-up"),
  url(r'^sign-up-success/$', 'sign_up_success', name="sign-up-success"),
  
  url(r'^brain-dead/$', 'password_reset', name="password-reset"),
)
