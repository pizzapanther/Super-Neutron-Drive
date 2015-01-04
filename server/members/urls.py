from django.conf import settings
from django.conf.urls import patterns, include, url

urlpatterns = patterns('members.views',
  url(r'^$', 'members_home', name="home"),
  url(r'^login/$', 'members_login', name="login"),
  url(r'^cancel/$', 'members_cancel', name="cancel"),
  url(r'^purchase/(\S+)/$', 'purchase', name="purchase"),
  url(r'^charge/(\S+)/$', 'charge', name="charge"),
  url(r'^edit-name/$', 'edit_name', name="edit-name"),
)
