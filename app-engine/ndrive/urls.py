from django.conf import settings
from django.conf.urls import patterns, include, url


urlpatterns = patterns('ndrive.views',
  url(r'^$', 'hello'),
  url(r'^favicon.ico$', 'favicon'),
  url(r'^favicon.png$', 'favicon'),
  url(r'^view-(\d+)$', 'gdrive_webview'),
)
