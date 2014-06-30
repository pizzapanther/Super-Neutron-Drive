from django.conf import settings
from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
  url(r'^$', 'ndrive.views.hello'),
)
