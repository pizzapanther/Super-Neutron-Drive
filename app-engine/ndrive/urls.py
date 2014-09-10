from django.conf import settings
from django.conf.urls import patterns, include, url


urlpatterns = patterns('ndrive.views',
  url(r'^$', 'hello'),
  url(r'^view-(\d+)$', 'gdrive_webview'),
)
