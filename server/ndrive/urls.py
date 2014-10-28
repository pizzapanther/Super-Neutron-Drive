from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('ndrive.views',
  url(r'^grappelli/', include('grappelli.urls')),
  url(r'^admin/', include(admin.site.urls)),
  
  url(r'^editor/', include('editor.urls', namespace='editor', app_name='editor')),
  url(r'^account/', include('account.urls', namespace='account', app_name='account')),
  
  url(r'^$', 'home'),
  url(r'^favicon.ico$', 'favicon'),
  url(r'^favicon.png$', 'favicon'),
  
  url(r'^help/$', 'page_view', name="help", kwargs={'template': 'pages/help.html'}),
  url(r'^help/neutron-beam-setup$', 'page_view', name="help-nbeam-setup", kwargs={'template': 'pages/help-nbeam-setup.html'}),
  
  url(r'^view-(\d+)$', 'gdrive_webview'),
)
