from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('ndrive.views',
  url(r'^grappelli/', include('grappelli.urls')),
  url(r'^admin/', include(admin.site.urls)),
  url(r'^editor/', include('editor.urls')),
  
  url(r'^$', 'hello'),
  url(r'^favicon.ico$', 'favicon'),
  url(r'^favicon.png$', 'favicon'),
  url(r'^view-(\d+)$', 'gdrive_webview'),
)
