from django.conf import settings
from django.conf.urls import patterns, include, url

urlpatterns = patterns('editor.views',
  url(r'^login/$', 'login_view'),
  url(r'^logout/(.*)$', 'logout_view'),
  
  url(r'^generate-api-key$', 'gen_api_key'),
)
